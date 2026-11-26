import { useEffect, useState } from 'react';
import Icon from './Icon';
import Mascot from './Mascot';
import { formatTime } from '../lib/game';

interface Score { _id: string; name: string; attempts: number; time: number; mode: string; opponent?: string; }

export default function Leaderboard({ onBack }: { onBack: () => void }) {
    const [scores, setScores] = useState<Score[]>([]);
    const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
    const [retry, setRetry] = useState(0);
    const [mode, setMode] = useState<'solo' | 'vs'>('solo');

    useEffect(() => {
        const controller = new AbortController();
        setStatus('loading');
        fetch(`/api/scores?mode=${mode}`, { signal: controller.signal })
            .then(async response => {
                if (!response.ok) throw new Error('Ranking no disponible');
                const data = await response.json();
                if (!Array.isArray(data)) throw new Error('Respuesta inválida');
                const validScores = data.filter((score: unknown): score is Score => {
                    if (!score || typeof score !== 'object') return false;
                    const entry = score as Partial<Score>;
                    return typeof entry._id === 'string' && typeof entry.name === 'string' &&
                        Number.isSafeInteger(entry.attempts) && Number(entry.attempts) > 0 &&
                        Number.isSafeInteger(entry.time) && Number(entry.time) >= 0;
                });
                if (!controller.signal.aborted) { setScores(validScores); setStatus('ready'); }
            })
            .catch(() => { if (!controller.signal.aborted) setStatus('error'); });
        return () => controller.abort();
    }, [retry, mode]);

    return <main className="leaderboard-page">
        <button className="text-button" onClick={onBack}><Icon name="back" size={18} /> Volver al rancho</button>
        <section className="leaderboard-card paper-card">
            <div className="eyebrow"><Icon name="trophy" size={18} /> EL ORGULLO DEL RANCHO</div>
            <h1>Salón de la fama</h1>
            <p>{mode === 'solo' ? 'Récords individuales declarados por los jugadores; no verificados.' : 'Los últimos duelos resueltos y verificados por el servidor. Sin victorias por abandono.'}</p>
            <div className="duel-tabs"><button aria-pressed={mode === 'solo'} onClick={() => setMode('solo')}>Récords individuales</button><button aria-pressed={mode === 'vs'} onClick={() => setMode('vs')}>Duelos verificados</button></div>
            <div aria-live="polite">
                {status === 'loading' && <p className="ranking-message">Buscando a las mejores cabezas del rancho…</p>}
                {status === 'error' && <div className="ranking-empty"><Mascot animal="cow" /><h2>El ranking se fue a pastar.</h2><p>No pudimos conectar. Puedes seguir jugando y guardar tus récords en este dispositivo.</p><button className="ranch-button primary" onClick={() => setRetry(previous => previous + 1)}>Volver a intentar</button></div>}
                {status === 'ready' && (scores.length === 0 ? <div className="ranking-empty"><Mascot animal="bull" happy /><h2>{mode === 'solo' ? '¡El podio está libre!' : '¡Estrena las rivalidades!'}</h2><p>{mode === 'solo' ? 'Resuelve una partida y guarda tu resultado para aparecer aquí.' : 'Al descifrar el código del rival, el resultado se guarda automáticamente.'}</p></div> : <ol className="ranking-list">{scores.map((score, index) => <li key={score._id}><span className={`ranking-position ${mode === 'solo' && index < 3 ? 'podium' : ''}`}>{mode === 'vs' ? <Icon name="users" size={18} /> : String(index + 1).padStart(2, '0')}</span><div><strong>{score.name}</strong><span>{mode === 'vs' ? `Ganó a ${score.opponent || 'su rival'}` : 'Modo individual · declarado'}</span></div><span className="ranking-attempts"><b>{score.attempts}</b> intentos</span><span className="ranking-time">{formatTime(score.time)}</span></li>)}</ol>)}
            </div>
        </section>
    </main>;
}
