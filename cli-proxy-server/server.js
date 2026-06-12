// CLI Dashboards proxy server. Wires auth, chat, and read-only data routes
// behind CORS allow-listing (§3.7) and rate limiting (§3.8). For local dev and
// any Node host; the same route handlers deploy as Vercel functions.
import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { corsMiddleware, ALLOWED_ORIGINS } from './middleware/cors.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import dataRoutes from './routes/data.js';
import workdayRoutes from './routes/workday.js';
import importRoutes from './routes/import.js';

// Single-source the version from package.json (version + buildLetter), so the
// health endpoint matches the in-app label (e.g. 2.0.0a) without a second edit.
const pkg = JSON.parse(
  fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'package.json'), 'utf8'),
);
const APP_VERSION = `${pkg.version}${pkg.buildLetter || ''}`;

const app = express();
app.set('trust proxy', 1); // correct client IPs behind a proxy for rate limiting
app.use(express.json({ limit: '1mb' }));
app.use(corsMiddleware);

// Mount everything under an optional base path so the app can be hosted at the
// origin root (APP_BASE unset) or under a subpath, e.g. APP_BASE=/CLI_Dashboards/
// — must match the client's Vite `base`. BASE_PATH is normalized to no trailing
// slash ('' at root, '/CLI_Dashboards' under a subpath).
const BASE_PATH = (process.env.APP_BASE || '/').replace(/\/+$/, '');
const api = express.Router();
api.get('/api/health', (req, res) => res.json({ ok: true, version: APP_VERSION }));
api.use('/api/auth', authRoutes);
api.use('/api/chat', chatRoutes);
api.use('/api/workday', workdayRoutes);
api.use('/api/import', importRoutes);  // Multi-HRIS import (Track A) // JWT-gated HRIS bridge (WorkDay/ docs)
api.use('/api', dataRoutes);

// Serve the built client when dist/ exists, so one origin hosts app + API in
// every §8 serving context (localhost or public IP, HTTP or HTTPS). Same-origin
// /api calls need no CORS entry; the allow-list governs cross-origin callers.
const distDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
if (fs.existsSync(distDir)) {
  api.use(express.static(distDir));
  // SPA fallback for any non-API path under the base.
  api.get(/^(?!\/api\/).*/, (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

app.use(BASE_PATH || '/', api);
// When hosted under a subpath, bounce the bare origin to the app.
if (BASE_PATH) app.get('/', (req, res) => res.redirect(BASE_PATH + '/'));

// CORS rejections surface as a clean 403, not a stack trace.
app.use((err, req, res, next) => {
  if (err && /CORS/.test(err.message)) return res.status(403).json({ error: 'Origin not allowed' });
  console.error('[server] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`[cli-proxy] listening on :${PORT}`);
  console.log(`[cli-proxy] base path: ${BASE_PATH || '/'}`);
  console.log(`[cli-proxy] CORS allow-list: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`[cli-proxy] auth ${process.env.AUTH_DISABLED === 'true' ? 'DISABLED (public demo)' : 'enabled'}`);
});

export default app;
