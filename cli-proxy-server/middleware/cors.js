// CORS allow-list (§3.7). Reflects only origins on CORS_ALLOWED_ORIGINS — no
// wildcard on auth/chat. Requests with no Origin (same-origin, curl) pass.
import cors from 'cors';

const allowed = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const corsMiddleware = cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // same-origin / non-browser
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

export const ALLOWED_ORIGINS = allowed;
