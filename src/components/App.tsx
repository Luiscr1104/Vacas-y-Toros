import React, { useState } from 'react';
import Peer from 'peerjs';
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

    if (!gameMode) {
        return <MainMenu onStartGame={(mode) => setGameMode(mode)} />;
    }

    if (gameMode === 'solo') {
        return <Game />;
    }

    // VS Mode
    if (vsState === 'lobby') {
        return (
            <VSLobby
                onGameStart={(p, conn, host) => {
                    setPeer(p);
                    setConnection(conn);
                    setIsHost(host);
                    setVSState('game');
                }}
                onBack={exitToMainMenu}
            />
        );
    }

    if (peer && connection) {
        return (
            <VSGame
                peer={peer}
                connection={connection}
                isHost={isHost}
                onExit={exitToMainMenu}
            />
        );
    }

    return null;
}
