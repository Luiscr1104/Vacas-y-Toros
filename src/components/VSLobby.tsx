import { useState } from 'react';
import Icon from './Icon';
import Mascot from './Mascot';

interface VSLobbyProps {
    initialCode: string;
    busy: boolean;
    error: string;
    onCreate: (name: string) => Promise<void>;
    onJoin: (code: string, name: string) => Promise<void>;
}

export default function VSLobby({ initialCode, busy, error, onCreate, onJoin }: VSLobbyProps) {
    const [name, setName] = useState('');
    const [code, setCode] = useState(initialCode);
    const [joining, setJoining] = useState(Boolean(initialCode));

    return (
        <section className="duel-lobby paper-card" aria-labelledby="duel-lobby-title">
            <div className="lobby-art"><Mascot animal="cow" happy /><span>VS</span><Mascot animal="bull" /></div>
            <span className="eyebrow">DOS CABEZAS. UN BUEN PIQUE.</span>
            <h1 id="duel-lobby-title">{joining ? '¡Te esperan en el rancho!' : 'Aquí empieza la rivalidad.'}</h1>
            <p>Elige un código secreto y descifra el de tu rival.<br />El servidor lleva las cuentas. Tú pones el ingenio.</p>
            <div className="duel-tabs" aria-label="Tipo de entrada">
                <button type="button" aria-pressed={!joining} disabled={busy} onClick={() => setJoining(false)}>Crear un duelo</button>
                <button type="button" aria-pressed={joining} disabled={busy} onClick={() => setJoining(true)}>Entrar con código</button>
            </div>
            <form className="duel-lobby-form" onSubmit={event => {
                event.preventDefault();
                if (joining) void onJoin(code.trim().toUpperCase(), name.trim());
                else void onCreate(name.trim());
            }}>
                <label htmlFor="duel-name">¿Cómo te llamamos?</label>
                <input id="duel-name" value={name} onChange={event => setName(event.target.value)} maxLength={15} required autoComplete="nickname" disabled={busy} placeholder="Tu apodo de detective" />
                {joining && <>
                    <label htmlFor="duel-code">Código de la sala</label>
                    <input id="duel-code" className="room-code-input" value={code} onChange={event => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8))} minLength={8} maxLength={8} required autoComplete="off" disabled={busy} placeholder="ABCD2345" />
                </>}
                {error && <p className="duel-error" role="alert">{error}</p>}
                <button className="ranch-button primary" disabled={busy || !name.trim() || (joining && code.length !== 8)}>
                    {busy ? 'Preparando el rancho…' : joining ? '¡Entrar al duelo!' : 'Crear sala e invitar'} <Icon name="arrow" />
                </button>
            </form>
            <p className="fine-print">Sin cuentas. Tu sesión se guarda en una cookie privada de este navegador. Para jugar entre dos personas, usa dispositivos o perfiles de navegador distintos.</p>
        </section>
    );
}
