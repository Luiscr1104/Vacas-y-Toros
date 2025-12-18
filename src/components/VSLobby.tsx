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
            // Handle fatal errors or just display status
            if (err.type === 'peer-unavailable') {
                setStatus('Error: La sala ya no existe o el host se desconectó.');
            } else {
                setStatus(`Error: ${err.type}`);
            }
        });

        newPeer.on('disconnected', () => {
            console.log('Peer disconnected, attempting to reconnect...');
            setStatus('Conexión perdida. Intentando reconectar...');
            newPeer.reconnect();
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
        const link = shareUrl;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleNativeShare = async () => {
        const shareData = {
            title: 'Vacas y Toros - ¡Juega Conmigo!',
            text: 'Únete a mi partida de Vacas y Toros.',
            url: shareUrl,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Error sharing:', err);
                    shareLink();
                }
            }
        } else {
            shareLink();
        }
    };

    const handleReconnect = () => {
        if (peer && peer.disconnected) {
            setStatus('Reconectando manualmente...');
            peer.reconnect();
        } else {
            window.location.reload();
        }
    };

    const shareUrl = `${window.location.origin}${window.location.pathname}?room=${peerId}`;

    return (
        <div className="w-full max-w-2xl mx-auto p-8">
            <div className="relative bg-white/10 backdrop-blur-md rounded-3xl p-12 shadow-2xl border border-white/20">

                {/* Back Button */}
                <button
                    onClick={onBack}
                    className="absolute top-6 left-6 text-white/50 hover:text-white transition-all z-10 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 text-xs font-bold flex items-center gap-2"
                >
                    <span>←</span> Volver
                </button>

                <div className="text-center space-y-6">
                    <h2 className="text-4xl font-black bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                        Modo VS
                    </h2>

                    {/* Status */}
                    <div className="bg-black/20 rounded-2xl p-6 border border-white/10">
                        <p className="text-lg text-white/80">{status}</p>
                        {status.includes('Error') && (
                            <button
                                onClick={handleReconnect}
                                className="mt-4 text-xs text-purple-400 hover:text-purple-300 underline"
                            >
                                Reintentar / Recargar
                            </button>
                        )}
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

                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleNativeShare}
                                    className="flex-1 px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold rounded-full transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <span>📤 Enviar por WhatsApp / Otros</span>
                                </button>

                                <button
                                    onClick={shareLink}
                                    className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/80 rounded-full border border-white/10 transition-all text-sm"
                                >
                                    {copied ? '✓ Copiado' : '📋 Copiar'}
                                </button>
                            </div>

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
