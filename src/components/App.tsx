import { useEffect, useState } from 'react';
import { audio } from '../lib/audio';
import MainMenu from './MainMenu';
import Game from './Game';
import Versus from './Versus';
import Tutorial from './Tutorial';
import Mascot from './Mascot';
import Icon from './Icon';
import Leaderboard from './Leaderboard';

type Screen = 'home' | 'solo' | 'vs' | 'tutorial' | 'ranking';

export default function App() {
    const [screen, setScreen] = useState<Screen>('home');
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        if (new URLSearchParams(window.location.search).has('room')) setScreen('vs');
        try {
            const muted = localStorage.getItem('vyt-muted') === 'true';
            setIsMuted(muted);
            audio.setMuted(muted);
        } catch { /* Sound can still be changed without browser storage. */ }
    }, []);

    const navigate = (next: Screen) => {
        audio.play('click');
        setScreen(next);
        window.scrollTo({ top: 0, behavior: 'instant' });
    };

    const exitToMainMenu = () => {
        const url = new URL(window.location.href);
        url.searchParams.delete('room');
        window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
        navigate('home');
    };

    const startSolo = () => {
        let hasLearned = false;
        try { hasLearned = localStorage.getItem('vyt-learned') === 'true'; } catch { /* Optional persistence. */ }
        navigate(hasLearned ? 'solo' : 'tutorial');
    };

    return (
        <div className="ranch-app">
            <header className="site-header">
                <button className="brand" onClick={exitToMainMenu} disabled={screen === 'vs'} aria-label={screen === 'vs' ? 'Vacas y Toros' : 'Vacas y Toros, ir al inicio'}>
                    <span className="brand-mascot"><Mascot animal="cow" /></span>
                    <span>vacas<span className="brand-amp"> & </span>toros<span className="brand-dot">.</span><small>UN DUELO DE INGENIO</small></span>
                </button>
                <nav className="header-actions" aria-label="Navegación principal">
                    {screen !== 'vs' && <><button className="text-button ranking-nav" onClick={() => navigate('ranking')} aria-label="Ver salón de la fama"><Icon name="trophy" size={17} /><span>Ranking</span></button>
                    <button className="text-button header-help" onClick={() => navigate('tutorial')}>Cómo jugar <Icon name="help" size={17} /></button></>}
                    <span className="nav-divider" />
                    <button className="sound-button" aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'} aria-pressed={isMuted} onClick={() => {
                        const muted = !isMuted;
                        setIsMuted(muted);
                        audio.setMuted(muted);
                        try { localStorage.setItem('vyt-muted', String(muted)); } catch { /* Optional persistence. */ }
                        if (!muted) audio.play('click');
                    }}><Icon name={isMuted ? 'mute' : 'sound'} size={19} /><span>Sonido {isMuted ? 'no' : 'sí'}</span></button>
                </nav>
            </header>

            {screen === 'home' && <MainMenu onStartGame={mode => mode === 'solo' ? startSolo() : navigate('vs')} onTutorial={() => navigate('tutorial')} />}
            {screen === 'tutorial' && <main className="tutorial-page"><button className="text-button" onClick={exitToMainMenu}><Icon name="back" size={18} /> Volver al rancho</button><Tutorial onDone={() => {
                try { localStorage.setItem('vyt-learned', 'true'); } catch { /* Optional persistence. */ }
                audio.play('start');
                navigate('solo');
            }} /></main>}
            {screen === 'solo' && <Game onBack={exitToMainMenu} />}
            {screen === 'ranking' && <Leaderboard onBack={exitToMainMenu} />}
            {screen === 'vs' && <Versus onExit={exitToMainMenu} />}

            <footer className="site-footer"><span>Hecho para pensar. Diseñado para picarse.</span><span>Un clásico de siempre, con un poco más de <b>muuu.</b><span className="footer-flower" aria-hidden="true">✳</span></span></footer>
        </div>
    );
}
