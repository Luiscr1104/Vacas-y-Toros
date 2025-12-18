import React, { useState, useEffect, useRef } from 'react';

type Guess = {
    number: string;
    bulls: number;
    cows: number;
};

type GameStatus = 'playing' | 'won';

interface GameProps {
    onBack?: () => void;
}

export default function Game({ onBack }: GameProps) {
    const [secret, setSecret] = useState<string>('');
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [input, setInput] = useState<string>('');
    const [status, setStatus] = useState<GameStatus>('playing');
    const [error, setError] = useState<string>('');
    const [scratchpad, setScratchpad] = useState<Record<string, boolean>>({});
    const [startTime, setStartTime] = useState<number>(0);
    const [gameTime, setGameTime] = useState<number>(0);
    const [playerName, setPlayerName] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitted, setSubmitted] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Initialize game
    useEffect(() => {
        startNewGame();
    }, []);

    const generateSecret = () => {
        let numbers = Array.from({ length: 10 }, (_, i) => i.toString());
        let result = '';
        for (let i = 0; i < 4; i++) {
            const index = Math.floor(Math.random() * numbers.length);
            result += numbers[index];
            numbers.splice(index, 1);
        }
        return result;
    };

    const startNewGame = () => {
        setSecret(generateSecret());
        setGuesses([]);
        setStatus('playing');
        setInput('');
        setError('');
        setScratchpad({});
        setStartTime(Date.now());
        setGameTime(0);
        setSubmitted(false);
        setPlayerName('');
        setTimeout(() => inputRef.current?.focus(), 100);
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (status === 'won') return;

        if (input.length !== 4) {
            setError('Must be 4 digits');
            return;
        }
        if (!/^\d+$/.test(input)) {
            setError('Numbers only');
            return;
        }
        if (new Set(input).size !== 4) {
            setError('Digits must be unique');
            return;
        }

        const { bulls, cows } = calculateBullsCows(input, secret);
        const newGuess = { number: input, bulls, cows };

        setGuesses([newGuess, ...guesses]);
        setInput('');

        if (bulls === 4) {
            setStatus('won');
            const duration = Math.floor((Date.now() - startTime) / 1000);
            setGameTime(duration);
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
                    attempts: guesses.length + 1, // Current guess counts too
                    time: gameTime,
                    mode: 'solo'
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

    const toggleScratch = (digit: string) => {
        setScratchpad(prev => ({
            ...prev,
            [digit]: !prev[digit]
        }));
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 perspective-1000 flex flex-col md:flex-row gap-8 items-start justify-center">
            {/* Main Game Card */}
            <div className={`flex-1 w-full max-w-md relative bg-white/10 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-white/20 overflow-hidden transition-all duration-500 transform ${status === 'won' ? 'scale-105 border-green-400/50 shadow-green-500/20' : ''}`}>

                {onBack && (
                    <button
                        onClick={onBack}
                        className="absolute top-4 left-4 text-white/30 hover:text-white transition-colors z-10"
                    >
                        ← Menu
                    </button>
                )}

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                        VACAS Y TOROS
                    </h1>
                    <p className="text-blue-200 text-sm font-medium tracking-wide uppercase opacity-80">
                        Guess the 4-digit number
                    </p>
                </div>

                {/* Game Area */}
                <div className="space-y-6">
                    {/* Input Form */}
                    <form onSubmit={handleSubmit} className="relative group">
                        <input
                            ref={inputRef}
                            type="text"
                            maxLength={4}
                            value={input}
                            onChange={(e) => {
                                if (e.target.value.length <= 4) setInput(e.target.value);
                                setError('');
                            }}
                            placeholder="Type 4 unique digits..."
                            disabled={status === 'won'}
                            inputMode="numeric"
                            pattern="[0-9]*"
                            className="w-full bg-black/20 text-white text-center text-3xl tracking-[1em] font-mono py-4 rounded-2xl border-2 border-white/10 focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20 outline-none transition-all duration-300 placeholder:text-white/10 placeholder:tracking-normal placeholder:text-lg hover:border-white/20"
                        />
                        {error && (
                            <div className="absolute -bottom-6 left-0 right-0 text-center text-red-400 text-sm font-bold animate-bounce">
                                {error}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={status === 'won' || input.length !== 4}
                            className="absolute right-2 top-2 bottom-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:grayscale shadow-lg shadow-purple-500/30 flex items-center justify-center"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </button>
                    </form>

                    {/* Victory Message */}
                    {status === 'won' && (
                        <div className="text-center py-6 animate-in zoom-in-50 duration-500">
                            <div className="text-6xl mb-2 animate-bounce">🏆</div>
                            <h2 className="text-2xl font-bold text-green-300">¡Lo lograste!</h2>
                            <p className="text-white/60 mb-4">Número: <span className="text-white font-mono font-bold tracking-widest">{secret}</span></p>

                            {!submitted ? (
                                <div className="bg-black/30 rounded-2xl p-4 mb-6 border border-white/10 space-y-4">
                                    <p className="text-xs uppercase tracking-[0.2em] text-purple-300 font-bold">Hall of Fame</p>
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
                                            className="w-full py-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl text-white font-bold text-sm shadow-lg shadow-purple-500/20 disabled:opacity-50"
                                        >
                                            {isSubmitting ? 'Guardando...' : 'Guardar Récord'}
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-white/40 italic">
                                        {guesses.length} intentos en {gameTime} segundos
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 mb-6 animate-in slide-in-from-bottom-2">
                                    <p className="text-green-300 text-sm font-bold">✨ ¡Guardado en el Hall of Fame!</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={startNewGame}
                                    className="px-6 py-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-full text-sm font-bold transition-all duration-300 border border-green-400/30 hover:border-green-400/50 hover:scale-105 active:scale-95 shadow-lg shadow-green-500/10"
                                >
                                    🎮 Jugar de Nuevo
                                </button>
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="px-6 py-2 text-white/40 hover:text-white transition-colors text-xs font-bold"
                                    >
                                        Salir al Menú
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* History List */}
                    <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                        {guesses.map((g, i) => (
                            <div key={i} className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 hover:border-white/20 hover:bg-black/30 hover:scale-[1.02] transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 zoom-in-50 fill-mode-backwards cursor-default" style={{ animationDelay: `${i * 50}ms` }}>
                                <span className="text-2xl font-mono tracking-widest text-white/90">{g.number}</span>
                                <div className="flex gap-6">
                                    {/* Bulls (Toros) */}
                                    <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${g.bulls > 0
                                        ? 'scale-125'
                                        : ''
                                        }`}>
                                        <div className={`relative ${g.bulls > 0 ? 'animate-pulse' : ''}`}>
                                            <span className="text-3xl drop-shadow-lg">🐂</span>
                                            {g.bulls > 0 && (
                                                <div className="absolute inset-0 bg-green-500/30 blur-xl rounded-full"></div>
                                            )}
                                        </div>
                                        <span className={`text-sm font-bold transition-all ${g.bulls > 0
                                            ? 'text-green-300 scale-110'
                                            : 'text-green-400/40'
                                            }`}>
                                            {g.bulls} Toros
                                        </span>
                                    </div>
                                    {/* Cows (Vacas) */}
                                    <div className={`flex flex-col items-center gap-1 transition-all duration-300 ${g.cows > 0
                                        ? 'scale-125'
                                        : ''
                                        }`}>
                                        <div className={`relative ${g.cows > 0 ? 'animate-pulse' : ''}`}>
                                            <span className="text-3xl drop-shadow-lg">🐄</span>
                                            {g.cows > 0 && (
                                                <div className="absolute inset-0 bg-yellow-500/30 blur-xl rounded-full"></div>
                                            )}
                                        </div>
                                        <span className={`text-sm font-bold transition-all ${g.cows > 0
                                            ? 'text-yellow-300 scale-110'
                                            : 'text-yellow-400/40'
                                            }`}>
                                            {g.cows} Vacas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Rules */}
                <div className="mt-8 text-center text-white/30 text-xs">
                    <p>🐂 Toro: Right digit, right place</p>
                    <p>🐄 Vaca: Right digit, wrong place</p>
                </div>
            </div>

            {/* Scratchpad Side Panel */}
            <div className="flex flex-col gap-3">
                <span className="text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold text-center md:rotate-90 md:mb-8 whitespace-nowrap">
                    Descartar números
                </span>
                <div className="w-full md:w-24 bg-white/5 backdrop-blur-sm rounded-3xl p-4 border border-white/10 flex flex-row md:flex-col gap-3 items-center justify-center flex-wrap shrink-0 shadow-inner shadow-black/20">
                    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                        <button
                            key={digit}
                            onClick={() => toggleScratch(digit)}
                            className={`w-12 h-12 rounded-full font-mono font-bold text-xl transition-all duration-300 border relative overflow-hidden group hover:shadow-lg hover:shadow-purple-500/20 active:scale-90 ${scratchpad[digit]
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
        </div>
    );
}
