import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateGuess, generateSecret, validateGuess, formatTime } from '../src/lib/game.ts';

test('validates four unique ASCII digits, including a leading zero', () => {
    for (const value of ['0123', '9876', '1029']) assert.equal(validateGuess(value), null);
    for (const value of ['', '123', '12345', '1123', '12a4', '-123', '１２３４']) assert.ok(validateGuess(value));
});

test('counts bulls and cows without revealing digit positions', () => {
    assert.deepEqual(evaluateGuess('1478', '1234'), { bulls: 1, cows: 1 });
    assert.deepEqual(evaluateGuess('1234', '1234'), { bulls: 4, cows: 0 });
    assert.deepEqual(evaluateGuess('4321', '1234'), { bulls: 0, cows: 4 });
    assert.deepEqual(evaluateGuess('5678', '1234'), { bulls: 0, cows: 0 });
    assert.deepEqual(evaluateGuess('0123', '0321'), { bulls: 2, cows: 2 });
    assert.throws(() => evaluateGuess('1111', '1234'));
});

test('generated secrets always contain four unique digits', () => {
    for (let i = 0; i < 1000; i++) assert.equal(validateGuess(generateSecret()), null);
});

test('timer formats minutes and zero-padded seconds', () => {
    assert.equal(formatTime(0), '0:00');
    assert.equal(formatTime(61), '1:01');
    assert.equal(formatTime(600), '10:00');
});
