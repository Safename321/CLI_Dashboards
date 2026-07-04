import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api/* to the Laravel backend so login/chat/data calls work
// in dev without CORS (set VITE_API_BASE=/api in .env.development so the app uses
// the relative path this proxy forwards). Override the target with PROXY_TARGET.
export default defineConfig({
  // Host at the origin root by default; set APP_BASE=/CLI_Dashboards/ to serve
  // the app under a subpath. Must begin and end with a slash.
  base: process.env.APP_BASE || '/',
  plugins: [react()],
  server: {
    host: true, // listen on 0.0.0.0 so the app is reachable from a public IP (tests §8 contexts c/d)
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.PROXY_TARGET || 'https://app.cardinalfund.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
