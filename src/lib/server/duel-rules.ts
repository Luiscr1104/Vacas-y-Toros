import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { evaluateGuess, validateGuess, type Guess } from '../game.ts';
import type { DuelCommand, DuelPhase, DuelView } from '../duel-types.ts';

export const ROOM_IDLE_MS = 30 * 60 * 1000;
export const ROOM_MAX_MS = 24 * 60 * 60 * 1000;
export const ABANDON_MS = 90 * 1000;
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export class DuelError extends Error {
    public status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
        this.name = 'DuelError';
    }
}

interface PrivatePlayer {
    id: string;
    credentialHash: string;
    name: string;
    secret: string | null;
    guesses: Guess[];
    wins: number;
    left: boolean;
    lastSeenAt: Date;
}

export interface DuelResult {
    _id: string;
    name: string;
    opponent: string;
    attempts: number;
    time: number;
    date: Date;
    mode: 'vs';
    verified: true;
}

export interface PrivateRoom {
    _id: string;
    revision: number;
    round: number;
    phase: DuelPhase;
    players: PrivatePlayer[];
    starter: number;
    turn: number;
    winner: string | null;
    reason: 'guessed' | 'forfeit' | null;
    rematch: string[];
    actions: { id: string; actor: string; fingerprint: string }[];
    createdAt: Date;
    expiresAt: Date;
    startedAt: Date | null;
    endedAt: Date | null;
    result: DuelResult | null;
}

export const newCredential = () => randomBytes(32).toString('hex');
export const hashCredential = (token: string) => createHash('sha256').update(token).digest('hex');
export const newRoomCode = () => Array.from({ length: 8 }, () => alphabet[randomInt(alphabet.length)]).join('');
export const validRoomCode = (value: string) => /^[A-HJ-NP-Z2-9]{8}$/.test(value);

export function validateName(value: unknown): string {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 15 || /[\p{Cc}\p{Cf}]/u.test(value)) {
        throw new DuelError(400, 'El apodo debe tener entre 1 y 15 caracteres, sin caracteres de control.');
    }
    return value.trim();
}

function newPlayer(credentialHash: string, name: string, now: Date): PrivatePlayer {
    return { id: randomUUID(), credentialHash, name, secret: null, guesses: [], wins: 0, left: false, lastSeenAt: now };
}

export function createRoom(credentialHash: string, name: string, now = new Date()): PrivateRoom {
    return {
        _id: newRoomCode(), revision: 0, round: 1, phase: 'waiting',
        players: [newPlayer(credentialHash, validateName(name), now)],
        starter: randomInt(2), turn: 0, winner: null, reason: null, rematch: [], actions: [],
        createdAt: now, expiresAt: new Date(now.getTime() + ROOM_IDLE_MS),
        startedAt: null, endedAt: null, result: null,
    };
}

export function assertActive(room: PrivateRoom, now: Date) {
    if (room.expiresAt.getTime() <= now.getTime()) throw new DuelError(410, 'Esta sala caducó. Crea un nuevo duelo.');
}

export function playerIndex(room: PrivateRoom, hash: string): number {
    const index = room.players.findIndex(player => {
        const a = Buffer.from(player.credentialHash, 'hex');
        const b = Buffer.from(hash, 'hex');
        return a.length === b.length && timingSafeEqual(a, b);
    });
    if (index < 0) throw new DuelError(403, 'Entra a la sala con tu apodo para jugar.');
    return index;
}

export function joinRoom(room: PrivateRoom, hash: string, name: string, now: Date): PrivateRoom {
    assertActive(room, now);
    if (room.players.some(player => player.credentialHash === hash)) return room;
    if (room.phase !== 'waiting' || room.players.length !== 1) throw new DuelError(409, 'Esta sala ya está llena o cerrada.');
    const next = structuredClone(room);
    next.players.push(newPlayer(hash, validateName(name), now));
    next.phase = 'setup';
    next.revision++;
    next.expiresAt = new Date(Math.min(now.getTime() + ROOM_IDLE_MS, room.createdAt.getTime() + ROOM_MAX_MS));
    return next;
}

function finish(room: PrivateRoom, winner: number, reason: 'guessed' | 'forfeit', now: Date) {
    room.phase = 'finished';
    room.winner = room.players[winner].id;
    room.reason = reason;
    room.endedAt = now;
    room.players[winner].wins++;
    if (reason === 'guessed') {
        room.result = {
            _id: `${room._id}:${room.round}`,
            name: room.players[winner].name,
            opponent: room.players[1 - winner].name,
            attempts: room.players[winner].guesses.length,
            time: Math.max(0, Math.floor((now.getTime() - room.startedAt!.getTime()) / 1000)),
            date: now, mode: 'vs', verified: true,
        };
    }
}

export function parseCommand(data: Record<string, unknown>): DuelCommand {
    if (!['ready', 'guess', 'rematch', 'leave', 'claim_abandon'].includes(String(data.type)) ||
        typeof data.actionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.actionId) ||
        !Number.isSafeInteger(data.round) || Number(data.round) < 1) {
        throw new DuelError(400, 'Acción inválida. Actualiza el estado de la sala.');
    }
    if ((data.type === 'ready' || data.type === 'guess') &&
        (typeof data.value !== 'string' || validateGuess(data.value))) {
        throw new DuelError(400, 'Usa cuatro dígitos diferentes, del 0 al 9.');
    }
    return { type: data.type as DuelCommand['type'], actionId: data.actionId, round: Number(data.round), value: typeof data.value === 'string' ? data.value : undefined };
}

