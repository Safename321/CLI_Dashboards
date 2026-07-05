// auth.js — multi-tenant JWT auth + tenant-aware fetch, wiring the v2 dashboard to the
// Laravel backend (DashboardAuthController /api/auth/* + TenantScope). Ported from the
// deployed v1.24d dashboard (proven against the live droplet) and adapted for v2.
//
// Laravel /auth/login returns { token, user:{ id, email, role, companyId, company, ... } }.
// We keep token + user in sessionStorage and derive v2's tenant *branding* from user.company,
// so real multi-tenancy stays server-side (data is scoped by the JWT / impersonation header)
// while v2 keeps its presentation tenant object.

const API_BASE  = import.meta.env.VITE_API_BASE || 'https://app.cardinalfund.com/api';
const TOKEN_KEY = 'cli_jwt';
const USER_KEY  = 'cli_user';

let impersonateCompanyId = null;   // set by the SuperAdmin console

export function setImpersonation(id) { impersonateCompanyId = id || null; }
export function getImpersonation()   { return impersonateCompanyId; }

// The tenant whose data is in view: impersonated company for a super, else the user's own.
// Used to namespace the live-data cache so one tenant's data is never served to another.
export function getEffectiveTenantKey() {
  const u = getUser();
  return String(impersonateCompanyId ?? u?.companyId ?? 'anon');
}

export function getUser()  { try { return JSON.parse(sessionStorage.getItem(USER_KEY)); } catch { return null; } }
export function getToken() { return sessionStorage.getItem(TOKEN_KEY); }
export function isAuthed() { return !!getToken(); }

export function logout() {
  // Best-effort server revocation of the httpOnly cli_refresh cookie, so a
  // "logged out" session can't mint a fresh JWT via /auth/refresh. Fire-and-forget
  // — the UI shouldn't block on it, and local state is cleared regardless.
  try {
    const token = getToken();
    fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).catch(() => {});
  } catch { /* ignore */ }
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  impersonateCompanyId = null;
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    // Never leak internal error strings.
    const msg = res.status === 429 ? 'Too many attempts — please wait and try again.'
              : (data.error || 'Incorrect email or password');
    throw new Error(msg);
  }
  sessionStorage.setItem(TOKEN_KEY, data.token);
  sessionStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

// Exchange the httpOnly cli_refresh cookie (set at login) for a fresh JWT. Single-flight.
let refreshInFlight = null;
async function tryRefresh() {
  refreshInFlight ??= (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, { method: 'POST', credentials: 'include' });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      if (!data.token) return false;
      sessionStorage.setItem(TOKEN_KEY, data.token);
      return true;
    } catch { return false; }
    finally { refreshInFlight = null; }
  })();
  return refreshInFlight;
}

// Every authenticated dashboard call goes through this: attaches the JWT and, for a
// SuperAdmin who is impersonating, X-Impersonate-Company. On a 401 it refreshes once
// and retries. JSON by default; pass a FormData body and we drop the JSON content-type.
export async function dashFetch(path, options = {}) {
  const isForm = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const doFetch = () => {
    const headers = {
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${getToken()}`,
      ...(options.headers || {}),
    };
    if (impersonateCompanyId) headers['X-Impersonate-Company'] = String(impersonateCompanyId);
    return fetch(`${API_BASE}${path}`, { ...options, credentials: 'include', headers });
  };
  let res = await doFetch();
  if (res.status === 401 && (await tryRefresh())) res = await doFetch();
  return res;
}

export { API_BASE };
