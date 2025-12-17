import React from 'react';

interface MainMenuProps {
    onStartGame: (mode: 'solo' | 'vs') => void;
}

export default function MainMenu({ onStartGame }: MainMenuProps) {
    return (
        <div className="w-full max-w-2xl mx-auto p-8 perspective-1000">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20 overflow-hidden">

                {/* Animated background elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-10 left-10 text-6xl opacity-10 animate-bounce">🐂</div>
                    <div className="absolute bottom-10 right-10 text-6xl opacity-10 animate-bounce" style={{ animationDelay: '0.5s' }}>🐄</div>
                </div>

                {/* Content */}
                <div className="relative z-10 text-center space-y-8">
                    {/* Title */}
                    <div className="space-y-4">
                        <h1 className="text-6xl md:text-7xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4 animate-in fade-in zoom-in-50 duration-700">
                            VACAS Y TOROS
                        </h1>
                        <p className="text-xl text-blue-200 font-medium tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '0.2s' }}>
                            ¿Puedes adivinar el número secreto?
                        </p>
                    </div>

                    {/* Game Rules */}
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/10 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: '0.4s' }}>
                        <h2 className="text-lg font-bold text-white/90 mb-3">Cómo Jugar</h2>
                        <div className="space-y-2 text-sm text-white/70">
                            <p className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🎯</span>
                                <span>Adivina el número de 4 dígitos únicos</span>
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🐂</span>
                                <span><strong className="text-green-300">Toro</strong>: Dígito correcto en posición correcta</span>
                            </p>
                            <p className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🐄</span>
                                <span><strong className="text-yellow-300">Vaca</strong>: Dígito correcto en posición incorrecta</span>
                            </p>
                        </div>
                    </div>

                    {/* Game Mode Selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in zoom-in-50 duration-700" style={{ animationDelay: '0.6s' }}>
                        {/* Solo Mode */}
                        <button
                            onClick={() => onStartGame('solo')}
                            className="group relative p-6 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 hover:from-purple-500/30 hover:to-indigo-500/30 border-2 border-purple-400/30 hover:border-purple-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 active:scale-95"
                        >
                            <div className="text-5xl mb-3">🎮</div>
                            <h3 className="text-xl font-bold text-white mb-2">Solo</h3>
                            <p className="text-sm text-white/60">Juega contra la computadora</p>
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                        </button>

                        {/* VS Mode */}
                        <button
                            onClick={() => onStartGame('vs')}
                            className="group relative p-6 bg-gradient-to-br from-pink-500/20 to-rose-500/20 hover:from-pink-500/30 hover:to-rose-500/30 border-2 border-pink-400/30 hover:border-pink-400/60 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/30 active:scale-95"
                        >
                            <div className="text-5xl mb-3">⚔️</div>
                            <h3 className="text-xl font-bold text-white mb-2">VS</h3>
                            <p className="text-sm text-white/60">Juega contra otro jugador</p>
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
