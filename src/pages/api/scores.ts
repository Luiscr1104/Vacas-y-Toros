import type { APIRoute } from 'astro';
import getMongoClient from '../../lib/mongodb';
import { addressKey, handleDuelRequest, readBody } from '../../lib/server/duel-http';
import { DuelError, validateName } from '../../lib/server/duel-rules';
import { getDuelStore } from '../../lib/server/duel-store';

export const GET: APIRoute = context => handleDuelRequest(async () => {
    const mode = context.url.searchParams.get('mode') || 'solo';
    if (!['solo', 'vs'].includes(mode)) throw new DuelError(400, 'Modo de ranking inválido.');
    const client = await getMongoClient();
    const db = client.db(process.env.MONGODB_DB || import.meta.env.MONGODB_DB || 'vacas-y-toros');
    if (mode === 'vs') {
        return db.collection('duel_results').find({ verified: true })
            .project({ name: 1, opponent: 1, attempts: 1, time: 1, mode: 1, date: 1, verified: 1 })
            .sort({ date: -1 }).limit(10).toArray();
    }
    return db.collection('scores').find({ mode: 'solo' })
        .project({ name: 1, attempts: 1, time: 1, mode: 1 })
        .sort({ attempts: 1, time: 1 }).limit(10).toArray();
});

export const POST: APIRoute = context => handleDuelRequest(async () => {
    const data = await readBody(context.request);
    const name = validateName(data.name);
    if (data.mode !== 'solo') {
        throw new DuelError(400, 'Los resultados VS solo los registra el servidor al resolver un duelo.');
    }
    if (!Number.isSafeInteger(data.attempts) || Number(data.attempts) < 1 ||
        !Number.isSafeInteger(data.time) || Number(data.time) < 0) {
        throw new DuelError(400, 'Los intentos y el tiempo deben ser enteros válidos.');
    }
    const store = await getDuelStore();
    await store.rateLimit(`solo-score:${addressKey(context)}`, 20, 10 * 60 * 1000);
    const client = await getMongoClient();
    const result = await client.db(process.env.MONGODB_DB || import.meta.env.MONGODB_DB || 'vacas-y-toros').collection('scores').insertOne({
        name, attempts: data.attempts, time: data.time, mode: 'solo', verified: false, date: new Date(),
    });
    return { success: true, id: result.insertedId };
}, 201);
