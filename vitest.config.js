import { defineConfig } from 'vitest/config';

// Unit tests only — Playwright owns tests/e2e (run via `npm run test:e2e`).
export default defineConfig({
  // Use the automatic JSX runtime (matches the app's @vitejs/plugin-react) so
  // tests can render components (e.g. the SWOT report's embedded chart) without
  // a classic-runtime "React is not defined".
  esbuild: { jsx: 'automatic' },
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
  },
});
