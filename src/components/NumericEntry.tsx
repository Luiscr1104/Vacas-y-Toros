import Icon from './Icon';

interface NumericEntryProps {
    id: string;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    masked?: boolean;
    label: string;
    feedbackId?: string;
    invalid?: boolean;
}

export default function NumericEntry({ id, value, onChange, disabled = false, masked = false, label, feedbackId, invalid }: NumericEntryProps) {
    return (
        <>
            <label className="sr-only" htmlFor={id}>{label}</label>
            <div className={`code-input-wrap ${disabled ? 'entry-disabled' : ''}`}>
                <div className="code-tiles" aria-hidden="true">
                    {Array.from({ length: 4 }, (_, index) => (
                        <span className={`code-tile ${value[index] ? 'filled' : ''} ${index === value.length ? 'current' : ''}`} key={index}>
                            {value[index] ? (masked ? '•' : value[index]) : <span className="tile-dot" />}
                        </span>
                    ))}
                </div>
                <input
                    id={id} type={masked ? 'password' : 'text'} className="code-input"
                    value={value} disabled={disabled}
                    onChange={event => onChange(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                    inputMode="none" autoComplete="off" maxLength={4}
                    aria-invalid={invalid || undefined} aria-describedby={feedbackId}
                />
            </div>
            <div className="number-keypad" role="group" aria-label="Teclado numérico">
                {'123456789'.split('').map(digit => (
                    <button key={digit} type="button" disabled={disabled || value.length === 4} onClick={() => onChange((value + digit).slice(0, 4))}>{digit}</button>
                ))}
                <button className="key-clear" type="button" disabled={disabled} onClick={() => onChange('')}>Borrar</button>
                <button type="button" disabled={disabled || value.length === 4} onClick={() => onChange((value + '0').slice(0, 4))}>0</button>
                <button type="button" disabled={disabled} aria-label="Borrar último dígito" onClick={() => onChange(value.slice(0, -1))}><Icon name="delete" /></button>
            </div>
        </>
    );
}
