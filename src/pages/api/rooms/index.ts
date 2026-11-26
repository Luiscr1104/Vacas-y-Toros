import type { APIRoute } from 'astro';
import { addressKey, handleDuelRequest, readBody, sessionHash } from '../../../lib/server/duel-http';
import { validateName } from '../../../lib/server/duel-rules';
import { getDuelStore } from '../../../lib/server/duel-store';

export const POST: APIRoute = context => handleDuelRequest(async () => {
    const data = await readBody(context.request);
    const name = validateName(data.name);
    const store = await getDuelStore();
    await store.rateLimit(`create:${addressKey(context)}`, 12, 10 * 60 * 1000);
    return store.create(sessionHash(context, true), name);
}, 201);
