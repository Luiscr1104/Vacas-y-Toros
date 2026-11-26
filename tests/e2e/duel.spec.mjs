import { test, expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';

const baseURL = 'http://127.0.0.1:4322';

test('two people can play, recover, retry a lost response and agree on a rematch', async ({ browser }, testInfo) => {
    const host = await browser.newContext({ baseURL, viewport: { width: 1280, height: 960 } });
    const guest = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 } });
    const outsider = await browser.newContext({ baseURL });
    const errors = [];
    const contexts = [host, guest, outsider];
    try {
        for (const context of contexts) await context.addInitScript(() => localStorage.setItem('vyt-muted', 'true'));
        const a = await host.newPage();
        const b = await guest.newPage();
        for (const page of [a, b]) page.on('pageerror', error => errors.push(error.message));
        await a.goto('/');
        await a.getByRole('button', { name: /Las buenas rivalidades/i }).click();
        await a.getByLabel('¿Cómo te llamamos?').fill('Vaca');
        await a.getByRole('button', { name: 'Crear sala e invitar' }).click();
        await expect(a.getByRole('heading', { name: 'Falta tu contrincante.' })).toBeVisible();
        const code = (await a.locator('.invite-code').textContent()).trim();
        expect(code).toMatch(/^[A-HJ-NP-Z2-9]{8}$/);
        const session = (await host.cookies()).find(cookie => cookie.name === 'vyt_duel_session');
        expect(session.httpOnly).toBe(true);
        expect(session.sameSite).toBe('Lax');
        await a.screenshot({ path: testInfo.outputPath('vs-invite-desktop.png'), fullPage: true });

        await b.goto(`/?room=${code}`);
        await b.getByLabel('¿Cómo te llamamos?').fill('Toro');
        await b.getByRole('button', { name: '¡Entrar al duelo!' }).click();
        await expect(b.getByRole('heading', { name: 'Elige tu código secreto.' })).toBeVisible();
        await expect(a.getByRole('heading', { name: 'Elige tu código secreto.' })).toBeVisible();
        const rejected = await outsider.request.post(`/api/rooms/${code}`, {
            headers: { Origin: baseURL }, data: { type: 'join', name: 'Tercero' },
        });
        expect(rejected.status()).toBe(409);

        await a.getByLabel('Tu código secreto de cuatro dígitos únicos').fill('0123');
        await a.getByRole('button', { name: '¡Este es mi secreto!' }).click();
        await expect(a.getByText('✓ CÓDIGO CONFIRMADO')).toBeVisible();
        await b.getByLabel('Tu código secreto de cuatro dígitos únicos').fill('4567');
        await b.getByRole('button', { name: '¡Este es mi secreto!' }).click();
        await expect(a.getByRole('heading', { name: '¿Qué estará tramando?' })).toBeVisible();
        await expect(b.getByRole('heading', { name: '¿Qué estará tramando?' })).toBeVisible();
        let state = await (await host.request.get(`/api/rooms/${code}`)).json();
        expect(state.revealedSecrets).toBeNull();
        expect(JSON.stringify(state)).not.toMatch(/0123|4567|credentialHash|fingerprint/);
        const hostStarted = state.turn === state.you;
        const first = hostStarted ? host : guest;
        const second = hostStarted ? guest : host;

        await a.reload();
        await expect(a.getByRole('heading', { name: '¿Qué estará tramando?' })).toBeVisible();
        expect((await (await host.request.get(`/api/rooms/${code}`)).json()).phase).toBe('playing');
        const outOfTurn = await second.request.post(`/api/rooms/${code}`, {
            headers: { Origin: baseURL }, data: { type: 'guess', value: '9876', actionId: randomUUID(), round: 1 },
        });
        expect(outOfTurn.status()).toBe(409);
        const win = { type: 'guess', value: hostStarted ? '4567' : '0123', actionId: randomUUID(), round: 1 };
        const wins = await Promise.all([1, 2].map(() => first.request.post(`/api/rooms/${code}`, { headers: { Origin: baseURL }, data: win })));
        expect(wins.map(response => response.status())).toEqual([200, 200]);
        await expect(a.getByRole('heading', { name: /Te llevaste|Esta vez ganó/ })).toBeVisible();
        await expect(b.getByRole('heading', { name: /Te llevaste|Esta vez ganó/ })).toBeVisible();
        state = await (await host.request.get(`/api/rooms/${code}`)).json();
        expect(state.players.reduce((sum, player) => sum + player.guesses.length, 0)).toBe(1);
        let records = await (await host.request.get('/api/scores?mode=vs')).json();
        expect(records.filter(result => result._id === `${code}:1`)).toHaveLength(1);
        expect(records[0].verified).toBe(true);
        await a.screenshot({ path: testInfo.outputPath('vs-result-desktop.png'), fullPage: true });

        await a.getByRole('button', { name: /Quiero revancha/ }).click();
        await expect(b.getByRole('button', { name: /Aceptar revancha/ })).toBeVisible();
        await b.getByRole('button', { name: /Aceptar revancha/ }).click();
        await expect(a.getByRole('heading', { name: 'Elige tu código secreto.' })).toBeVisible();
        await expect(b.getByRole('heading', { name: 'Elige tu código secreto.' })).toBeVisible();
        await a.getByLabel('Tu código secreto de cuatro dígitos únicos').fill('1289');
        await a.getByRole('button', { name: '¡Este es mi secreto!' }).click();
        await b.getByLabel('Tu código secreto de cuatro dígitos únicos').fill('3456');
        await b.getByRole('button', { name: '¡Este es mi secreto!' }).click();
        await expect(a.getByRole('heading', { name: '¿Qué estará tramando?' })).toBeVisible();
        state = await (await host.request.get(`/api/rooms/${code}`)).json();
        expect(state.round).toBe(2);
        expect(state.turn === state.you).toBe(!hostStarted);
        const activePage = hostStarted ? b : a;
        let responseLost = false;
        await activePage.route('**/api/rooms/*', async route => {
            if (!responseLost && route.request().method() === 'POST' && route.request().postDataJSON()?.type === 'guess') {
                responseLost = true;
                await route.fetch(); // Commit on the server, then simulate the response being lost.
                await expect(activePage.locator('.latest-clue')).toContainText('6789'); // Poll acknowledges before the POST fails.
                await route.abort('failed');
            } else await route.continue();
        });
        await expect(activePage.getByLabel('Tu intento contra el rival')).toBeEnabled();
        await activePage.getByLabel('Tu intento contra el rival').fill('1111');
        await activePage.getByRole('button', { name: 'Lanzar mi intento' }).click();
        await expect(activePage.getByText('Cada dígito debe ser diferente.')).toBeVisible();
        await activePage.locator('.number-keypad').getByRole('button', { name: 'Borrar', exact: true }).click();
        for (const digit of ['6', '7', '8', '9']) {
            await activePage.locator('.number-keypad').getByRole('button', { name: digit, exact: true }).click();
        }
        await activePage.getByRole('button', { name: 'Lanzar mi intento' }).click();
        await expect(activePage.locator('.latest-clue')).toContainText('6789');
        await expect(activePage.getByLabel('Tu intento contra el rival')).toBeDisabled();
        expect(responseLost).toBe(true);
        state = await (await host.request.get(`/api/rooms/${code}`)).json();
        expect(state.players.reduce((sum, player) => sum + player.guesses.length, 0)).toBe(1);
        expect(state.phase).toBe('playing');
        const otherContext = activePage === a ? guest : host;
        const nextMove = await otherContext.request.post(`/api/rooms/${code}`, {
            headers: { Origin: baseURL }, data: { type: 'guess', value: '9870', actionId: randomUUID(), round: 2 },
        });
        expect(nextMove.status()).toBe(200);
        await expect(activePage.getByLabel('Tu intento contra el rival')).toBeEnabled();
        await activePage.getByLabel('Tu intento contra el rival').fill('6789');
        await activePage.getByRole('button', { name: 'Lanzar mi intento' }).click();
        await expect(activePage.getByText('Ya probaste ese número. ¡Prueba una nueva idea!')).toBeVisible();

        await b.screenshot({ path: testInfo.outputPath('vs-playing-mobile.png'), fullPage: true });
        for (const width of [320, 390, 768, 1280]) {
            await b.setViewportSize({ width, height: 844 });
            expect(await b.evaluate(() => document.documentElement.scrollWidth > innerWidth), `VS overflow at ${width}px`).toBe(false);
        }
        await guest.setOffline(true);
        await expect(b.getByText('Reconectando…', { exact: true })).toBeVisible();
        await guest.setOffline(false);
        await expect(b.getByText('Sala sincronizada', { exact: true })).toBeVisible();
        a.once('dialog', dialog => dialog.accept());
        await a.getByRole('button', { name: 'Salir del duelo' }).click();
        await expect(a.getByRole('button', { name: '¡Vamos a jugar!' })).toBeVisible();
        await expect(b.getByText('DUELO TERMINADO POR ABANDONO')).toBeVisible();
        records = await (await guest.request.get('/api/scores?mode=vs')).json();
        expect(records.filter(result => result._id.startsWith(`${code}:`))).toHaveLength(1);
        const forged = await guest.request.post('/api/scores', {
            headers: { Origin: baseURL }, data: { name: 'Fake', attempts: 1, time: 0, mode: 'vs' },
        });
        expect(forged.status()).toBe(400);
        expect(errors).toEqual([]);
    } finally {
        await Promise.all(contexts.map(context => context.close()));
    }
});

