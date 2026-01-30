import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import { audio } from '../lib/audio';

type Guess = {
    number: string;
    bulls: number;
    cows: number;
};

type GameState = 'setup' | 'playing' | 'won' | 'lost';

interface VSGameProps {
    peer: Peer;
    connection: any;
    isHost: boolean;
    onExit: () => void;
}

export default function VSGame({ peer, connection, isHost, onExit }: VSGameProps) {
    const [mySecret, setMySecret] = useState<string>('');
    const mySecretRef = useRef<string>(''); // Ref to hold the latest value
    const [opponentSecret, setOpponentSecret] = useState<string>('');
    const [myGuesses, setMyGuesses] = useState<Guess[]>([]);
    const [opponentGuesses, setOpponentGuesses] = useState<Guess[]>([]);
    const [input, setInput] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [gameState, setGameState] = useState<GameState>('setup');
    const [isMyTurn, setIsMyTurn] = useState<boolean>(isHost);
    const [setupReady, setSetupReady] = useState<boolean>(false);
    const [opponentReady, setOpponentReady] = useState<boolean>(false);
    const [connectionReady, setConnectionReady] = useState<boolean>(false);
    const [scratchpad, setScratchpad] = useState<Record<string, boolean>>({});
    const [showHelp, setShowHelp] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [gameTime, setGameTime] = useState<number>(0);
    const [playerName, setPlayerName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleScratch = (digit: string) => {
        audio.play('click');
        setScratchpad(prev => ({
            ...prev,
            [digit]: !prev[digit]
        }));
    };

    useEffect(() => {
        console.log('Setting up connection listener');
        console.log('Connection.open:', connection.open);

        // Always listen for open event
        const handleOpen = () => {
            console.log('Connection opened event fired!');
            setConnectionReady(true);
        };

        connection.on('open', handleOpen);

        const handleData = (data: any) => {
            console.log('Received data:', data);
            handleMessage(data);
        };

        connection.on('data', handleData);

        // Handle peer disconnection from signaling server
        const handleDisconnect = () => {
            console.log('Peer disconnected from server, attempting reconnect...');
            peer.reconnect();
        };

        peer.on('disconnected', handleDisconnect);

        // Force connection ready after a short delay
        const timer = setTimeout(() => {
            setConnectionReady(true);
        }, 500);

        return () => {
            clearTimeout(timer);
            connection.off('open', handleOpen);
            connection.off('data', handleData);
            peer.off('disconnected', handleDisconnect);
        };
    }, [connection, peer]);

    // Auto-focus input when game starts
    useEffect(() => {
        if (gameState === 'playing' && isMyTurn && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [gameState, isMyTurn]);

    // Start game when both players are ready
    useEffect(() => {
        if (setupReady && opponentReady && gameState === 'setup') {
            console.log('Both players ready, transitioning to playing');
            audio.play('start');
            setStartTime(Date.now());
            setTimeout(() => setGameState('playing'), 500);
        }
    }, [setupReady, opponentReady, gameState]);

    const handleMessage = (data: any) => {
        switch (data.type) {
            case 'secret_ready':
                console.log('Received secret_ready from opponent');
                setOpponentReady(true);
                // If I'm already ready, start the game
                if (setupReady) {
                    console.log('Both ready, starting game');
                    setGameState('playing');
                }
                break;
            case 'guess':
                const result = calculateBullsCows(data.number, mySecretRef.current);
                setOpponentGuesses(prev => [{
                    number: data.number,
                    bulls: result.bulls,
                    cows: result.cows
                }, ...prev]);

                // Send result back
                connection.send({
                    type: 'guess_result',
                    bulls: result.bulls,
                    cows: result.cows
                });

                // Check if opponent won
                if (result.bulls === 4) {
                    audio.play('lost');
                    setGameState('lost');
                    // Reveal my secret to the opponent (the winner)
                    connection.send({
                        type: 'reveal_secret',
                        secret: mySecretRef.current
                    });
                } else {
                    setIsMyTurn(true);
                }
                break;
            case 'guess_result':
                setMyGuesses(prev => {
                    const updated = [...prev];
                    updated[0] = { ...updated[0], bulls: data.bulls, cows: data.cows };
                    return updated;
                });

                if (data.bulls === 4) {
                    audio.play('win');
                    setGameState('won');
                    const duration = Math.floor((Date.now() - startTime) / 1000);
                    setGameTime(duration);
                    // Reveal my secret to the opponent (the loser)
                    connection.send({
                        type: 'reveal_secret',
                        secret: mySecretRef.current
                    });
                } else {
                    if (data.bulls > 0) {
                        audio.play('bull');
                    } else if (data.cows > 0) {
                        audio.play('cow');
                    }
                    setIsMyTurn(false);
                }
                break;
            case 'reveal_secret':
                setOpponentSecret(data.secret);
                // Even if I lost, reveal my opponent's secret and stop time if needed 
                // (though time only matters for the winner's score)
                break;
        }
    };

    const submitScore = async () => {
        if (!playerName.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch('/api/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: playerName.trim(),
                    attempts: myGuesses.length,
                    time: gameTime,
                    mode: 'vs'
                })
            });

            if (response.ok) {
                setSubmitted(true);
            }
        } catch (e) {
            console.error('Error submitting score:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateBullsCows = (guess: string, target: string) => {
        let bulls = 0;
        let cows = 0;
        for (let i = 0; i < 4; i++) {
            if (guess[i] === target[i]) {
                bulls++;
            } else if (target.includes(guess[i])) {
                cows++;
            }
        }
        return { bulls, cows };
    };

    const handleSetSecret = () => {
        if (mySecret.length !== 4) {
            setError('Debe ser 4 dígitos');
            return;
        }
        if (!/^\d+$/.test(mySecret)) {
            setError('Solo números');
            return;
        }
        if (new Set(mySecret).size !== 4) {
            setError('Dígitos únicos');
            return;
        }

        if (!connectionReady) {
            setError('Esperando conexión...');
            console.log('Connection not ready yet');
            return;
        }

        console.log('Setting my secret, sending ready signal');
        console.log('Connection open?', connection.open);

        // Update the ref so handleMessage has the latest value
        mySecretRef.current = mySecret;
        console.log('mySecretRef.current set to:', mySecretRef.current);

        setSetupReady(true);
        audio.play('click');
        setError('');

        try {
            connection.send({ type: 'secret_ready' });
            console.log('Sent secret_ready message');
        } catch (err) {
            console.error('Error sending message:', err);
        }
        // Game will start via useEffect when both are ready
    };

    const handleGuess = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!isMyTurn) {
            setError('No es tu turno');
            return;
        }

        if (input.length !== 4 || !/^\d+$/.test(input) || new Set(input).size !== 4) {
            setError('Número inválido');
            return;
        }

        // Add guess with pending result
        setMyGuesses(prev => [{ number: input, bulls: 0, cows: 0 }, ...prev]);

        // Send guess to opponent
        connection.send({
            type: 'guess',
            number: input
        });

        setInput('');
    };

    if (gameState === 'setup') {
        return (
            <div className="w-full max-w-lg mx-auto p-4 sm:p-8">
                <div className="premium-glass rounded-[40px] p-8 sm:p-12 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center text-white/60 hover:text-white transition-all text-xl font-black bg-white/5 rounded-full border border-white/10 hover:bg-white/10"
                    >
                        ?
                    </button>
                    <h2 className="text-4xl font-black text-center mb-8 bg-gradient-to-br from-white to-white/40 bg-clip-text text-transparent leading-tight">
                        Tu Código <br /><span className="text-gradient-vibrant">Secreto</span>
                    </h2>

                    {!connectionReady && (
                        <div className="mb-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3 text-center">
                            <p className="text-yellow-300 text-sm">
                                ⏳ Estableciendo conexión...
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <input
                                type="text"
                                maxLength={4}
                                value={mySecret}
                                onChange={(e) => {
                                    setMySecret(e.target.value);
                                    setError('');
                                }}
                                placeholder="4 dígitos únicos"
                                disabled={setupReady || !connectionReady}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-full bg-black/20 text-white text-center text-3xl tracking-[1em] font-mono py-4 rounded-2xl border-2 border-white/10 focus:border-purple-400 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-lg"
                            />
                            <button
                                onClick={handleSetSecret}
                                disabled={setupReady || !connectionReady || mySecret.length !== 4}
                                className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-0 shadow-lg shadow-purple-500/30 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </button>
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center">{error}</p>
                        )}

                        <button
                            onClick={handleSetSecret}
                            disabled={setupReady || !connectionReady}
                            className="w-full px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all disabled:opacity-50"
                        >
                            {setupReady ? '✓ Listo!' : 'Confirmar'}
                        </button>

                        {setupReady && !opponentReady && (
                            <div className="text-center space-y-2">
                                <div className="flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
                                </div>
                                <p className="text-white/60 text-sm">
                                    Esperando a tu oponente...
                                </p>
                            </div>
                        )}

                        {setupReady && opponentReady && (
                            <div className="bg-green-500/20 border border-green-400/40 rounded-xl p-4 text-center animate-pulse">
                                <p className="text-green-300 font-bold">
                                    ¡Ambos listos! Iniciando juego...
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto p-4 relative">
            <div className="flex justify-between items-center mb-8 px-2">
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            audio.play('click');
                            onExit();
                        }}
                        className="flex items-center gap-3 text-white/70 hover:text-white transition-all text-xs font-black uppercase tracking-widest bg-white/5 px-6 py-3 rounded-2xl border border-white/10 hover:bg-white/10 shadow-xl backdrop-blur-md"
                    >
                        <span>🏠</span> Menú
                    </button>
                    <button
                        onClick={() => setShowHelp(true)}
                        className="w-12 h-12 flex items-center justify-center text-white/60 hover:text-white transition-all text-xl font-black bg-white/5 rounded-2xl hover:bg-white/10 border border-white/10 backdrop-blur-md"
                        title="Cómo jugar"
                    >
                        ?
                    </button>
                </div>
                <div className="hidden sm:block text-white/20 text-xs font-mono uppercase tracking-widest">
                    Modo VS en Línea
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Side */}
                <div className={`premium-glass rounded-[32px] p-8 shadow-2xl transition-all duration-500 ${isMyTurn ? 'ring-2 ring-purple-500/50 scale-[1.02] bg-purple-500/5' : 'opacity-80'}`}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-black uppercase tracking-widest text-purple-300">Tus Intentos</h3>
                        {isMyTurn && (
                            <div className="flex items-center gap-2 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
                                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black text-purple-200">TU TURNO</span>
                            </div>
                        )}
                    </div>

                    {gameState === 'playing' && (
                        <form onSubmit={handleGuess} className="mb-8 relative group">
                            <input
                                ref={inputRef}
                                type="text"
                                maxLength={4}
                                value={input}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, '');
                                    setInput(val);
                                }}
                                disabled={!isMyTurn}
                                placeholder={isMyTurn ? "Tu intento..." : "Espera tu turno"}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className={`w-full bg-black/20 text-white text-center text-2xl font-mono py-3 rounded-xl border-2 border-white/10 focus:border-purple-400 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-lg ${input ? 'tracking-widest pl-4' : 'tracking-normal'}`}
                            />
                            <button
                                type="submit"
                                disabled={!isMyTurn || input.length !== 4}
                                className={`absolute right-1.5 top-1.5 bottom-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-3 rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center shadow-lg shadow-purple-500/30 ${(!isMyTurn || input.length !== 4) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                            </button>
                            {error && <p className="text-red-400 text-xs mt-1 absolute -bottom-5 left-0 right-0 text-center">{error}</p>}
                        </form>
                    )}

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {myGuesses.map((g, i) => (
                            <div key={i} className="bg-black/20 p-3 rounded-xl flex justify-between items-center">
                                <span className="font-mono text-lg">{g.number}</span>
                                <div className="flex gap-3 text-sm">
                                    <span className="text-green-300">🐂 {g.bulls}</span>
                                    <span className="text-yellow-300">🐄 {g.cows}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Opponent Side */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                    <h3 className="text-xl font-bold text-center mb-4 text-pink-300">
                        Oponente {!isMyTurn && '(Su turno)'}
                    </h3>

                    <div className="space-y-2 max-h-96 overflow-y-auto mt-16">
                        {opponentGuesses.map((g, i) => (
                            <div key={i} className="bg-black/20 p-3 rounded-xl flex justify-between items-center">
                                <span className="font-mono text-lg">{g.number}</span>
                                <div className="flex gap-3 text-sm">
                                    <span className="text-green-300">🐂 {g.bulls}</span>
                                    <span className="text-yellow-300">🐄 {g.cows}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Scratchpad (Number Tracker) */}
            {gameState === 'playing' && (
                <div className="mt-8 flex flex-col gap-3 items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold">
                        Descartar números
                    </span>
                    <div className="w-full max-w-lg md:max-w-md bg-white/5 backdrop-blur-sm rounded-3xl p-4 sm:p-6 border border-white/10 flex flex-row md:grid md:grid-cols-5 gap-3 items-center justify-center flex-wrap shadow-inner shadow-black/20">
                        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                            <button
                                key={digit}
                                onClick={() => toggleScratch(digit)}
                                className={`w-11 h-11 sm:w-14 sm:h-14 md:w-auto md:h-14 rounded-2xl font-mono font-bold text-xl transition-all duration-300 border relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20 active:scale-90 ${scratchpad[digit]
                                    ? 'bg-red-500/10 text-white/20 border-red-500/20 scale-95 grayscale'
                                    : 'bg-gradient-to-br from-white/10 to-white/5 text-white border-white/10 hover:border-purple-400/50 hover:scale-110'
                                    }`}
                            >
                                {digit}
                                <div className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${scratchpad[digit] ? 'opacity-100' : 'opacity-0'}`}>
                                    <div className="w-[120%] h-1 bg-red-500/60 rotate-45 transform origin-center shadow-sm"></div>
                                    <div className="absolute w-[120%] h-1 bg-red-500/60 -rotate-45 transform origin-center shadow-sm"></div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Game Over */}
            {(gameState === 'won' || gameState === 'lost') && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[200] p-4">
                    <div className="premium-glass rounded-[40px] p-12 max-w-md w-full shadow-2xl text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
                        <div className="text-8xl mb-6 animate-bounce">{gameState === 'won' ? '🏆' : '💀'}</div>
                        <h2 className="text-5xl font-black mb-2 tracking-tighter">
                            {gameState === 'won' ? '¡VICTORIA!' : 'DERROTA'}
                        </h2>
                        <p className="text-white/40 uppercase tracking-[0.3em] text-[10px] font-black mb-8">
                            {gameState === 'won' ? 'Has dominado el duelo' : 'Tu oponente fue más rápido'}
                        </p>

                        <div className="bg-black/40 rounded-3xl p-6 mb-8 border border-white/5 space-y-4">
                            <div>
                                <p className="text-xs text-white/30 uppercase font-black mb-1">Número del Oponente</p>
                                <p className="text-4xl font-mono font-black tracking-[0.5em] text-white">
                                    {opponentSecret || '----'}
                                </p>
                            </div>

                            {gameState === 'won' && (
                                <div className="pt-4 border-t border-white/5 space-y-4">
                                    {!submitted ? (
                                        <>
                                            <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300 font-bold">Hall of Fame</p>
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    type="text"
                                                    value={playerName}
                                                    onChange={(e) => setPlayerName(e.target.value)}
                                                    placeholder="Tu nombre..."
                                                    maxLength={15}
                                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-center outline-none focus:border-purple-400 transition-all text-sm"
                                                />
                                                <button
                                                    onClick={submitScore}
                                                    disabled={!playerName.trim() || isSubmitting}
                                                    className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-bold text-xs shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                                >
                                                    {isSubmitting ? 'Guardando...' : 'Guardar Récord'}
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-white/40 italic">
                                                {myGuesses.length} intentos en {gameTime}s
                                            </p>
                                        </>
                                    ) : (
                                        <div className="py-2">
                                            <p className="text-green-300 text-xs font-bold">✨ ¡Guardado!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl transition-all shadow-xl shadow-purple-900/40 border border-white/10"
                            >
                                REVANCHA
                            </button>
                            <button
                                onClick={onExit}
                                className="w-full py-3 text-white/50 hover:text-white transition-colors text-xs font-black uppercase tracking-widest"
                            >
                                Salir al Menú
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Instructions Modal */}
            {showHelp && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white/10 border border-white/20 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowHelp(false)}
                            className="absolute top-4 right-4 text-white/40 hover:text-white text-2xl font-bold p-2"
                        >
                            ×
                        </button>

                        <h2 className="text-3xl font-black mb-6 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                            ¿Cómo jugar?
                        </h2>

                        <div className="space-y-6 text-white/80">
                            <section>
                                <p className="leading-relaxed text-sm">
                                    Adivina el número secreto de 4 dígitos únicos de tu oponente antes que él adivine el tuyo.
                                </p>
                            </section>

                            <section className="grid grid-cols-1 gap-4">
                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🐂</span>
                                        <h4 className="font-bold text-green-400 uppercase tracking-wider text-xs">Toros</h4>
                                    </div>
                                    <p className="text-xs">Número correcto en la posición <strong>correcta</strong>.</p>
                                </div>

                                <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">🐄</span>
                                        <h4 className="font-bold text-yellow-400 uppercase tracking-wider text-xs">Vacas</h4>
                                    </div>
                                    <p className="text-xs">Número correcto en la posición <strong>incorrecta</strong>.</p>
                                </div>
                            </section>

                            <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-400/20 text-xs italic">
                                Ejemplo: Secreto 1234, Adivinas 1478: <br />
                                <strong>1 Toro</strong> (el 1) y <strong>1 Vaca</strong> (el 4).
                            </div>
                        </div>

                        <button
                            onClick={() => setShowHelp(false)}
                            className="w-full mt-8 py-3 bg-white text-black font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-lg"
                        >
                            ¡Entendido!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
