export interface Guess {
    number: string;
    bulls: number;
    cows: number;
}

export function validateGuess(value: string): string | null {
    if (!/^[0-9]{4}$/.test(value)) return 'Escribe cuatro dígitos del 0 al 9.';
    if (new Set(value).size !== 4) return 'Cada dígito debe ser diferente.';
    return null;
}

export function evaluateGuess(guess: string, secret: string) {
    if (validateGuess(guess) || validateGuess(secret)) throw new Error('Número inválido');
    let bulls = 0;
    let cows = 0;
    for (let i = 0; i < secret.length; i++) {
        if (guess[i] === secret[i]) bulls++;
        else if (secret.includes(guess[i])) cows++;
    }
    return { bulls, cows };
}

export function generateSecret(): string {
    const digits = Array.from({ length: 10 }, (_, i) => String(i));
    let secret = '';
    for (let i = 0; i < 4; i++) {
        const index = Math.floor(Math.random() * digits.length);
        secret += digits.splice(index, 1)[0];
    }
    return secret;
}

export function formatTime(seconds: number): string {
    return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}
