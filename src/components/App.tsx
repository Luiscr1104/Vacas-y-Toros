import React, { useState } from 'react';
import Peer from 'peerjs';
import { audio } from '../lib/audio';
import MainMenu from './MainMenu';
import Game from './Game';
import VSLobby from './VSLobby';
import VSGame from './VSGame';

type GameMode = 'solo' | 'vs' | null;
type VSState = 'lobby' | 'game';

export default function App() {
    const [gameMode, setGameMode] = useState<GameMode>(null);
    const [vsState, setVSState] = useState<VSState>('lobby');
    const [peer, setPeer] = useState<Peer | null>(null);
    const [connection, setConnection] = useState<any | null>(null);
    const [isHost, setIsHost] = useState<boolean>(false);
    const [isMuted, setIsMuted] = useState<boolean>(false);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        audio.setMuted(newMuted);
    };

    const exitToMainMenu = () => {
        // Reset state
        setGameMode(null);
        setVSState('lobby');
        setPeer(null);
        if (connection) {
            connection.close();
            setConnection(null);
        }
        // Clear URL parameters without reloading
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.pushState({}, '', url.pathname);
    };

    // Auto-join room if ID is in URL
    React.useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('room')) {
            setGameMode('vs');
        }
    }, []);

    return (
        <div className="relative min-h-screen py-10 sm:py-20 px-4">
            {/* Global Audio Control */}
            <button
                onClick={toggleMute}
                className="fixed top-6 right-6 z-[100] w-12 h-12 flex items-center justify-center premium-glass rounded-2xl text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-2xl group border border-white/20"
                title={isMuted ? "Activar sonido" : "Silenciar"}
            >
                {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                )}
                {/* Tooltip hint */}
                <span className="absolute right-16 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10 whitespace-nowrap">
                    {isMuted ? 'Muted' : 'Sound ON'}
                </span>
            </button>

            {gameMode === 'solo' && <Game onBack={exitToMainMenu} />}

            {gameMode === 'vs' && vsState === 'lobby' && (
                <VSLobby
                    onGameStart={(p, conn, host) => {
                        setPeer(p);
                        setConnection(conn);
                        setIsHost(host);
                        setVSState('game');
                    }}
                    onBack={exitToMainMenu}
                />
            )}

            {gameMode === 'vs' && vsState === 'game' && peer && connection && (
                <VSGame
                    peer={peer}
                    connection={connection}
                    isHost={isHost}
                    onExit={exitToMainMenu}
                />
            )}

            {!gameMode && <MainMenu onStartGame={(mode) => setGameMode(mode)} />}
        </div>
    );
}
