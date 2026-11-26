export interface Stats {
    wins: number;
    bestAttempts: number | null;
    bestTime: number | null;
}

const key = 'vyt-stats-v1';
const empty: Stats = { wins: 0, bestAttempts: null, bestTime: null };

export function readStats(): Stats {
    try {
        const data = JSON.parse(localStorage.getItem(key) || 'null');
        if (!data || !Number.isInteger(data.wins) || data.wins < 0) return { ...empty };
        return {
            wins: data.wins,
            bestAttempts: Number.isInteger(data.bestAttempts) && data.bestAttempts > 0 ? data.bestAttempts : null,
            bestTime: Number.isInteger(data.bestTime) && data.bestTime >= 0 ? data.bestTime : null,
        };
    } catch {
        return { ...empty };
    }
}

export function recordWin(attempts: number, seconds: number) {
    const previous = readStats();
    const stats: Stats = {
        wins: previous.wins + 1,
        bestAttempts: Math.min(previous.bestAttempts ?? Infinity, attempts),
        bestTime: Math.min(previous.bestTime ?? Infinity, seconds),
    };
    try {
        localStorage.setItem(key, JSON.stringify(stats));
    } catch {
        // The game remains playable when browser storage is unavailable.
    }
    return previous.bestAttempts === null || attempts < previous.bestAttempts;
}
