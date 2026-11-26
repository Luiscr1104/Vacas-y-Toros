import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    workers: 1,
    timeout: 90000,
    expect: { timeout: 15000 },
    use: {
        baseURL: 'http://127.0.0.1:4322',
        headless: true,
        trace: 'retain-on-failure',
        launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
            ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {},
    },
    webServer: {
        command: 'node scripts/test-server.mjs',
        url: 'http://127.0.0.1:4322',
        timeout: 120000,
        reuseExistingServer: false,
    },
});
