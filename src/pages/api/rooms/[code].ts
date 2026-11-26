import type { APIRoute } from 'astro';
import { addressKey, handleDuelRequest, readBody, sessionHash } from '../../../lib/server/duel-http';
import { DuelError, parseCommand, validRoomCode, validateName } from '../../../lib/server/duel-rules';
import { getDuelStore } from '../../../lib/server/duel-store';

function roomCode(code: string | undefined) {
    if (!code || !validRoomCode(code)) throw new DuelError(400, 'El código de sala debe tener 8 letras y números.');
    return code;
}

export const GET: APIRoute = context => handleDuelRequest(async () => {
    const code = roomCode(context.params.code);
    const hash = sessionHash(context);
    const store = await getDuelStore();
    await store.rateLimit(`poll:${hash}`, 90, 60 * 1000);
    return store.read(code, hash);
});

export const POST: APIRoute = context => handleDuelRequest(async () => {
    const code = roomCode(context.params.code);
    const data = await readBody(context.request);
    const store = await getDuelStore();
    if (data.type === 'join') {
        const name = validateName(data.name);
        await store.rateLimit(`join:${addressKey(context)}`, 45, 10 * 60 * 1000);
        return store.join(code, sessionHash(context, true), name);
    }
    const hash = sessionHash(context);
    const command = parseCommand(data);
    await store.rateLimit(`action:${hash}`, 100, 60 * 1000);
    return store.act(code, hash, command);
});
