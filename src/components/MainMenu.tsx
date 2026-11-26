import { useEffect, useState } from 'react';
import Mascot from './Mascot';
import Icon from './Icon';
import { readStats, type Stats } from '../lib/stats';
import { formatTime } from '../lib/game';

interface MainMenuProps {
    onStartGame: (mode: 'solo' | 'vs') => void;
    onTutorial: () => void;
}

export default function MainMenu({ onStartGame, onTutorial }: MainMenuProps) {
    const [stats, setStats] = useState<Stats | null>(null);
    useEffect(() => setStats(readStats()), []);

    return (
        <main className="home-page">
            <section className="home-hero">
                <div className="hero-copy">
                    <div className="eyebrow"><span className="status-dot" /> UN CLÁSICO CON MUCHO CARÁCTER</div>
                    <h1>Un poco de lógica.<br />Un montón de<br /><span className="fun-word">¡muuucha diversión!<svg viewBox="0 0 500 20" aria-hidden="true"><path d="M4 13Q240-4 492 10M15 18Q230 8 473 17" /></svg></span></h1>
                    <p>Cuatro dígitos secretos. Dos cómplices con cuernos.<br className="desktop-break" /> ¿Tienes lo que hace falta para descifrar el código?</p>
                    <div className="hero-actions">
                        <button className="ranch-button primary play-button" onClick={() => onStartGame('solo')}>¡Vamos a jugar! <Icon name="arrow" /></button>
                        <button className="text-button" onClick={onTutorial}><Icon name="help" size={19} /> ¿Cómo se juega?</button>
                    </div>
                    <div className="hero-footnote"><span className="mini-stars">✦ ✦ ✦</span> Gratis, sin registro y con mucha cabeza.</div>
                </div>
                <div className="ranch-scene" aria-label="Una vaca y un toro cartoon junto a un código secreto" role="img">
                    <div className="scene-sun"><Icon name="spark" size={39} /></div>
                    <div className="scene-cloud cloud-one" /><div className="scene-cloud cloud-two" />
                    <div className="scene-bubble">¿Nos lees la mente?<span>✦</span></div>
                    <div className="scene-hill hill-back" /><div className="scene-hill hill-front" />
                    <div className="scene-fence"><i /><i /><i /><i /></div>
                    <Mascot animal="cow" className="scene-cow" happy />
                    <Mascot animal="bull" className="scene-bull" />
                    <div className="secret-sign"><span>SE BUSCA: TU MEJOR JUGADA</span><div>{['?', '?', '?', '?'].map((digit, i) => <b key={i}>{digit}</b>)}</div></div>
                    <span className="scene-flower flower-one">✳</span><span className="scene-flower flower-two">✳</span>
                    <span className="scene-label">POCAS REGLAS. GRANDES PIQUES.</span>
                </div>
            </section>

            <section className="home-bottom" aria-label="Descubre el juego">
                <div className="rules-panel paper-card">
                    <div className="section-heading"><span className="eyebrow">EL SECRETO ESTÁ EN LAS PISTAS</span><span className="hand-note">fácil de aprender ↴</span></div>
                    <div className="rule-pair">
                        <div className="rule-item"><div className="portrait bull-portrait"><Mascot animal="bull" /></div><div><h2>¡Eso es un toro!</h2><p>Dígito correcto.<br /><strong>Posición correcta.</strong></p></div><span className="rule-badge bull-badge">JUSTO AHÍ</span></div>
                        <div className="rule-item"><div className="portrait cow-portrait"><Mascot animal="cow" /></div><div><h2>¡Ahí va una vaca!</h2><p>Dígito correcto.<br /><strong>Posición equivocada.</strong></p></div><span className="rule-badge cow-badge">CASI, CASI</span></div>
                    </div>
                </div>
                <button className="duel-card" onClick={() => onStartGame('vs')}>
                    <span className="duel-icon"><Icon name="users" size={26} /></span>
                    <span className="eyebrow">LAS BUENAS RIVALIDADES</span>
                    <h2>¿Y si retas<br />a un amigo?</h2>
                    <span className="duel-link">Armar un duelo <Icon name="arrow" size={19} /></span>
                    <span className="duel-doodle" aria-hidden="true">↗</span>
                </button>
            </section>

            <section className="home-stats" aria-label="Tus estadísticas en este dispositivo">
                <div className="stats-caption"><Icon name="trophy" /><span>TU PEQUEÑA<br /><strong>GRAN TRAYECTORIA</strong></span></div>
                <div><strong>{stats?.wins ?? '—'}</strong><span>partidas resueltas</span></div>
                <div><strong>{stats?.bestAttempts ?? '—'}</strong><span>mejor número de intentos</span></div>
                <div><strong>{stats?.bestTime != null ? formatTime(stats.bestTime) : '—'}</strong><span>tu mejor tiempo</span></div>
                <span className="stats-note">Cada detective<br />empieza por algún lado.</span>
            </section>
        </main>
    );
}
