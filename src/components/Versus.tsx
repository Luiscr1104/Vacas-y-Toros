import { useCallback, useEffect, useRef, useState } from 'react';
import type { DuelCommand, DuelView } from '../lib/duel-types';
import { audio } from '../lib/audio';
import Icon from './Icon';
import VSLobby from './VSLobby';
import VSGame from './VSGame';

class RoomRequestError extends Error {
    constructor(public status: number, message: string) { super(message); }
}

async function requestRoom(path: string, body?: unknown, signal?: AbortSignal): Promise<DuelView> {
    const response = await fetch(path, {
        method: body ? 'POST' : 'GET',
        credentials: 'same-origin', cache: 'no-store',
        headers: body ? { 'Content-Type': 'application/json' } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(10000)]) : AbortSignal.timeout(10000),
    });
    const data = await response.json();
    if (!response.ok) throw new RoomRequestError(response.status, data.error || 'No pudimos actualizar la sala.');
    return data as DuelView;
}

export default function Versus({ onExit }: { onExit: () => void }) {
    const [room, setRoom] = useState<DuelView | null>(null);
    const [watchCode, setWatchCode] = useState('');
    const [initialCode, setInitialCode] = useState('');
    const [initializing, setInitializing] = useState(true);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [offline, setOffline] = useState(false);
    const [needsRetry, setNeedsRetry] = useState(false);
    const [watchEpoch, setWatchEpoch] = useState(0);
    const [terminal, setTerminal] = useState(false);
    const currentRoom = useRef<DuelView | null>(null);
    const pending = useRef<DuelCommand | null>(null);
    const locked = useRef(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        const code = new URLSearchParams(window.location.search).get('room')?.toUpperCase() || '';
        setInitialCode(code);
        if (code) setWatchCode(code);
        else setInitializing(false);
        return () => { mounted.current = false; };
    }, []);

    const accept = useCallback((snapshot: DuelView) => {
        if (!mounted.current) return;
        const previous = currentRoom.current;
        if (previous && snapshot.code === previous.code && snapshot.revision < previous.revision) return;
        if (previous?.phase !== 'playing' && snapshot.phase === 'playing') audio.play('start');
        if (previous?.phase === 'playing' && snapshot.phase === 'finished') audio.play(snapshot.winner === snapshot.you ? 'win' : 'lost');
        currentRoom.current = snapshot;
        setRoom(snapshot);
        setOffline(false);
        setInitializing(false);
        if (pending.current && snapshot.acknowledgedActions.includes(pending.current.actionId)) {
            pending.current = null;
            setNeedsRetry(false);
            setError('');
        }
    }, []);

    useEffect(() => {
        if (!watchCode) return;
        const controller = new AbortController();
        let timer: ReturnType<typeof setTimeout> | undefined;
        let inFlight = false;
        let stopped = false;
        let failures = 0;
        const poll = async () => {
            if (controller.signal.aborted || stopped || inFlight || document.hidden) return;
            inFlight = true;
            try {
                const snapshot = await requestRoom(`/api/rooms/${encodeURIComponent(watchCode)}`, undefined, controller.signal);
                accept(snapshot);
                failures = 0;
                if (!pending.current) setError('');
                if (snapshot.phase === 'closed' || snapshot.players.find(player => player.id === snapshot.you)?.left) stopped = true;
            } catch (failure) {
                if (controller.signal.aborted) return;
                if (failure instanceof RoomRequestError && [400, 403, 404, 410].includes(failure.status)) {
                    stopped = true;
                    if (failure.status !== 403 || currentRoom.current) setError(failure.message);
                    if (currentRoom.current) { setOffline(true); setTerminal(true); }
                } else {
                    failures++;
                    setOffline(true);
                    setError(failure instanceof Error ? failure.message : 'Conexión interrumpida. Reintentaremos automáticamente.');
                }
                setInitializing(false);
            } finally {
                inFlight = false;
                if (!controller.signal.aborted && !stopped) timer = setTimeout(poll, failures ? Math.min(10000, 1500 * 2 ** failures) : 1800);
            }
        };
        const resume = () => {
            clearTimeout(timer);
            if (!document.hidden) void poll();
        };
        void poll();
        document.addEventListener('visibilitychange', resume);
        window.addEventListener('online', resume);
        return () => {
            controller.abort();
            clearTimeout(timer);
            document.removeEventListener('visibilitychange', resume);
            window.removeEventListener('online', resume);
        };
    }, [watchCode, watchEpoch, accept]);

    const enter = async (name: string, code?: string) => {
        if (locked.current) return;
        locked.current = true;
        setBusy(true);
        setError('');
        try {
            const snapshot = await requestRoom(code ? `/api/rooms/${encodeURIComponent(code)}` : '/api/rooms', code ? { type: 'join', name } : { name });
            if (!mounted.current) return;
            accept(snapshot);
            const url = new URL(window.location.href);
            url.searchParams.set('room', snapshot.code);
            window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
            setWatchCode(snapshot.code);
            setWatchEpoch(previous => previous + 1);
            setTerminal(false);
        } catch (failure) {
            if (mounted.current) setError(failure instanceof Error ? failure.message : 'No pudimos entrar.');
        } finally {
            locked.current = false;
            if (mounted.current) setBusy(false);
        }
    };

    const send = async (type: DuelCommand['type'], value?: string): Promise<boolean> => {
        const snapshot = currentRoom.current;
        if (!snapshot || locked.current) return false;
        locked.current = true;
        setBusy(true);
        setError('');
        const command = pending.current || { type, value, actionId: crypto.randomUUID(), round: snapshot.round };
        pending.current = command;
        try {
            const updated = await requestRoom(`/api/rooms/${snapshot.code}`, command);
            accept(updated);
            pending.current = null;
            if (mounted.current) setNeedsRetry(false);
            return true;
        } catch (failure) {
            // A poll may have acknowledged the command before its HTTP response timed out.
            // Do not resurrect a retry lock for an action we already know was committed.
            if (currentRoom.current?.acknowledgedActions.includes(command.actionId)) {
                pending.current = null;
                if (mounted.current) { setNeedsRetry(false); setError(''); setOffline(false); }
                return true;
            }
            if (mounted.current) {
                setError(failure instanceof Error ? failure.message : 'No pudimos confirmar el envío.');
                if (failure instanceof RoomRequestError && failure.status < 500 && failure.status !== 429) {
                    pending.current = null;
                    setNeedsRetry(false);
                } else {
                    setNeedsRetry(true);
                    setOffline(true);
                }
            }
            return false;
        } finally {
            locked.current = false;
            if (mounted.current) setBusy(false);
        }
    };

    const leave = async () => {
        if (!room || terminal || room.phase === 'closed' || room.players.find(player => player.id === room.you)?.left) { onExit(); return; }
        const active = ['playing', 'setup', 'waiting'].includes(room.phase);
        if (active && !window.confirm('¿Salir del duelo? Si ya empezó, contará como abandono.')) return;
        if (pending.current) {
            if (window.confirm('Hay una acción sin confirmar. Puedes cerrar esta vista, pero tu rival tendrá que esperar para declarar el abandono. ¿Salir igualmente?')) onExit();
            return;
        }
        if (await send('leave')) onExit();
    };

    return (
        <main className="versus-page">
            <div className="game-topline">
                <button className="text-button" disabled={busy} onClick={() => void leave()}><Icon name="back" size={18} /> {room ? 'Salir del duelo' : 'Volver al rancho'}</button>
                <span className="mode-pill"><span className="status-dot" /> DUELO CON ÁRBITRO</span>
            </div>
            {initializing ? <section className="duel-loading paper-card" role="status"><Icon name="users" size={32} /><h1>Buscando tu lugar en el rancho…</h1><p>Si ya estabas jugando, recuperaremos la partida.</p></section> : room ? (
                <>
                    {error && <div className="duel-notice" role="alert"><span>{error}{needsRetry ? ' Reintenta: no repetiremos una jugada ya aceptada.' : ''}</span>{needsRetry && <button className="text-button" disabled={busy} onClick={() => { if (pending.current) void send(pending.current.type, pending.current.value); }}>Reintentar envío</button>}</div>}
                    <VSGame room={room} busy={busy || needsRetry} offline={offline} onAction={send} />
                </>
            ) : <VSLobby key={initialCode} initialCode={initialCode} busy={busy} error={error} onCreate={name => enter(name)} onJoin={(code, name) => enter(name, code)} />}
        </main>
    );
}