test('the individual game and its explicitly unverified ranking still work', async ({ page }) => {
    await page.addInitScript(() => {
        Math.random = () => 0;
        localStorage.setItem('vyt-muted', 'true');
    });
    await page.goto('/');
    await page.getByRole('button', { name: '¡Vamos a jugar!' }).click();
    await page.getByRole('button', { name: 'Probar 1478' }).click();
    await page.getByRole('button', { name: '¡Entendido, a jugar!' }).click();
    await page.getByLabel('Tu intento de cuatro dígitos únicos').fill('0123');
    await page.getByRole('button', { name: 'Probar mi suerte' }).click();
    await expect(page.getByRole('heading', { name: '¡Caso resuelto!' })).toBeVisible();
    await page.getByText('¿Guardar también en el ranking global?').click();
    await page.getByLabel('Tu apodo').fill('SoloDetective');
    await page.getByRole('button', { name: 'Guardar', exact: true }).click();
    await expect(page.getByText('¡Listo! Tu resultado está guardado.')).toBeVisible();
    await page.getByRole('button', { name: 'Volver al rancho' }).click();
    await page.getByRole('button', { name: 'Ver salón de la fama' }).click();
    await expect(page.getByText('SoloDetective', { exact: true })).toBeVisible();
    await expect(page.getByText('Récords individuales declarados por los jugadores; no verificados.')).toBeVisible();
    await page.getByRole('button', { name: 'Duelos verificados' }).click();
    await expect(page.getByText('SoloDetective', { exact: true })).toHaveCount(0);
    await expect(page.getByText('Los últimos duelos resueltos y verificados por el servidor.', { exact: false })).toBeVisible();
});

test('a room storage failure leaves the lobby usable and does not block solo play', async ({ page }) => {
    await page.route('**/api/rooms', route => route.fulfill({
        status: 503, contentType: 'application/json',
        body: JSON.stringify({ error: 'No pudimos conectar con las salas. Revisa MongoDB o inténtalo de nuevo en un momento.' }),
    }));
    await page.goto('/');
    await page.getByRole('button', { name: /Las buenas rivalidades/i }).click();
    await page.getByLabel('¿Cómo te llamamos?').fill('Detective');
    await page.getByRole('button', { name: 'Crear sala e invitar' }).click();
    await expect(page.getByRole('alert')).toContainText('Revisa MongoDB');
    await expect(page.getByRole('button', { name: 'Crear sala e invitar' })).toBeEnabled();
    await page.getByRole('button', { name: 'Volver al rancho' }).click();
    await expect(page.getByRole('button', { name: '¡Vamos a jugar!' })).toBeVisible();
});
