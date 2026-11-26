import { useEffect, useState } from 'react';
import type { DuelCommand, DuelView } from '../lib/duel-types';
import { formatTime, validateGuess } from '../lib/game';
import Icon from './Icon';
import Mascot from './Mascot';
import NumericEntry from './NumericEntry';
import GuessHistory from './GuessHistory';

interface VSGameProps {
    room: DuelView;
    busy: boolean;
    offline: boolean;
    onAction: (type: DuelCommand['type'], value?: string) => Promise<boolean>;
}

export default function VSGame({ room, busy, offline, onAction }: VSGameProps) {
    const me = room.players.find(player => player.id === room.you)!;
    const rival = room.players.find(player => player.id !== room.you);
    const [input, setInput] = useState('');
    const [secret, setSecret] = useState('');
    const [masked, setMasked] = useState(true);
    const [error, setError] = useState('');
    const [shareMessage, setShareMessage] = useState('');
    const [scratchpad, setScratchpad] = useState<string[]>([]);
    const [now, setNow] = useState(room.serverNow);
    const myTurn = room.phase === 'playing' && room.turn === room.you;
    const finished = room.phase === 'finished' || room.phase === 'closed';
    const rivalAway = rival && (rival.left || now - rival.lastSeenAt > 15000);
    const canClaim = rival && !rival.left && now - rival.lastSeenAt >= 90000 && ['playing', 'setup'].includes(room.phase);
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}?room=${room.code}` : '';
    const elapsed = room.startedAt ? Math.max(0, Math.floor(((room.endedAt ?? now) - room.startedAt) / 1000)) : 0;

    useEffect(() => {
        const receivedAt = Date.now();
        setNow(room.serverNow);
        const timer = setInterval(() => setNow(room.serverNow + Date.now() - receivedAt), 1000);
        return () => clearInterval(timer);
    }, [room.serverNow]);
    useEffect(() => { setInput(''); setError(''); }, [me.guesses.length]);
    useEffect(() => { if (me.ready) setSecret(''); }, [me.ready]);
    useEffect(() => {
        setInput(''); setSecret(''); setScratchpad([]); setError(''); setMasked(true);
    }, [room.round]);

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareMessage('¡Enlace copiado! Mándaselo a tu rival.');
        } catch {
            setShareMessage('No pudimos copiarlo automáticamente. Selecciona el enlace de abajo y cópialo.');
        }
    };

    const share = async () => {
        if (!navigator.share) { await copyLink(); return; }
        try { await navigator.share({ title: '¡Duelo en Vacas y Toros!', text: '¿Quién descifra el código primero?', url: shareUrl }); }
        catch (failure) { if (!(failure instanceof Error && failure.name === 'AbortError')) await copyLink(); }
    };

    const submit = async (type: 'ready' | 'guess') => {
        const value = type === 'ready' ? secret : input;
        const invalid = validateGuess(value);
        if (invalid) { setError(invalid); return; }
        if (type === 'guess' && me.guesses.some(guess => guess.number === value)) {
            setError('Ya probaste ese número. ¡Prueba una nueva idea!');
            return;
        }
        setError('');
        if (await onAction(type, value)) {
            if (type === 'guess') setInput('');
            else setSecret('');
        }
    };

    return (
        <>
            <section className="duel-heading">
                <div><span className="eyebrow">SALA {room.code} · RONDA {room.round}</span><h1>{room.phase === 'waiting' ? 'Falta tu contrincante.' : finished ? 'Un duelo para recordar.' : 'Que gane la mejor cabeza.'}</h1></div>
                <div className={`connection-label ${offline ? 'disconnected' : ''}`} role="status"><span className="status-dot" />{offline ? 'Reconectando…' : 'Sala sincronizada'}</div>
            </section>
            <section className="duel-players" aria-label="Jugadores y marcador">
                {room.players.map((player, index) => (
                    <div className={`duel-player ${room.turn === player.id ? 'active-player' : ''}`} key={player.id}>
                        <Mascot animal={index === 0 ? 'cow' : 'bull'} happy={room.winner === player.id} />
                        <div><strong>{player.name}{player.id === room.you ? ' (tú)' : ''}</strong><span>{player.left ? 'Salió del duelo' : player.id !== room.you && rivalAway ? 'Sin señal · esperando su vuelta' : room.phase === 'setup' ? (player.ready ? 'Código confirmado ✓' : 'Preparando su código') : room.phase === 'playing' ? (room.turn === player.id ? 'Está pensando…' : 'Esperando su turno') : 'En el rancho'}</span></div>
                        <b className="duel-wins" aria-label={`${player.wins} rondas ganadas`}>{player.wins}</b>
                    </div>
                ))}
                {!rival && <div className="duel-player missing-player"><Icon name="users" size={36} /><div><strong>Tu futuro rival</strong><span>Compártele la invitación</span></div><b className="duel-wins">0</b></div>}
            </section>

            {room.phase === 'waiting' && (
                <section className="invite-card paper-card">
                    <span className="eyebrow">LAS BUENAS RIVALIDADES SE COMPARTEN</span>
                    <h2>Invita a otra mente inquieta.</h2>
                    <p>Pásale el enlace o este código. La sala admite dos jugadores.</p>
                    <strong className="invite-code">{room.code}</strong>
                    <div className="invite-actions"><button className="ranch-button primary" onClick={() => void share()}><Icon name="users" size={19} /> Invitar a un amigo</button><button className="text-button" onClick={() => void copyLink()}>Copiar enlace <Icon name="arrow" size={18} /></button></div>
                    <label className="sr-only" htmlFor="invite-url">Enlace de invitación</label>
                    <input id="invite-url" value={shareUrl} readOnly onFocus={event => event.target.select()} />
                    <p className="fine-print" role="status">{shareMessage || 'Mantén esta pestaña abierta mientras llega tu rival. Podrás recargar sin perder tu lugar.'}</p>
                </section>
            )}

            {room.phase === 'setup' && (
                <section className="duel-setup paper-card">
                    <Mascot animal={me.id === room.players[0].id ? 'cow' : 'bull'} className="setup-mascot" />
                    <span className="eyebrow">TU SECRETO SE QUEDA ENTRE NOSOTROS</span>
                    <h2>{me.ready ? 'Tu código está a buen recaudo.' : 'Elige tu código secreto.'}</h2>
                    <p>{me.ready ? 'En cuanto tu rival confirme el suyo, empieza el duelo.' : 'Cuatro dígitos diferentes. Tu rival tendrá que adivinarlos.'}</p>
                    {!me.ready && <form onSubmit={event => { event.preventDefault(); void submit('ready'); }}>
                        <NumericEntry id="duel-secret" label="Tu código secreto de cuatro dígitos únicos" value={secret} onChange={value => { setSecret(value); setError(''); }} disabled={busy || offline} masked={masked} feedbackId="secret-feedback" invalid={!!error} />
                        <div className="secret-controls"><p id="secret-feedback" className={error ? 'duel-error' : 'fine-print'} role={error ? 'alert' : undefined}>{error || 'El cero también puede ir primero.'}</p><button type="button" className="text-button" onClick={() => setMasked(!masked)}>{masked ? 'Mostrar' : 'Ocultar'}</button></div>
                        <button className="ranch-button primary check-button" disabled={busy || offline || secret.length !== 4}>{busy ? 'Confirmando…' : '¡Este es mi secreto!'} <Icon name="arrow" /></button>
                    </form>}
                    {me.ready && <div className="ready-stamp" role="status">✓ CÓDIGO CONFIRMADO</div>}
                </section>
            )}

            {room.phase === 'playing' && (
                <>
                    <div className={`turn-banner ${myTurn ? 'your-turn' : ''}`} role="status"><Icon name={myTurn ? 'spark' : 'clock'} size={21} /><strong>{myTurn ? '¡Tu turno! Dale una vuelta al misterio.' : `Turno de ${rival?.name}. Tu libreta sigue disponible.`}</strong><span><Icon name="clock" size={15} /> {formatTime(elapsed)}</span></div>
                    <div className="game-layout duel-game-layout">
                        <section className="game-board paper-card" aria-labelledby="duel-guess-title">
                            <div className="board-heading"><div><span className="eyebrow">EL CÓDIGO DE TU RIVAL</span><h2 id="duel-guess-title">¿Qué estará tramando?</h2></div></div>
                            <p className="board-description">El servidor comprueba las pistas y cambia el turno.</p>
                            {me.guesses.at(-1) && <div className="latest-clue"><span>Tu última idea <b>{me.guesses.at(-1)!.number}</b></span><span className="result-badge bull-result">{me.guesses.at(-1)!.bulls} <span>TOROS</span></span><span className="result-badge cow-result">{me.guesses.at(-1)!.cows} <span>VACAS</span></span></div>}
                            <form onSubmit={event => { event.preventDefault(); if (myTurn && !busy && !offline) void submit('guess'); }}>
                                <NumericEntry id="duel-guess" label="Tu intento contra el rival" value={input} onChange={value => { setInput(value); setError(''); }} disabled={!myTurn || busy || offline} feedbackId="duel-guess-feedback" invalid={!!error} />
                                <p id="duel-guess-feedback" className={`guess-feedback ${error ? 'has-error' : ''}`} aria-live="polite">{error || (offline ? 'Estamos recuperando la conexión. Tu partida sigue guardada.' : myTurn ? 'Cuatro dígitos únicos. ¡A por ello!' : 'Espera la jugada de tu rival.')}</p>
                                <button className="ranch-button primary check-button" disabled={!myTurn || busy || offline || input.length !== 4}>{busy ? 'Comprobando…' : 'Lanzar mi intento'} <Icon name="arrow" /></button>
                            </form>
                            <div className="scratch-card duel-scratch"><div className="section-heading"><h3>Tu libreta de detective</h3><span aria-hidden="true">✎</span></div><p>Tus notas son privadas y no cambian las pistas.</p><div className="scratch-digits">{'0123456789'.split('').map(digit => <button key={digit} className={scratchpad.includes(digit) ? 'crossed' : ''} aria-pressed={scratchpad.includes(digit)} aria-label={`${scratchpad.includes(digit) ? 'Recuperar' : 'Descartar'} ${digit}`} onClick={() => setScratchpad(previous => previous.includes(digit) ? previous.filter(item => item !== digit) : [...previous, digit])}>{digit}</button>)}</div></div>
                        </section>
                        <aside className="game-sidebar"><GuessHistory title="Tus pesquisas" guesses={me.guesses} /><GuessHistory title={`Las ideas de ${rival?.name}`} guesses={rival?.guesses || []} /></aside>
                    </div>
                    <p className="sr-only" aria-live="polite">{me.guesses.length > 0 ? `Tu último intento: ${me.guesses.at(-1)!.number}, ${me.guesses.at(-1)!.bulls} toros y ${me.guesses.at(-1)!.cows} vacas.` : ''}</p>
                </>
            )}

            {finished && (
                <section className="duel-result paper-card" aria-labelledby="duel-result-title">
                    <div className="victory-mascots"><Mascot animal="cow" happy={room.winner === room.players[0].id} /><span>✦</span><Mascot animal="bull" happy={room.winner === room.players[1]?.id} /></div>
                    <span className="eyebrow">{room.reason === 'guessed' ? 'MISTERIO RESUELTO' : room.reason === 'forfeit' ? 'DUELO TERMINADO POR ABANDONO' : 'SALA CERRADA'}</span>
                    <h2 id="duel-result-title">{room.winner ? room.winner === room.you ? '¡Te llevaste el duelo!' : `¡Esta vez ganó ${rival?.name}!` : 'Nos vemos en otro rancho.'}</h2>
                    <p>{room.reason === 'guessed' ? 'Buena cabeza, buen pique. ¿Le damos otra vuelta?' : 'Las victorias por abandono no entran en los resultados públicos.'}</p>
                    {room.revealedSecrets && <div className="duel-secrets">{room.players.map(player => <div key={player.id}><span>Código de {player.name}</span><strong>{room.revealedSecrets?.[player.id] || '—'}</strong></div>)}</div>}
                    <div className="victory-stats"><div><strong>{me.guesses.length}</strong><span>tus intentos</span></div><div><strong>{formatTime(elapsed)}</strong><span>duración de la ronda</span></div></div>
                    {room.phase === 'finished' && !room.players.some(player => player.left) ? <>
                        <button className="ranch-button primary" disabled={busy || offline || room.rematch.includes(room.you)} onClick={() => void onAction('rematch')}>{room.rematch.includes(room.you) ? 'Revancha pedida. Esperando al rival…' : room.rematch.length ? '¡Aceptar revancha!' : '¡Quiero revancha!'} <Icon name="arrow" /></button>
                        <p className="fine-print">Ambos deben aceptar. En la siguiente ronda empieza el otro jugador.</p>
                    </> : <p className="fine-print">Tu rival salió o la sala se cerró. Vuelve al rancho para crear un nuevo duelo.</p>}
                    {room.reason === 'guessed' && <p className="verified-result"><Icon name="trophy" size={17} /> Resultado verificado y guardado por el servidor.</p>}
                </section>
            )}
            {rivalAway && !finished && <div className="duel-notice" role="status"><span>Tu rival está sin señal. Puede volver con el mismo enlace y navegador. Si no regresa en 90 segundos, podrás cerrar el duelo.</span>{canClaim && <button className="text-button" disabled={busy || offline} onClick={() => void onAction('claim_abandon')}>Cerrar por ausencia</button>}</div>}
            <p className="duel-expiry fine-print">La sala caduca tras 30 minutos sin actividad y dura como máximo 24 horas. Los secretos solo se muestran al terminar.</p>
        </>
    );
}
