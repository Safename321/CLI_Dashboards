import { defineConfig } from '@playwright/test';

// E2E config. Post-E2 the Express proxy is gone; the SPA is a static build with
// no client-side routing, so `vite preview` serves it directly. `npm run build`
// must run before e2e. Connectors call the authed Laravel /data proxy on
// app.cardinalfund.com, out of scope for these local UI e2e checks.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4173',
    ignoreHTTPSErrors: true,
  },
  webServer: {
    command: 'npm run preview -- --port 4173',
    url: 'http://localhost:4173/',
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
