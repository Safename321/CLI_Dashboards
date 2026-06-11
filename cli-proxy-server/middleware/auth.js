// JWT helpers + route guard (§3.2, §3.6). Sessions are signed with JWT_SECRET.
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || '';
const TTL = process.env.JWT_TTL || '12h';

export function signSession({ email, tenant }) {
  if (!SECRET) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ email, tenant }, SECRET, { expiresIn: TTL });
}

export function verifySession(token) {
  if (!SECRET || !token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function bearer(req) {
  const h = req.headers.authorization || '';
  return h.startsWith('Bearer ') ? h.slice(7) : null;
}

// Express guard — fails closed with 401 when the session is missing/invalid.
export function requireAuth(req, res, next) {
  const session = verifySession(bearer(req));
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  req.session = session;
  next();
}
