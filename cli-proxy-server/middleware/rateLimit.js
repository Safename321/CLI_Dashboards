// Rate limiting (§3.8). Per-IP limiter on /api/chat to cap credit burn, and a
// stricter limiter on /api/auth/login with exponential backoff after failures.
import rateLimit from 'express-rate-limit';

export const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 20, // 20 chat calls/min/IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded — slow down.' },
});

// Login: 10 attempts / 15 min / IP. Successful logins are not counted, so the
// limiter only bites brute-force. express-rate-limit's increasing 429 window
// plus the per-attempt 700ms server delay give the exponential-backoff behavior.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { error: 'Too many attempts — please wait and try again.' },
});
