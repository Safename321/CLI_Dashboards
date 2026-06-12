import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Dev server proxies /api/* to the local Express proxy server (cli-proxy-server)
// so login/chat/data calls work identically in dev and prod.
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
        target: process.env.PROXY_TARGET || 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: { outDir: 'dist', sourcemap: false },
});
