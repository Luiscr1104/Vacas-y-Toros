import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import { DuelStore } from '../../src/lib/server/duel-store.ts';
import { hashCredential, ROOM_IDLE_MS } from '../../src/lib/server/duel-rules.ts';

const command = (type, value, round = 1) => ({ type, value, round, actionId: randomUUID() });

test('MongoDB arbitrates concurrent players, retries, durable results and recovery', { timeout: 180000 }, async t => {
    const mongo = await MongoMemoryServer.create();
    const client = await MongoClient.connect(mongo.getUri());
    try {
        const db = client.db('vyt_integration_test');
        const store = new DuelStore(db);
        await store.initialize();
        const hashes = ['host', 'guest', 'third'].map(hashCredential);
        const now = new Date();
        let view = await store.create(hashes[0], 'Vaca', now);
        const code = view.code;
        const joins = await Promise.allSettled([
            store.join(code, hashes[1], 'Toro', now),
            store.join(code, hashes[2], 'Tercero', now),
        ]);
        assert.equal(joins.filter(result => result.status === 'fulfilled').length, 1);
        assert.equal(joins.filter(result => result.status === 'rejected' && result.reason.status === 409).length, 1);
        const guestIndex = joins[0].status === 'fulfilled' ? 1 : 2;
        const guestHash = hashes[guestIndex];
        await assert.rejects(store.read(code, hashes[guestIndex === 1 ? 2 : 1], now), { status: 403 });
        await t.test('simultaneous ready commands start once and retain both secrets', async () => {
            await Promise.all([
                store.act(code, hashes[0], command('ready', '0123'), now),
                store.act(code, guestHash, command('ready', '4567'), now),
            ]);
            view = await store.read(code, hashes[0], now);
            assert.equal(view.phase, 'playing');
            assert.equal(view.players.filter(player => player.ready).length, 2);
            assert.equal(view.revealedSecrets, null);
            const serialized = JSON.stringify(view);
            for (const value of ['0123', '4567', 'credentialHash']) assert.ok(!serialized.includes(value));
        });
        const currentHash = view.turn === view.you ? hashes[0] : guestHash;
        const target = currentHash === hashes[0] ? '4567' : '0123';
        await t.test('double submission creates only one winning attempt and one public result', async () => {
            const winningCommand = command('guess', target);
            const later = new Date(now.getTime() + 5000);
            const results = await Promise.all([
                store.act(code, currentHash, winningCommand, later),
                store.act(code, currentHash, winningCommand, later),
            ]);
            assert.ok(results.every(room => room.phase === 'finished'));
            const stored = await db.collection('duel_rooms').findOne({ _id: code });
            assert.equal(stored.players.reduce((sum, player) => sum + player.guesses.length, 0), 1);
            assert.equal(await db.collection('duel_results').countDocuments({}), 1);
            const result = await db.collection('duel_results').findOne({});
            assert.equal(result.time, 5);
            assert.equal(result.attempts, 1);
            assert.equal(result.verified, true);
        });
        await t.test('a new store instance recovers the room; heartbeats and rematches are race safe', async () => {
            const recovered = new DuelStore(db);
            view = await recovered.read(code, hashes[0], new Date(now.getTime() + 6000));
            assert.equal(view.phase, 'finished');
            const priorStarter = (await db.collection('duel_rooms').findOne({ _id: code })).starter;
            const rematch0 = command('rematch');
            const rematch1 = command('rematch');
            await Promise.all([
                recovered.act(code, hashes[0], rematch0),
                recovered.act(code, guestHash, rematch1),
                recovered.read(code, hashes[0]),
            ]);
            view = await recovered.read(code, hashes[0]);
            assert.equal(view.round, 2);
            assert.equal(view.phase, 'setup');
            assert.ok(view.players.every(player => !player.ready && player.guesses.length === 0));
            const room = await db.collection('duel_rooms').findOne({ _id: code });
            assert.equal(room.starter, 1 - priorStarter);
            assert.equal(await db.collection('duel_results').countDocuments({}), 1);
            await recovered.act(code, hashes[0], rematch0);
            assert.equal((await recovered.read(code, hashes[0])).round, 2);
        });
        await t.test('database TTL and persistent rate limits are enforced by application checks', async () => {
            await store.rateLimit('test-limit', 1, 60000, now);
            await assert.rejects(store.rateLimit('test-limit', 1, 60000, now), { status: 429 });
            const expiresLater = await store.create(hashes[0], 'Vaca', now);
            await assert.rejects(store.read(expiresLater.code, hashes[0], new Date(now.getTime() + ROOM_IDLE_MS)), { status: 410 });
        });
        await t.test('a failed public-result projection is recovered without duplicating the win', async () => {
            const fresh = await store.create(hashes[0], 'Vaca');
            await store.join(fresh.code, guestHash, 'Toro');
            await store.act(fresh.code, hashes[0], command('ready', '0123'));
            const started = await store.act(fresh.code, guestHash, command('ready', '4567'));
            const hash = started.turn === started.you ? guestHash : hashes[0];
            const target = hash === hashes[0] ? '4567' : '0123';
            const win = command('guess', target);
            const originalSave = store.saveResult.bind(store);
            let failOnce = true;
            store.saveResult = async room => {
                if (room.result && failOnce) { failOnce = false; throw new Error('Simulated write failure after committing the room'); }
                return originalSave(room);
            };
            await assert.rejects(store.act(fresh.code, hash, win), /Simulated/);
            const recovered = await new DuelStore(db).read(fresh.code, hash);
            assert.equal(recovered.phase, 'finished');
            assert.equal(recovered.players.reduce((sum, player) => sum + player.wins, 0), 1);
            await store.act(fresh.code, hash, win);
            assert.equal(await db.collection('duel_results').countDocuments({ _id: `${fresh.code}:1` }), 1);
        });
    } finally {
        await client.close();
        await mongo.stop();
    }
});
