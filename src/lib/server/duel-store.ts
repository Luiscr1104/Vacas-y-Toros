import type { Db } from 'mongodb';
import getMongoClient from '../mongodb.ts';
import type { DuelCommand } from '../duel-types';
import {
    applyCommand, assertActive, createRoom, DuelError, joinRoom, playerIndex,
    roomView, ROOM_IDLE_MS, ROOM_MAX_MS, type DuelResult, type PrivateRoom,
} from './duel-rules.ts';

interface RateBucket { _id: string; count: number; expiresAt: Date; }

export class DuelStore {
    private db: Db;
    constructor(db: Db) { this.db = db; }

    async initialize() {
        await Promise.all([
            this.rooms.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
            this.db.collection('duel_limits').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
            this.db.collection('duel_results').createIndex({ date: -1 }),
        ]);
    }

    private get rooms() { return this.db.collection<PrivateRoom>('duel_rooms'); }

    async rateLimit(key: string, limit: number, windowMs: number, now = new Date()) {
        const bucket = Math.floor(now.getTime() / windowMs);
        const collection = this.db.collection<RateBucket>('duel_limits');
        const document = await collection.findOneAndUpdate(
            { _id: `${key}:${bucket}` },
            { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((bucket + 2) * windowMs) } },
            { upsert: true, returnDocument: 'after' },
        );
        if (!document || document.count > limit) throw new DuelError(429, 'Muchas peticiones seguidas. Espera un minuto y vuelve a intentarlo.');
    }

    async create(hash: string, name: string, now = new Date()) {
        for (let attempt = 0; attempt < 4; attempt++) {
            const room = createRoom(hash, name, now);
            try {
                await this.rooms.insertOne(room);
                return roomView(room, hash, now);
            } catch (error) {
                if ((error as { code?: number }).code !== 11000) throw error;
            }
        }
        throw new DuelError(503, 'No pudimos crear la sala. Inténtalo de nuevo.');
    }

    private async load(code: string, now: Date) {
        const room = await this.rooms.findOne({ _id: code });
        if (!room) throw new DuelError(404, 'No encontramos esa sala. Revisa el código o crea un duelo.');
        assertActive(room, now); // MongoDB TTL cleanup is asynchronous, so never rely on it for authorization.
        return room;
    }

    private async saveResult(room: PrivateRoom) {
        if (!room.result) return;
        // Idempotent projection, retried by every read/action before a rematch can clear the result.
        // A network failure after committing a win can never create a duplicate or lose the result.
        await this.db.collection<DuelResult>('duel_results').updateOne(
            { _id: room.result._id }, { $setOnInsert: room.result }, { upsert: true },
        );
    }

    async read(code: string, hash: string, now = new Date()) {
        const room = await this.load(code, now);
        const index = playerIndex(room, hash);
        await this.saveResult(room);
        if (!room.players[index].left && room.phase !== 'closed') {
            const expiresAt = new Date(Math.min(now.getTime() + ROOM_IDLE_MS, room.createdAt.getTime() + ROOM_MAX_MS));
            // Revision participates in presence updates too: a concurrent command must reload, not overwrite a heartbeat.
            const updated = await this.rooms.findOneAndUpdate(
                { _id: code, revision: room.revision },
                { $max: { [`players.${index}.lastSeenAt`]: now, expiresAt }, $inc: { revision: 1 } },
                { returnDocument: 'after' },
            );
            if (updated) return roomView(updated, hash, now);
            return roomView(await this.load(code, now), hash, now);
        }
        return roomView(room, hash, now);
    }

    private async mutate(code: string, hash: string, transition: (room: PrivateRoom) => PrivateRoom, now: Date) {
        for (let attempt = 0; attempt < 8; attempt++) {
            const room = await this.load(code, now);
            await this.saveResult(room);
            const next = transition(room);
            if (next === room) return roomView(room, hash, now);
            const committed = await this.rooms.replaceOne({ _id: code, revision: room.revision }, next);
            if (committed.modifiedCount === 1) {
                await this.saveResult(next);
                return roomView(next, hash, now);
            }
        }
        throw new DuelError(409, 'La sala cambió mientras jugabas. Reintenta la misma jugada.');
    }

    join(code: string, hash: string, name: string, now = new Date()) {
        return this.mutate(code, hash, room => joinRoom(room, hash, name, now), now);
    }

    act(code: string, hash: string, command: DuelCommand, now = new Date()) {
        return this.mutate(code, hash, room => applyCommand(room, hash, command, now), now);
    }
}

let storePromise: Promise<DuelStore> | undefined;

export function getDuelStore() {
    storePromise ??= getMongoClient().then(async client => {
        const store = new DuelStore(client.db(process.env.MONGODB_DB || import.meta.env?.MONGODB_DB || 'vacas-y-toros'));
        await store.initialize();
        return store;
    }).catch(error => { storePromise = undefined; throw error; });
    return storePromise;
}
