import React, { useState, useEffect } from 'react';
import Peer from 'peerjs';

interface VSLobbyProps {
    onGameStart: (peer: Peer, connection: any, isHost: boolean) => void;
    onBack: () => void;
}

export default function VSLobby({ onGameStart, onBack }: VSLobbyProps) {
    const [peer, setPeer] = useState<Peer | null>(null);
    const [peerId, setPeerId] = useState<string>('');
    const [roomId, setRoomId] = useState<string>('');
    const [connection, setConnection] = useState<any | null>(null);
    const [status, setStatus] = useState<string>('Inicializando...');
    const [isHost, setIsHost] = useState<boolean>(false);
    const [copied, setCopied] = useState<boolean>(false);

    useEffect(() => {
        // Check if joining via URL
        const params = new URLSearchParams(window.location.search);
        const joinRoomId = params.get('room');

        // Initialize PeerJS
        const newPeer = new Peer();

        newPeer.on('open', (id) => {
            setPeerId(id);
            setPeer(newPeer);

            if (joinRoomId) {
                // Guest joining
                setRoomId(joinRoomId);
                setStatus('Conectando a la sala...');
                connectToRoom(newPeer, joinRoomId);
            } else {
                // Host creating room
                setIsHost(true);
                setStatus('Sala creada. Comparte el enlace con tu amigo.');
            }
        });

        newPeer.on('connection', (conn) => {
            // Host receives connection from guest
            console.log('Host: Received connection from guest');
            setConnection(conn);
            setStatus('¡Amigo conectado! Preparando juego...');

            conn.on('open', () => {
                console.log('Host: Connection is now open');
                setStatus('Conexión establecida. Verificando...');

                // Wait longer to ensure connection is stable
                setTimeout(() => {
                    console.log('Host: Verifying connection before starting game');
                    console.log('Host: Connection.open =', conn.open);

                    if (conn.open) {
                        console.log('Host: Connection verified, starting game');
                        onGameStart(newPeer, conn, true);
                    } else {
                        console.error('Host: Connection not open after delay!');
                        setStatus('Error: Conexión perdida');
                    }
                }, 1500);
            });

            conn.on('error', (err) => {
                console.error('Host connection error:', err);
                setStatus('Error de conexión');
            });

            conn.on('close', () => {
                console.log('Host: Connection closed');
                setStatus('Conexión cerrada');
            });
        });

        newPeer.on('error', (err) => {
            console.error('PeerJS error:', err);
            setStatus(`Error: ${err.type}`);
        });

        // DON'T destroy peer on unmount - we need it to stay alive for VSGame
        // return () => {
        //     newPeer.destroy();
        // };
    }, []);

    const connectToRoom = (peerInstance: Peer, targetId: string) => {
        console.log('Guest: Connecting to room:', targetId);
        const conn = peerInstance.connect(targetId);

        conn.on('open', () => {
            console.log('Guest: Connection is now open');
            setConnection(conn);
            setStatus('¡Conectado! Verificando...');

            // Wait longer to ensure connection is stable
            setTimeout(() => {
                console.log('Guest: Verifying connection before starting game');
                console.log('Guest: Connection.open =', conn.open);

                if (conn.open) {
                    console.log('Guest: Connection verified, starting game');
                    onGameStart(peerInstance, conn, false);
                } else {
                    console.error('Guest: Connection not open after delay!');
                    setStatus('Error: Conexión perdida');
                }
            }, 1500);
        });

        conn.on('error', (err) => {
            console.error('Guest connection error:', err);
            setStatus('Error al conectar. Verifica el enlace.');
        });

        conn.on('close', () => {
            console.log('Guest: Connection closed');
            setStatus('Conexión cerrada');
        });
    };

    const shareLink = () => {
        const link = `${window.location.origin}${window.location.pathname}?room=${peerId}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${peerId}`;

    return (
        <div className="w-full max-w-2xl mx-auto p-8">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20">

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-4 left-4 text-white/60 hover:text-white transition-colors"
                >
                    ← Volver
                </button>

                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                        Modo VS
                    </h2>

                    {/* Status */}
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
                        <p className="text-lg text-white/80">{status}</p>
                    </div>

                    {/* Host: Show share link */}
                    {isHost && peerId && !connection && (
                        <div className="space-y-4">
                            <div className="bg-black/30 rounded-xl p-4 border border-purple-400/30">
                                <p className="text-sm text-white/60 mb-2">Enlace de Invitación:</p>
                                <div className="bg-black/40 rounded-lg p-3 font-mono text-sm text-purple-300 break-all">
                                    {shareUrl}
                                </div>
                            </div>

                            <button
                                onClick={shareLink}
                                className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
                            >
                                {copied ? '✓ Copiado!' : '📋 Copiar Enlace'}
                            </button>

                            <p className="text-sm text-white/40">
                                Esperando a que tu amigo se conecte...
                            </p>
                        </div>
                    )}

                    {/* Guest: Connecting */}
                    {!isHost && (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
