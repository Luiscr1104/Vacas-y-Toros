import test from 'node:test';
import assert from 'node:assert/strict';
import { readBody } from '../src/lib/server/duel-http.ts';

const request = (body, headers = {}) => new Request('https://game.example/api/rooms', {
    method: 'POST', headers: { origin: 'https://game.example', 'content-type': 'application/json', ...headers }, body,
});

test('room requests require same-origin JSON objects with a strict byte limit', async () => {
    assert.deepEqual(await readBody(request('{"name":"Luis"}')), { name: 'Luis' });
    for (const body of ['null', '[]', '5', '{']) await assert.rejects(readBody(request(body)), { status: 400 });
    await assert.rejects(readBody(request('{}', { origin: 'https://evil.example' })), { status: 403 });
    await assert.rejects(readBody(request('{}', { 'content-type': 'text/plain' })), { status: 415 });
    await assert.rejects(readBody(request(JSON.stringify({ name: 'a'.repeat(3000) }))), { status: 413 });
    await assert.rejects(readBody(request(JSON.stringify({ name: '🐮'.repeat(600) }))), { status: 413 });
});
