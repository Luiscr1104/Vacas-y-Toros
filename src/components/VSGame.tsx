import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

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
    const inputRef = useRef<HTMLInputElement>(null);

    const toggleScratch = (digit: string) => {
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

        // Force connection ready after a short delay
        const timer = setTimeout(() => {
            setConnectionReady(true);
        }, 500);

        return () => {
            clearTimeout(timer);
            connection.off('open', handleOpen);
            connection.off('data', handleData);
        };
    }, [connection]);

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
                    setGameState('won');
                    // Reveal my secret to the opponent (the loser)
                    connection.send({
                        type: 'reveal_secret',
                        secret: mySecretRef.current
                    });
                } else {
                    setIsMyTurn(false);
                }
                break;
            case 'reveal_secret':
                setOpponentSecret(data.secret);
                break;
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
            <div className="w-full max-w-md mx-auto p-8">
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20">
                    <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                        Elige tu Número Secreto
                    </h2>

                    {!connectionReady && (
                        <div className="mb-4 bg-yellow-500/20 border border-yellow-400/40 rounded-xl p-3 text-center">
                            <p className="text-yellow-300 text-sm">
                                ⏳ Estableciendo conexión...
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
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
            {/* Header / Back to Menu */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={onExit}
                    className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-sm font-bold bg-white/5 px-4 py-2 rounded-full hover:bg-white/10"
                >
                    🏠 Menú Principal
                </button>
                <div className="text-white/20 text-xs font-mono uppercase tracking-widest">
                    Modo VS Online
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* My Side */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-white/20">
                    <h3 className="text-xl font-bold text-center mb-4 text-purple-300">
                        Tus Intentos {isMyTurn && '(Tu turno)'}
                    </h3>

                    {gameState === 'playing' && (
                        <form onSubmit={handleGuess} className="mb-4">
                            <input
                                ref={inputRef}
                                type="text"
                                maxLength={4}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={!isMyTurn}
                                placeholder={isMyTurn ? "Tu intento..." : "Espera tu turno"}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="w-full bg-black/20 text-white text-center text-2xl tracking-widest font-mono py-3 rounded-xl border-2 border-white/10 focus:border-purple-400 outline-none transition-all disabled:opacity-50 placeholder:text-white/20 placeholder:tracking-normal placeholder:text-lg"
                            />
                            {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
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
                    <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 flex flex-row gap-3 items-center justify-center flex-wrap shadow-inner shadow-black/20">
                        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                            <button
                                key={digit}
                                onClick={() => toggleScratch(digit)}
                                className={`w-10 h-10 md:w-12 md:h-12 rounded-full font-mono font-bold text-lg md:text-xl transition-all duration-300 border relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20 active:scale-90 ${scratchpad[digit]
                                    ? 'bg-red-500/10 text-white/20 border-red-500/20 scale-95 grayscale'
                                    : 'bg-gradient-to-br from-white/10 to-white/5 text-white border-white/10 hover:border-purple-400/50 hover:scale-110 hover:-translate-y-1'
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
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 text-center">
                        <div className="text-6xl mb-4">{gameState === 'won' ? '🏆' : '😔'}</div>
                        <h2 className="text-4xl font-bold mb-4">
                            {gameState === 'won' ? '¡Ganaste!' : 'Perdiste'}
                        </h2>
                        <p className="text-white/60 mb-6">
                            El número era: <span className="text-2xl font-bold text-white tracking-widest ml-2">{opponentSecret || '...'}</span>
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all shadow-lg shadow-purple-500/30"
                            >
                                Jugar de Nuevo
                            </button>
                            <button
                                onClick={onExit}
                                className="px-8 py-2 text-white/60 hover:text-white transition-colors text-sm font-bold"
                            >
                                Salir al Menú Principal
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
