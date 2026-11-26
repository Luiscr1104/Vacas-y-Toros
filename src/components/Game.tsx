import { useEffect, useRef, useState } from 'react';
import { audio } from '../lib/audio';
import { evaluateGuess, formatTime, generateSecret, validateGuess, type Guess } from '../lib/game';
import { recordWin } from '../lib/stats';
import Icon from './Icon';
import Mascot from './Mascot';

interface GameProps {
    onBack?: () => void;
}

export default function Game({ onBack }: GameProps) {
    const [secret, setSecret] = useState('');
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [input, setInput] = useState('');
    const [won, setWon] = useState(false);
    const [error, setError] = useState('');
    const [scratchpad, setScratchpad] = useState<string[]>([]);
    const [elapsed, setElapsed] = useState(0);
    const [newRecord, setNewRecord] = useState(false);
    const [name, setName] = useState('');
    const [submission, setSubmission] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const startedAt = useRef(0);
    const locked = useRef(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const submissionId = useRef(0);
    const latestGuess = guesses.at(-1);

    const start = () => {
        submissionId.current++;
        locked.current = false;
        startedAt.current = Date.now();
        setSecret(generateSecret());
        setGuesses([]);
        setInput('');
        setWon(false);
        setError('');
        setScratchpad([]);
        setElapsed(0);
        setNewRecord(false);
        setName('');
        setSubmission('idle');
        inputRef.current?.focus();
    };

    useEffect(() => { start(); }, []);
    useEffect(() => {
        if (won) return;
        const timer = window.setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
        return () => window.clearInterval(timer);
    }, [won]);
    useEffect(() => () => { submissionId.current++; }, []);

    const submit = () => {
        if (!secret || locked.current) return;
        const invalid = validateGuess(input);
        if (invalid) {
            setError(invalid);
            audio.play('error');
            return;
        }
        if (guesses.some(guess => guess.number === input)) {
            setError('Ya probaste ese número. ¡Prueba una nueva idea!');
            audio.play('error');
            return;
        }
        const result = evaluateGuess(input, secret);
        setGuesses(previous => [...previous, { number: input, ...result }]);
        setInput('');
        setError('');
        if (result.bulls === 4) {
            locked.current = true;
            const seconds = Math.floor((Date.now() - startedAt.current) / 1000);
            setElapsed(seconds);
            setNewRecord(recordWin(guesses.length + 1, seconds));
            setWon(true);
            audio.play('win');
        } else {
            audio.play(result.bulls ? 'bull' : result.cows ? 'cow' : 'click');
            inputRef.current?.focus();
        }
    };

    const saveScore = async () => {
        if (!won || !name.trim() || submission === 'saving' || submission === 'saved') return;
        const id = ++submissionId.current;
        setSubmission('saving');
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name.trim(), attempts: guesses.length, time: elapsed, mode: 'solo' }),
            });
            if (!response.ok) throw new Error('No se pudo guardar');
            if (id === submissionId.current) setSubmission('saved');
        } catch {
            if (id === submissionId.current) setSubmission('error');
        }
    };

    return (
        <main className="game-page">
            <div className="game-topline">
                <button className="text-button" onClick={onBack}><Icon name="back" size={18} /> Volver al rancho</button>
                <span className="mode-pill"><span className="status-dot" /> MODO INDIVIDUAL</span>
            </div>
            <div className="game-layout">
                <section className="game-board paper-card" aria-labelledby="game-title">
                    <div className="board-heading"><div><span className="eyebrow">PON A PASTAR LAS NEURONAS</span><h1 id="game-title">{won ? '¡Caso resuelto!' : '¿Cuál es el código?'}</h1></div><div className="timer"><Icon name="clock" size={17} /> {formatTime(elapsed)}</div></div>
                    {!won ? (
                        <>
                            <p className="board-description">4 dígitos diferentes. Todas las pistas que necesites.</p>
                            {latestGuess && <div className="latest-clue"><span>Tu última idea <b>{latestGuess.number}</b></span><span className="result-badge bull-result">{latestGuess.bulls} <span>TOROS</span></span><span className="result-badge cow-result">{latestGuess.cows} <span>VACAS</span></span></div>}
                            <form onSubmit={event => { event.preventDefault(); submit(); }} className="guess-form">
                                <label className="sr-only" htmlFor="guess-input">Tu intento de cuatro dígitos únicos</label>
                                <div className="code-input-wrap">
                                    <div className="code-tiles" aria-hidden="true">{Array.from({ length: 4 }, (_, i) => <span className={`code-tile ${input[i] ? 'filled' : ''} ${i === input.length ? 'current' : ''}`} key={i}>{input[i] || <span className="tile-dot" />}</span>)}</div>
                                    <input id="guess-input" ref={inputRef} className="code-input" value={input} onChange={event => { setInput(event.target.value.replace(/[^0-9]/g, '').slice(0, 4)); setError(''); }} inputMode="none" autoComplete="off" maxLength={4} aria-invalid={!!error} aria-describedby="guess-feedback" autoFocus />
                                </div>
                                <div id="guess-feedback" className={`guess-feedback ${error ? 'has-error' : ''}`} aria-live="polite">{error || 'El cero también juega. No repitas dígitos.'}</div>
                                <div className="number-keypad" aria-label="Teclado numérico">
                                    {'123456789'.split('').map(digit => <button key={digit} type="button" disabled={input.length === 4} onClick={() => { setInput(previous => (previous + digit).slice(0, 4)); setError(''); }}>{digit}</button>)}
                                    <button className="key-clear" type="button" onClick={() => { setInput(''); setError(''); }}>Borrar</button>
                                    <button type="button" disabled={input.length === 4} onClick={() => { setInput(previous => (previous + '0').slice(0, 4)); setError(''); }}>0</button>
                                    <button type="button" aria-label="Borrar último dígito" onClick={() => { setInput(previous => previous.slice(0, -1)); setError(''); }}><Icon name="delete" /></button>
                                </div>
                                <button className="ranch-button primary check-button" type="submit" disabled={input.length !== 4 || !secret}>Probar mi suerte <Icon name="arrow" /></button>
                            </form>
                        </>
                    ) : (
                        <section className="victory" aria-label="Resultado de la partida">
                            <div className="victory-mascots"><Mascot animal="cow" happy /><span>✦</span><Mascot animal="bull" happy /></div>
                            <span className="record-ribbon">{newRecord ? '¡NUEVO RÉCORD DE INTENTOS!' : '¡QUÉ BUENA CABEZA!'}</span>
                            <p>El misterio era <strong className="secret-answer">{secret}</strong></p>
                            <div className="victory-stats"><div><strong>{guesses.length}</strong><span>intentos</span></div><div><strong>{formatTime(elapsed)}</strong><span>tiempo total</span></div></div>
                            <button className="ranch-button primary check-button" onClick={() => { audio.play('start'); start(); }}>¡Otra, otra! <Icon name="arrow" /></button>
                            <p className="fine-print">Tu trayectoria se guarda en este navegador cuando el almacenamiento está disponible.</p>
                            <details className="save-score"><summary>¿Guardar también en el ranking global?</summary>
                                {submission === 'saved' ? <p role="status">¡Listo! Tu resultado está guardado.</p> : (
                                    <form onSubmit={event => { event.preventDefault(); void saveScore(); }}>
                                        <label htmlFor="player-name">Tu apodo</label>
                                        <div><input id="player-name" maxLength={15} value={name} onChange={event => setName(event.target.value)} placeholder="Detective del rancho" disabled={submission === 'saving'} /><button className="ranch-button ink" disabled={!name.trim() || submission === 'saving'}>{submission === 'saving' ? 'Guardando…' : 'Guardar'}</button></div>
                                        {submission === 'error' && <p role="alert">No pudimos conectar con el ranking. Tu récord local sigue aquí; puedes reintentar.</p>}
                                    </form>
                                )}
                            </details>
                        </section>
                    )}
                </section>
                <aside className="game-sidebar">
                    <section className="history-card paper-card" aria-labelledby="history-title">
                        <div className="section-heading"><h2 id="history-title">Tus pesquisas</h2><span className="count-pill">{guesses.length} intentos</span></div>
                        {guesses.length === 0 ? <div className="empty-history"><Icon name="spark" size={34} /><strong>Todo gran misterio<br />empieza con una idea.</strong><p>Prueba un número y tus pistas<br />aparecerán aquí.</p></div> : (
                            <div className="guess-history">
                                <div className="history-labels"><span>INTENTO</span><span>TOROS / VACAS</span></div>
                                <ol>{[...guesses].reverse().map((guess, index) => <li key={guess.number} className="guess-row"><span className="guess-index">{String(guesses.length - index).padStart(2, '0')}</span><strong>{guess.number}</strong><span className="result-badge bull-result" aria-label={`${guess.bulls} toros`}>{guess.bulls} <span>T</span></span><span className="result-badge cow-result" aria-label={`${guess.cows} vacas`}>{guess.cows} <span>V</span></span></li>)}</ol>
                            </div>
                        )}
                        <p className="history-announcement sr-only" aria-live="polite">{guesses.length > 0 && `Intento ${guesses.length}: ${guesses.at(-1)?.number}. ${guesses.at(-1)?.bulls} toros y ${guesses.at(-1)?.cows} vacas.${won ? ' ¡Ganaste!' : ''}`}</p>
                        <div className="history-legend"><span><i className="legend-dot green" /> Toro: está en su lugar</span><span><i className="legend-dot yellow" /> Vaca: está en otro lugar</span></div>
                    </section>
                    <section className="scratch-card" aria-labelledby="scratch-title">
                        <div className="section-heading"><h2 id="scratch-title">Tu libreta de detective</h2><span aria-hidden="true">✎</span></div>
                        <p>Tacha los dígitos que quieras descartar.<br />Las notas las decides tú.</p>
                        <div className="scratch-digits">{'0123456789'.split('').map(digit => <button key={digit} aria-label={`${scratchpad.includes(digit) ? 'Recuperar' : 'Descartar'} ${digit}`} aria-pressed={scratchpad.includes(digit)} className={scratchpad.includes(digit) ? 'crossed' : ''} onClick={() => setScratchpad(previous => previous.includes(digit) ? previous.filter(item => item !== digit) : [...previous, digit])}>{digit}</button>)}</div>
                    </section>
                    <div className="sidebar-tip"><Mascot animal="cow" /><p>«No es cuestión de suerte.<br /><strong>Bueno… un poquito sí.»</strong></p></div>
                </aside>
            </div>
        </main>
    );
}
