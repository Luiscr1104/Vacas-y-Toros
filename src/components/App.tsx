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
        <div className="relative min-h-screen">
            {/* Global Audio Control */}
            <button
                onClick={toggleMute}
                className="fixed top-4 right-4 z-[100] w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white/60 hover:text-white transition-all hover:scale-110 active:scale-95 shadow-lg group"
                title={isMuted ? "Activar sonido" : "Silenciar"}
            >
                {isMuted ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>
                )}
                {/* Tooltip hint */}
                <span className="absolute right-12 top-1 px-2 py-1 bg-black/60 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
