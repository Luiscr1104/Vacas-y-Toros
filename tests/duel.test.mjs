import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import {
    applyCommand, createRoom, joinRoom, roomView, parseCommand, validateName,
    hashCredential, validRoomCode, ROOM_IDLE_MS, ABANDON_MS,
} from '../src/lib/server/duel-rules.ts';

const host = hashCredential('host-secret-session');
const guest = hashCredential('guest-secret-session');
const outsider = hashCredential('outsider');
const start = new Date('2026-11-25T12:00:00Z');
const later = seconds => new Date(start.getTime() + seconds * 1000);
const action = (type, value, round = 1) => ({ type, value, round, actionId: randomUUID() });

function setup() {
    const room = joinRoom(createRoom(host, 'Vaca', start), guest, 'Toro', start);
    room.starter = 0;
    return room;
}

function playing() {
    let room = setup();
    room = applyCommand(room, host, action('ready', '0123'), later(1));
    return applyCommand(room, guest, action('ready', '4567'), later(2));
}

test('room codes are usable, names are bounded and two slots cannot be hijacked', () => {
    const room = setup();
    assert.ok(validRoomCode(room._id));
    assert.equal(joinRoom(room, host, 'Other', start), room);
    assert.throws(() => joinRoom(room, outsider, 'Third', start), /llena/);
    assert.throws(() => roomView(room, outsider, start), /apodo/);
    for (const value of ['', 'abcdefghijklmnop', {}, 'a\nb', 'a\u200bb']) assert.throws(() => validateName(value));
    assert.equal(validateName('  Luis  '), 'Luis');
});

test('secrets and credentials are never exposed in active views', () => {
    const room = playing();
    for (const hash of [host, guest]) {
        const view = roomView(room, hash, later(3));
        assert.equal(view.revealedSecrets, null);
        const data = JSON.stringify(view);
        for (const secret of ['0123', '4567', host, guest, 'credentialHash', 'fingerprint']) assert.ok(!data.includes(secret));
        assert.equal(view.players.every(player => player.ready), true);
    }
});

test('the second confirmation starts exactly once, with a server clock', () => {
    const room = playing();
    assert.equal(room.phase, 'playing');
    assert.equal(room.startedAt.getTime(), later(2).getTime());
    assert.throws(() => applyCommand(room, host, action('ready', '9876'), later(3)));
});

test('turns alternate and forged/repeated/out-of-turn attempts cannot change state', () => {
    let room = playing();
    assert.throws(() => applyCommand(room, guest, action('guess', '0123'), later(3)), /turno/);
    room = applyCommand(room, host, action('guess', '4589'), later(4));
    assert.deepEqual(room.players[0].guesses[0], { number: '4589', bulls: 2, cows: 0 });
    assert.equal(room.turn, 1);
    assert.throws(() => applyCommand(room, host, action('guess', '4567'), later(5)), /turno/);
    room = applyCommand(room, guest, action('guess', '0189'), later(6));
    assert.throws(() => applyCommand(room, host, action('guess', '4589'), later(7)), /Ya probaste/);
    assert.throws(() => applyCommand(room, host, action('guess', '1111'), later(7)), /inválido/);
});

test('same action is idempotent, while reusing its identifier with a different payload is rejected', () => {
    const original = playing();
    const command = action('guess', '4589');
    const next = applyCommand(original, host, command, later(4));
    assert.equal(applyCommand(next, host, command, later(5)), next);
    assert.throws(() => applyCommand(next, host, { ...command, value: '4567' }, later(5)), /reutilices/);
    assert.equal(original.players[0].guesses.length, 0);
    assert.equal(next.players[0].guesses.length, 1);
});

test('victory, time and the public result are computed only by the server', () => {
    const room = applyCommand(playing(), host, action('guess', '4567'), later(17));
    assert.equal(room.phase, 'finished');
    assert.equal(room.winner, room.players[0].id);
    assert.equal(room.result.time, 15);
    assert.equal(room.result.attempts, 1);
    assert.equal(room.players[0].wins, 1);
    assert.deepEqual(roomView(room, host, later(18)).revealedSecrets, {
        [room.players[0].id]: '0123', [room.players[1].id]: '4567',
    });
    assert.throws(() => applyCommand(room, guest, action('guess', '0123'), later(18)));
});

test('rematch requires both players, alternates the starter and rejects stale commands', () => {
    let room = applyCommand(playing(), host, action('guess', '4567'), later(10));
    room = applyCommand(room, host, action('rematch'), later(11));
    assert.equal(room.round, 1);
    const confirmation = action('rematch');
    room = applyCommand(room, guest, confirmation, later(12));
    assert.equal(room.round, 2);
    assert.equal(room.phase, 'setup');
    assert.equal(room.starter, 1);
    assert.equal(room.result, null);
    assert.ok(room.players.every(player => player.secret === null && player.guesses.length === 0));
    assert.equal(room.players[0].wins, 1);
    assert.equal(applyCommand(room, guest, confirmation, later(13)), room);
    assert.throws(() => applyCommand(room, host, action('ready', '1234', 1), later(13)), /ronda/);
});

test('absence needs a grace period; abandonment does not produce a verified public result', () => {
    const room = playing();
    assert.throws(() => applyCommand(room, host, action('claim_abandon'), later(30)), /tiempo/);
    const abandoned = applyCommand(room, host, action('claim_abandon'), new Date(later(2).getTime() + ABANDON_MS));
    assert.equal(abandoned.reason, 'forfeit');
    assert.equal(abandoned.result, null);
    assert.equal(abandoned.players[1].left, true);
    assert.throws(() => applyCommand(abandoned, host, action('rematch'), later(100)));
    const left = applyCommand(room, host, action('leave'), later(3));
    assert.equal(left.winner, left.players[1].id);
    assert.equal(left.result, null);
});

test('expiry is enforced even before MongoDB has cleaned up its TTL document', () => {
    const room = createRoom(host, 'Vaca', start);
    const expired = new Date(start.getTime() + ROOM_IDLE_MS);
    assert.throws(() => joinRoom(room, guest, 'Toro', expired), /caducó/);
    assert.throws(() => roomView(room, host, expired), /caducó/);
});

test('commands reject malformed inputs and ignore forged client result fields', () => {
    for (const payload of [{}, { type: 'reveal_secret' }, { type: 'guess', value: '1111', actionId: randomUUID(), round: 1 }]) assert.throws(() => parseCommand(payload));
    const valid = parseCommand({ ...action('guess', '0123'), bulls: 4, time: 0, winner: 'me' });
    assert.equal('bulls' in valid, false);
    assert.equal('winner' in valid, false);
});
