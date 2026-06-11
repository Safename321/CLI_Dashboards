// Auth routes (§3.1–§3.3). Credentials validated server-side; on success a
// signed JWT is returned with the resolved tenant. Generic error messages only.
import { Router } from 'express';
import { verifyCredentials, hasAccounts } from '../config/credentials.js';
import { signSession, verifySession } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimit.js';

const router = Router();

const AUTH_DISABLED = process.env.AUTH_DISABLED === 'true' || (!hasAccounts() && process.env.AUTH_DISABLED !== 'false');

// Client capability probe: is this a public-demo (auth-disabled) build?
router.get('/config', (req, res) => {
  res.json({ authDisabled: AUTH_DISABLED });
});

// POST /api/auth/login → { token, tenant, email }
router.post('/login', loginLimiter, async (req, res) => {
  if (AUTH_DISABLED) return res.status(400).json({ error: 'Auth is disabled for this deployment' });
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Incorrect email or password' });

  const { ok, tenant } = await verifyCredentials(email, password);
  if (!ok) {
    // Constant-ish delay to blunt brute force / timing (pairs with loginLimiter).
    await new Promise((r) => setTimeout(r, 600));
    return res.status(401).json({ error: 'Incorrect email or password' });
  }
  try {
    const token = signSession({ email: email.toLowerCase(), tenant });
    res.json({ token, tenant, email: email.toLowerCase() });
  } catch {
    res.status(500).json({ error: 'Server auth misconfigured' });
  }
});

// GET /api/auth/me → validates the bearer token, returns session identity.
router.get('/me', (req, res) => {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  const session = verifySession(token);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  res.json({ email: session.email, tenant: session.tenant });
});

export default router;
