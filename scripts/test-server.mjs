import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

// Tests never touch MONGODB_URI from .env or the host environment.
const mongo = await MongoMemoryServer.create();
const packageUrl = new URL('../node_modules/astro/package.json', import.meta.url);
const astro = JSON.parse(await readFile(packageUrl, 'utf8'));
const bin = typeof astro.bin === 'string' ? astro.bin : astro.bin.astro;
const child = spawn(process.execPath, [
    fileURLToPath(new URL(bin, packageUrl)), 'dev', '--host', '127.0.0.1', '--port', '4322', '--ignore-lock',
], {
    stdio: 'inherit',
    env: { ...process.env, MONGODB_URI: mongo.getUri(), MONGODB_DB: 'vyt_browser_test', ASTRO_TELEMETRY_DISABLED: '1', ASTRO_DEV_BACKGROUND: '0' },
});
let stopping = false;
async function stop(signal) {
    if (stopping) return;
    stopping = true;
    child.kill(signal);
    await mongo.stop();
}
process.on('SIGTERM', () => void stop('SIGTERM'));
process.on('SIGINT', () => void stop('SIGINT'));
child.on('exit', async code => {
    await stop('SIGTERM');
    process.exitCode = code ?? 0;
});
