import React, { useState, useEffect } from 'react';

type Score = {
    name: string;
    attempts: number;
    time: number;
    mode: string;
    date: string;
};

interface MainMenuProps {
    onStartGame: (mode: 'solo' | 'vs') => void;
}

const EXAMPLES = [
    { secret: '1234', guess: '1478', bulls: 1, cows: 1 },
    { secret: '5678', guess: '5612', bulls: 2, cows: 0 },
    { secret: '9012', guess: '2109', bulls: 0, cows: 4 },
];

export default function MainMenu({ onStartGame }: MainMenuProps) {
    const [scores, setScores] = useState<Score[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [exampleIndex, setExampleIndex] = useState(0);

    useEffect(() => {
        const fetchScores = async () => {
            try {
                const response = await fetch('/api/scores');
                if (response.ok) {
                    const data = await response.json();
                    setScores(data);
                }
            } catch (e) {
                console.error('Error fetching scores:', e);
            } finally {
                setLoading(false);
            }
        };
        fetchScores();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setExampleIndex((prev) => (prev + 1) % EXAMPLES.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    const currentExample = EXAMPLES[exampleIndex];

    return (
        <div className="w-full max-w-2xl mx-auto p-4 sm:p-8 perspective-1000">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-12 shadow-2xl border border-white/20 overflow-hidden">

                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce">🐂</div>
                    <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>🐄</div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center space-y-8">
                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-5xl sm:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-2 sm:mb-4 animate-in fade-in zoom-in-50 duration-700 leading-tight">
                            VACAS Y TOROS
                        </h1>
                        <p className="text-lg sm:text-xl text-blue-200 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '0.2s' }}>
                            ¿Puedes adivinar el número?
                        </p>
                    </div>

                    {/* Game Rules - More Visual */}
                    <div className="space-y-4 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-lg sm:text-xl font-bold text-white/90">¿Cómo jugar?</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Toro Card */}
                            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 transition-transform hover:scale-105 group text-left sm:text-center">
                                <div className="text-4xl group-hover:animate-bounce shrink-0">🐂</div>
                                <div>
                                    <h4 className="font-black text-green-400 uppercase tracking-widest text-xs sm:text-sm mb-1">Toro</h4>
                                    <p className="text-[11px] sm:text-xs text-white/60 leading-tight">Dígito correcto en posición <strong>correcta</strong>.</p>
                                </div>
                            </div>

                            {/* Vaca Card */}
                            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-5 border border-white/10 flex flex-row sm:flex-col items-center gap-4 sm:gap-3 transition-transform hover:scale-105 group text-left sm:text-center">
                                <div className="text-4xl group-hover:animate-bounce shrink-0">🐄</div>
                                <div>
                                    <h4 className="font-black text-yellow-400 uppercase tracking-widest text-xs sm:text-sm mb-1">Vaca</h4>
                                    <p className="text-[11px] sm:text-xs text-white/60 leading-tight">Dígito correcto en posición <strong>incorrecta</strong>.</p>
                                </div>
                            </div>
                        </div>

                        {/* Example Box */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-left overflow-hidden relative min-h-[140px]">
                            <p className="text-xs text-blue-200/60 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                                Ejemplo Rápido
                            </p>
                            <div key={exampleIndex} className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-center text-sm font-mono tracking-wider">
                                        <span className="text-white/40">Secreto:</span>
                                        <div className="flex gap-2">
                                            {currentExample.secret.split('').map((d, i) => (
                                                <span key={i} className="text-white w-4 text-center">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-mono tracking-wider">
                                        <span className="text-white/40">Tu intento:</span>
                                        <div className="flex gap-2">
                                            {currentExample.guess.split('').map((d, i) => (
                                                <span key={i} className={`w-4 text-center font-bold ${currentExample.secret[i] === d ? 'text-green-400' : currentExample.secret.includes(d) ? 'text-yellow-400' : 'text-white'}`}>
                                                    {d}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="h-px bg-white/10 my-1"></div>
                                    <div className="flex justify-between items-center font-bold">
                                        <span className="text-xs text-white/40">Resultado:</span>
                                        <div className="flex gap-4">
                                            <span className={`transition-all duration-300 ${currentExample.bulls > 0 ? 'text-green-300 scale-110' : 'text-white/20'}`}>
                                                {currentExample.bulls} 🐂
                                            </span>
                                            <span className={`transition-all duration-300 ${currentExample.cows > 0 ? 'text-yellow-300 scale-110' : 'text-white/20'}`}>
                                                {currentExample.cows} 🐄
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-50 duration-700" style={{ animationDelay: '0.6s' }}>
                        {/* Solo Mode */}
                        <button
                            onClick={() => onStartGame('solo')}
                            className="group relative p-4 sm:p-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95"
                        >
                            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-center">🎮</div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center">Solo</h3>
                            <p className="text-xs sm:text-sm text-white/60 text-center">Juega contra la computadora</p>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                        </button>

                        {/* VS Mode */}
                        <button
                            onClick={() => onStartGame('vs')}
                            className="group relative p-4 sm:p-6 bg-gradient-to-br from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border-2 border-pink-400/30 hover:border-pink-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 active:scale-95"
                        >
                            <div className="text-4xl sm:text-5xl mb-2 sm:mb-3 text-center">⚔️</div>
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 text-center">Modo VS</h3>
                            <p className="text-xs sm:text-sm text-white/60 text-center">Juega contra otro jugador</p>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                        </button>
                    </div>

                    {/* Hall of Fame / Leaderboard */}
                    <div className="mt-12 space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '0.8s' }}>
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-xl font-black text-white/90 flex items-center gap-2">
                                <span className="text-2xl">🏆</span> Salón de la Fama
                            </h2>
                            <span className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Top 10 Global</span>
                        </div>

                        <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-inner shadow-black/40">
                            {loading ? (
                                <div className="p-8 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                                </div>
                            ) : scores.length === 0 ? (
                                <p className="p-8 text-white/40 italic text-sm">Sé el primero en aparecer aquí...</p>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {scores.map((score, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <span className={`w-6 text-sm font-black ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-white/20'}`}>
                                                    #{index + 1}
                                                </span>
                                                <span className="text-white font-bold text-sm tracking-wide">{score.name}</span>
                                            </div>
                                            <div className="flex gap-4 text-xs font-mono">
                                                <span className="text-purple-300">{score.attempts} <span className="text-[10px] opacity-60">pasos</span></span>
                                                <span className="text-blue-300">{score.time}s</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
