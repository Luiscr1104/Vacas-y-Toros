import type { APIContext } from 'astro';
import { DuelError, hashCredential, newCredential } from './duel-rules.ts';

const cookieName = 'vyt_duel_session';
export const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
        ...(status === 429 ? { 'Retry-After': '60' } : {}),
    },
});

export async function readBody(request: Request): Promise<Record<string, unknown>> {
    if (request.headers.get('origin') !== new URL(request.url).origin) throw new DuelError(403, 'Esta acción debe hacerse desde el juego.');
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new DuelError(415, 'Envía los datos como JSON.');
    if (!request.body) throw new DuelError(400, 'Faltan los datos de la acción.');
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let length = 0;
    try {
        while (true) {
            const part = await reader.read();
            if (part.done) break;
            length += part.value.byteLength;
            if (length > 2048) { await reader.cancel(); throw new DuelError(413, 'La acción es demasiado grande.'); }
            chunks.push(part.value);
        }
    } finally { reader.releaseLock(); }
    try {
        const data: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error();
        return data as Record<string, unknown>;
    } catch { throw new DuelError(400, 'Los datos de la acción no son válidos.'); }
}

export function sessionHash(context: APIContext, create = false): string {
    let token = context.cookies.get(cookieName)?.value;
    if (!token || !/^[0-9a-f]{64}$/.test(token)) {
        if (!create) throw new DuelError(403, 'Entra a la sala con tu apodo para jugar.');
        token = newCredential();
        context.cookies.set(cookieName, token, {
            httpOnly: true, secure: import.meta.env.PROD, sameSite: 'lax', path: '/', maxAge: 7 * 24 * 60 * 60,
        });
    }
    return hashCredential(token);
}

export function addressKey(context: APIContext) {
    let address = 'unknown';
    try { address = context.clientAddress; } catch { /* Some preview adapters have no client address. */ }
    return hashCredential(address);
}

export async function handleDuelRequest(callback: () => Promise<unknown>, success = 200) {
    try { return json(await callback(), success); }
    catch (error) {
        if (error instanceof DuelError) return json({ error: error.message }, error.status);
        // Never serialize database errors, connection strings, credentials or secret codes.
        console.error('Duel storage unavailable:', error instanceof Error ? error.name : 'UnknownError');
        return json({ error: 'No pudimos conectar con las salas. Revisa MongoDB o inténtalo de nuevo en un momento.' }, 503);
    }
}
