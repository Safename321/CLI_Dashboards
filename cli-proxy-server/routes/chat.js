// /api/chat — AI mentor proxy. FAILS CLOSED (§3.6): when CHAT_REQUIRE_AUTH is
// on (default), a valid session JWT is required or the request is 401'd before
// any Anthropic call. Rate limited per IP (§3.8). CORS is allow-listed app-wide.
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { forwardToAnthropic } from '../lib/anthropic.js';

const router = Router();
const REQUIRE_AUTH = process.env.CHAT_REQUIRE_AUTH !== 'false';

// Conditionally apply the auth guard: default closed.
const maybeAuth = (req, res, next) => (REQUIRE_AUTH ? requireAuth(req, res, next) : next());

router.post('/', chatLimiter, maybeAuth, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Server misconfigured: ANTHROPIC_API_KEY not set' });

  const { system, messages, model, max_tokens: maxTokens } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] required' });
  }

  const result = await forwardToAnthropic({ apiKey, model, system, messages, maxTokens });
  if (!result.ok) return res.status(result.status || 502).json({ error: result.error });
  res.json({ text: result.text, empty: !!result.empty });
});

export default router;
