import { useState } from 'react';
import Icon from './Icon';
import Mascot from './Mascot';

export default function Tutorial({ onDone }: { onDone: () => void }) {
    const [revealed, setRevealed] = useState(false);
    return (
        <section className="tutorial-card paper-card" aria-labelledby="tutorial-title">
            <div className="eyebrow"><span className="status-dot" /> ESCUELITA DEL RANCHO</div>
            <h1 id="tutorial-title">Cuatro dígitos.<br /><span>Un pequeño misterio.</span></h1>
            <p>Encuentra el código secreto. No se repiten dígitos y sí, puede empezar por cero.</p>
            <div className="tutorial-example">
                <span className="eyebrow">EN ESTE EJEMPLO, EL SECRETO ES</span>
                <div className="code-tiles small">{'1234'.split('').map((digit, i) => <span className="code-tile" key={i}>{digit}</span>)}</div>
                <p>Vamos a probar con <strong>1478</strong>. ¿Qué pistas recibimos?</p>
                <button className="ranch-button primary" onClick={() => setRevealed(true)} disabled={revealed}>
                    {revealed ? '¡Pistas descubiertas!' : 'Probar 1478'} <Icon name="spark" />
                </button>
            </div>
            {revealed && (
                <div className="tutorial-reveal" role="status">
                    <div className="lesson"><Mascot animal="bull" /><div><strong>1 toro</strong><p>El <b>1</b> está y en su lugar.</p></div></div>
                    <div className="lesson"><Mascot animal="cow" /><div><strong>1 vaca</strong><p>El <b>4</b> está, pero en otro lugar.</p></div></div>
                    <p className="fine-print">Durante la partida solo sabrás cuántos toros y vacas hay, no qué dígitos son. ¡Ahí está el reto!</p>
                </div>
            )}
            <button className="ranch-button ink tutorial-done" onClick={onDone}>
                {revealed ? '¡Entendido, a jugar!' : 'Ya sé jugar, saltar tutorial'} <Icon name="arrow" />
            </button>
        </section>
    );
}
