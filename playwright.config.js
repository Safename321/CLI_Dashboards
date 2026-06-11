import { defineConfig } from '@playwright/test';

// E2E config: builds are served by the Express proxy server (dist + /api on one
// origin), mirroring production. `npm run build` must run before e2e.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:8787',
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'node cli-proxy-server/server.js',
    url: 'http://localhost:8787/api/health',
    reuseExistingServer: true,
    timeout: 15_000,
  },
});
