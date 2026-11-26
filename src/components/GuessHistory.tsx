import type { Guess } from '../lib/game';
import Icon from './Icon';

export default function GuessHistory({ guesses, title }: { guesses: Guess[]; title: string }) {
    return (
        <section className="history-card paper-card" aria-label={title}>
            <div className="section-heading"><h2>{title}</h2><span className="count-pill">{guesses.length} intentos</span></div>
            {guesses.length === 0 ? (
                <div className="empty-history"><Icon name="spark" size={29} /><strong>Las pistas llegarán pronto.</strong><p>Cada intento cuenta una parte del misterio.</p></div>
            ) : (
                <div className="guess-history">
                    <div className="history-labels"><span>INTENTO</span><span>TOROS / VACAS</span></div>
                    <ol>{[...guesses].reverse().map((guess, index) => (
                        <li key={guess.number} className="guess-row">
                            <span className="guess-index">{String(guesses.length - index).padStart(2, '0')}</span>
                            <strong>{guess.number}</strong>
                            <span className="result-badge bull-result" aria-label={`${guess.bulls} toros`}>{guess.bulls} <span>T</span></span>
                            <span className="result-badge cow-result" aria-label={`${guess.cows} vacas`}>{guess.cows} <span>V</span></span>
                        </li>
                    ))}</ol>
                </div>
            )}
            <div className="history-legend"><span><i className="legend-dot green" /> Toro: en su lugar</span><span><i className="legend-dot yellow" /> Vaca: en otro lugar</span></div>
        </section>
    );
}
