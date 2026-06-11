// CLI Dashboards proxy server. Wires auth, chat, and read-only data routes
// behind CORS allow-listing (§3.7) and rate limiting (§3.8). For local dev and
// any Node host; the same route handlers deploy as Vercel functions.
import 'dotenv/config';
import express from 'express';
import { corsMiddleware, ALLOWED_ORIGINS } from './middleware/cors.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chat.js';
import dataRoutes from './routes/data.js';

const app = express();
app.set('trust proxy', 1); // correct client IPs behind a proxy for rate limiting
app.use(express.json({ limit: '1mb' }));
app.use(corsMiddleware);

app.get('/api/health', (req, res) => res.json({ ok: true, version: '2.0.0' }));
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api', dataRoutes);

// CORS rejections surface as a clean 403, not a stack trace.
app.use((err, req, res, next) => {
  if (err && /CORS/.test(err.message)) return res.status(403).json({ error: 'Origin not allowed' });
  console.error('[server] error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 8787;
app.listen(PORT, () => {
  console.log(`[cli-proxy] listening on :${PORT}`);
  console.log(`[cli-proxy] CORS allow-list: ${ALLOWED_ORIGINS.join(', ')}`);
  console.log(`[cli-proxy] auth ${process.env.AUTH_DISABLED === 'true' ? 'DISABLED (public demo)' : 'enabled'}`);
});

export default app;
