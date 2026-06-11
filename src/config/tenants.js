// Tenant metadata ONLY. No passwords, no hashes — credential validation and
// tenant routing-by-email happen server-side at /api/auth/login (§3.1–§3.3).
// The server returns the resolved tenant id in the session; the client looks
// up presentation metadata here.

export const TENANTS = {
  zoetis: {
    id: 'zoetis',
    companyName: 'Zoetis',
    ticker: 'ZTS',
    sidebarSubtitle: 'demo for Zoetis',
    accentColor: '#FF671F',
    hasLiveData: false,
    emptyState: true,
  },
  spgi: {
    id: 'spgi',
    companyName: 'S&P Global',
    ticker: 'SPGI',
    sidebarSubtitle: 'demo for S&P Global',
    accentColor: '#E00000',
    hasLiveData: true,
    emptyState: false,
  },
  generic: {
    id: 'generic',
    companyName: 'CLI Demo',
    ticker: null,
    sidebarSubtitle: 'white-label demo',
    accentColor: '#E00000',
    hasLiveData: true,
    emptyState: false,
  },
};

export function getTenant(id) {
  return TENANTS[id] || TENANTS.generic;
}
