// Auth state for the v2 client, wired to the Laravel backend via lib/auth.js.
// Credential validation is server-side (POST /api/auth/login → signed JWT + user).
// Token + user live in sessionStorage (restored on reload); real multi-tenancy is
// enforced server-side by the JWT, so the client only derives presentation branding.
//
// Public/demo build: set VITE_AUTH_DISABLED=true to skip login and show the S&P demo
// (the honest fallback when there is no backend — never a decorative gate).
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getTenant, tenantFromUser } from '../config/tenants.js';
import {
  login as apiLogin, logout as apiLogout, getUser, getToken,
  setImpersonation, getImpersonation,
} from '../lib/auth.js';

const AuthContext = createContext(null);
const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [status, setStatus] = useState('checking'); // checking | anon | authed
  const [impersonation, setImpersonationState] = useState(getImpersonation());

  // Restore session from storage on mount (no /auth/me round-trip — token is re-validated
  // lazily by dashFetch's 401→refresh on the first real call).
  useEffect(() => {
    if (AUTH_DISABLED) {
      setTenant(getTenant('spgi'));
      setStatus('authed');
      return;
    }
    const u = getUser();
    if (u && getToken()) {
      setUser(u);
      setTenant(tenantFromUser(u));
      setStatus('authed');
    } else {
      setStatus('anon');
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await apiLogin(email, password);
    setUser(u);
    setTenant(tenantFromUser(u));
    setStatus('authed');
    return u;
  }, []);

  const logout = useCallback(() => {
    apiLogout();
    setUser(null);
    setTenant(null);
    setImpersonationState(null);
    setStatus('anon');
  }, []);

  // SuperAdmin: view a specific company's data (sets X-Impersonate-Company on every dashFetch).
  const impersonateCompany = useCallback((companyId, companyName = null) => {
    setImpersonation(companyId);
    setImpersonationState(companyId);
    setTenant(companyId
      ? tenantFromUser({ company: companyName, companyId })
      : (user ? tenantFromUser(user) : null));
  }, [user]);

  const value = {
    user,
    token: getToken(),
    email: user?.email ?? null,
    role: user?.role ?? (AUTH_DISABLED ? 'demo' : null),
    tenant,
    status,
    authDisabled: AUTH_DISABLED,
    impersonation,
    login,
    logout,
    impersonateCompany,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
