// CORS allow-list (§3.7). Cross-origin callers are reflected only when on
// CORS_ALLOWED_ORIGINS — no wildcard on auth/chat. Same-origin requests always
// pass: Vite's `<script type="module" crossorigin>` sends an Origin header even
// same-origin, and the app must work from ANY origin that serves it (§3.1 —
// localhost or public IP, HTTP or HTTPS) without a rebuild or config change.
// (Origin is browser-controlled, so origin-host === request-host is genuinely
// same-origin, never an attacker-supplied match.)
import cors from 'cors';

const allowed = (process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function isSameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true; // same-origin navigations / curl send no Origin
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

const crossOriginCors = cors({
  origin(origin, cb) {
    if (!origin || allowed.includes(origin)) return cb(null, true);
    return cb(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});

const sameOriginCors = cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'], credentials: true });

export const corsMiddleware = (req, res, next) =>
  isSameOrigin(req) ? sameOriginCors(req, res, next) : crossOriginCors(req, res, next);

export const ALLOWED_ORIGINS = allowed;
