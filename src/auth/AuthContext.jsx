// Auth state for the client. ALL credential validation is server-side (§3.1):
// login POSTs to /api/auth/login and receives a signed JWT + resolved tenant.
// No Web Crypto, no client-side hashing, works in every serving context.
//
// The token is held in memory (primary) and mirrored to sessionStorage only as
// a non-secret bearer for reload restore, which is re-validated via /api/auth/me.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getTenant } from '../config/tenants.js';
import { apiUrl } from '../lib/apiBase.js';

const AuthContext = createContext(null);
const TOKEN_KEY = 'cli_session_token_v2';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [email, setEmail] = useState(null);
  const [authDisabled, setAuthDisabled] = useState(false);
  const [status, setStatus] = useState('checking'); // checking | anon | authed

  // Restore + capability probe on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Is auth disabled (public demo build)? Ask the server.
      try {
        const cfg = await fetch(apiUrl('/api/auth/config')).then((r) => (r.ok ? r.json() : null));
        if (!cancelled && cfg?.authDisabled) {
          setAuthDisabled(true);
          setTenant(getTenant('spgi'));
          setStatus('authed');
          return;
        }
      } catch {
        /* Server unreachable (e.g. GitHub Pages static host) — enter demo mode */
        if (!cancelled) {
          setAuthDisabled(true);
          setTenant(getTenant('spgi'));
          setStatus('authed');
          return;
        }
      }
      // Restore an existing session token.
      const saved = sessionStorage.getItem(TOKEN_KEY);
      if (!saved) {
        if (!cancelled) setStatus('anon');
        return;
      }
      try {
        const me = await fetch(apiUrl('/api/auth/me'), { headers: { Authorization: `Bearer ${saved}` } });
        if (me.ok) {
          const { email: e, tenant: t } = await me.json();
          if (!cancelled) {
            setToken(saved);
            setEmail(e);
            setTenant(getTenant(t));
            setStatus('authed');
          }
          return;
        }
      } catch {
        /* ignore */
      }
      sessionStorage.removeItem(TOKEN_KEY);
      if (!cancelled) setStatus('anon');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (emailInput, password) => {
    const res = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailInput, password }),
    });
    if (!res.ok) {
      // Never leak internal error strings (§3.1).
      const msg = res.status === 429 ? 'Too many attempts — please wait and try again.' : 'Incorrect email or password';
      throw new Error(msg);
    }
    const { token: t, tenant: tid, email: e } = await res.json();
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
    setEmail(e || emailInput);
    setTenant(getTenant(tid));
    setStatus('authed');
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setEmail(null);
    setTenant(null);
    setStatus('anon');
  }, []);

  const value = { token, tenant, email, status, authDisabled, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
