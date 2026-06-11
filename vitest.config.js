import { defineConfig } from 'vitest/config';

// Unit tests only — Playwright owns tests/e2e (run via `npm run test:e2e`).
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.js'],
    environment: 'node',
  },
});