/** Pure transitions. MongoDB commits the returned state with a revision check. */
export function applyCommand(room: PrivateRoom, hash: string, command: DuelCommand, now: Date): PrivateRoom {
    assertActive(room, now);
    const index = playerIndex(room, hash);
    const player = room.players[index];
    const fingerprint = hashCredential(JSON.stringify([command.type, command.round, command.value]));
    const acknowledged = room.actions.find(action => action.id === command.actionId && action.actor === player.id);
    if (acknowledged) {
        if (acknowledged.fingerprint !== fingerprint) throw new DuelError(409, 'No reutilices una acción para otra jugada.');
        return room;
    }
    if (command.round !== room.round) throw new DuelError(409, 'La ronda cambió. Ya estamos actualizando el tablero.');
    if (player.left || room.phase === 'closed') throw new DuelError(409, 'Esta sala está cerrada.');
    const next = structuredClone(room);
    const me = next.players[index];

    switch (command.type) {
        case 'ready':
            if (room.phase !== 'setup' || me.secret !== null) throw new DuelError(409, 'Tu código ya está confirmado o la partida ya comenzó.');
            if (!command.value || validateGuess(command.value)) throw new DuelError(400, 'Código inválido.');
            me.secret = command.value;
            if (next.players.length === 2 && next.players.every(item => item.secret !== null)) {
                next.phase = 'playing';
                next.turn = next.starter;
                next.startedAt = now;
            }
            break;
        case 'guess': {
            if (room.phase !== 'playing' || room.turn !== index) throw new DuelError(409, 'Espera: todavía no es tu turno.');
            if (!command.value || validateGuess(command.value)) throw new DuelError(400, 'Intento inválido.');
            if (me.guesses.some(guess => guess.number === command.value)) throw new DuelError(409, 'Ya probaste ese número. Prueba otra idea.');
            const result = evaluateGuess(command.value, next.players[1 - index].secret!);
            me.guesses.push({ number: command.value, ...result });
            if (result.bulls === 4) finish(next, index, 'guessed', now);
            else next.turn = 1 - index;
            break;
        }
        case 'rematch':
            if (room.phase !== 'finished' || room.players.some(item => item.left)) throw new DuelError(409, 'No se puede pedir revancha en este momento.');
            if (!next.rematch.includes(me.id)) next.rematch.push(me.id);
            if (next.rematch.length === 2) {
                next.round++;
                next.starter = 1 - next.starter;
                next.turn = next.starter;
                next.phase = 'setup';
                next.winner = null;
                next.reason = null;
                next.startedAt = null;
                next.endedAt = null;
                next.result = null;
                next.rematch = [];
                next.players.forEach(item => { item.secret = null; item.guesses = []; });
            }
            break;
        case 'leave':
            me.left = true;
            if (room.phase === 'playing') finish(next, 1 - index, 'forfeit', now);
            else next.phase = 'closed';
            break;
        case 'claim_abandon': {
            const rival = next.players[1 - index];
            if (!rival || now.getTime() - rival.lastSeenAt.getTime() < ABANDON_MS) {
                throw new DuelError(409, 'Tu rival todavía tiene tiempo para volver.');
            }
            if (!['setup', 'playing'].includes(room.phase)) throw new DuelError(409, 'No hay un duelo activo que cerrar.');
            rival.left = true;
            if (room.phase === 'playing') finish(next, index, 'forfeit', now);
            else next.phase = 'closed';
            break;
        }
    }
    me.lastSeenAt = now;
    next.revision++;
    next.expiresAt = new Date(Math.min(now.getTime() + ROOM_IDLE_MS, room.createdAt.getTime() + ROOM_MAX_MS));
    next.actions = [...next.actions, { id: command.actionId, actor: me.id, fingerprint }].slice(-64);
    return next;
}

export function roomView(room: PrivateRoom, hash: string, now: Date): DuelView {
    assertActive(room, now);
    const me = room.players[playerIndex(room, hash)];
    const finished = room.phase === 'finished' || room.phase === 'closed';
    return {
        code: room._id, revision: room.revision, round: room.round, phase: room.phase, you: me.id,
        turn: room.phase === 'playing' ? room.players[room.turn].id : null,
        players: room.players.map(player => ({
            id: player.id, name: player.name, ready: player.secret !== null, guesses: player.guesses,
            wins: player.wins, left: player.left, lastSeenAt: player.lastSeenAt.getTime(),
        })),
        winner: room.winner, reason: room.reason, rematch: room.rematch,
        revealedSecrets: finished ? Object.fromEntries(room.players.filter(player => player.secret !== null).map(player => [player.id, player.secret!])) : null,
        acknowledgedActions: room.actions.filter(action => action.actor === me.id).map(action => action.id),
        startedAt: room.startedAt?.getTime() ?? null, endedAt: room.endedAt?.getTime() ?? null,
        expiresAt: room.expiresAt.getTime(), serverNow: now.getTime(),
    };
}
