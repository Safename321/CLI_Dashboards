// Server-side credential store (§3.2, §3.3). Demo accounts come from the
// CLI_ACCOUNTS env var as `email:bcryptHash` pairs — never from client code,
// changeable without rebuilding the bundle. Tenant is resolved from the email
// domain server-side.
import bcrypt from 'bcryptjs';

// Parse "email:hash,email:hash" into a Map. bcrypt hashes contain no commas;
// emails contain no colons, so splitting on the first ':' is safe.
function parseAccounts(raw) {
  const map = new Map();
  if (!raw) return map;
  for (const pair of raw.split(',')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const idx = trimmed.indexOf(':');
    if (idx < 0) continue;
    const email = trimmed.slice(0, idx).toLowerCase();
    const hash = trimmed.slice(idx + 1);
    if (email && hash) map.set(email, hash);
  }
  return map;
}

const ACCOUNTS = parseAccounts(process.env.CLI_ACCOUNTS);

// Domain → tenant id mapping (presentation metadata lives client-side).
const DOMAIN_TENANTS = [
  { match: '@zoetis.com', tenant: 'zoetis' },
  { match: '@snpglobal.com', tenant: 'spgi' },
];

export function resolveTenant(email) {
  const lower = (email || '').toLowerCase();
  for (const { match, tenant } of DOMAIN_TENANTS) {
    if (lower.includes(match)) return tenant;
  }
  return 'generic';
}

export function hasAccounts() {
  return ACCOUNTS.size > 0;
}

// Returns { ok, tenant } — never reveals whether the email or the password was
// the failing factor (§3.1). Always runs a bcrypt compare to limit timing leaks.
export async function verifyCredentials(email, password) {
  const lower = (email || '').toLowerCase();
  const hash = ACCOUNTS.get(lower);
  // Dummy hash so a missing account still costs a bcrypt compare (timing).
  const target = hash || '$2a$10$CwTycUXWue0Thq9StjUM0uJ8DiMzGElM7Wq3oQ8r9o4xVqGUVzW2';
  const ok = await bcrypt.compare(password || '', target);
  if (!hash || !ok) return { ok: false };
  return { ok: true, tenant: resolveTenant(lower) };
}
