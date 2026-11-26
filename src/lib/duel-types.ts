import type { Guess } from './game';

export type DuelPhase = 'waiting' | 'setup' | 'playing' | 'finished' | 'closed';
export type DuelActionType = 'ready' | 'guess' | 'rematch' | 'leave' | 'claim_abandon';

export interface DuelCommand {
    type: DuelActionType;
    actionId: string;
    round: number;
    value?: string;
}

export interface DuelPlayer {
    id: string;
    name: string;
    ready: boolean;
    guesses: Guess[];
    wins: number;
    left: boolean;
    lastSeenAt: number;
}

/** The only room representation allowed to cross the server/client boundary. */
export interface DuelView {
    code: string;
    revision: number;
    round: number;
    phase: DuelPhase;
    you: string;
    turn: string | null;
    players: DuelPlayer[];
    winner: string | null;
    reason: 'guessed' | 'forfeit' | null;
    rematch: string[];
    revealedSecrets: Record<string, string> | null;
    acknowledgedActions: string[];
    startedAt: number | null;
    endedAt: number | null;
    expiresAt: number;
    serverNow: number;
}
