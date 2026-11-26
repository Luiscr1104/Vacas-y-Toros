import test from 'node:test';
import assert from 'node:assert/strict';
import { readStats, recordWin } from '../src/lib/stats.ts';

test('local records handle progress, corrupt data and unavailable storage', () => {
    const values = new Map();
    Object.defineProperty(globalThis, 'localStorage', {
        configurable: true,
        value: {
            getItem: key => values.get(key) ?? null,
            setItem: (key, value) => values.set(key, value),
        },
    });
    try {
        assert.deepEqual(readStats(), { wins: 0, bestAttempts: null, bestTime: null });
        assert.equal(recordWin(5, 90), true);
        assert.equal(recordWin(6, 60), false);
        assert.deepEqual(readStats(), { wins: 2, bestAttempts: 5, bestTime: 60 });
        assert.equal(recordWin(3, 120), true);
        assert.deepEqual(readStats(), { wins: 3, bestAttempts: 3, bestTime: 60 });
        values.set('vyt-stats-v1', '{invalid json');
        assert.deepEqual(readStats(), { wins: 0, bestAttempts: null, bestTime: null });
        values.set('vyt-stats-v1', '{"wins":-1}');
        assert.equal(readStats().wins, 0);
        Object.defineProperty(globalThis, 'localStorage', {
            configurable: true,
            get() { throw new Error('Storage blocked'); },
        });
        assert.doesNotThrow(() => recordWin(3, 40));
        assert.equal(readStats().wins, 0);
    } finally {
        delete globalThis.localStorage;
    }
});
