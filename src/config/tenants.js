// Tenant presentation metadata. No secrets — credential validation + real data isolation
// are server-side (Laravel JWT + company_id scoping). The client only derives branding.
//
// v1.24d/Laravel has REAL companies, so branding is data-driven from the logged-in user's
// company (tenantFromUser). The named presets below remain for the public/demo build and as
// accent/empty-state defaults.

export const TENANTS = {
  zoetis: {
    id: 'zoetis', companyName: 'Zoetis', ticker: 'ZTS',
    sidebarSubtitle: 'demo for Zoetis', accentColor: '#FF671F',
    hasLiveData: false, emptyState: true,
  },
  spgi: {
    id: 'spgi', companyName: 'S&P Global', ticker: 'SPGI',
    sidebarSubtitle: 'demo for S&P Global', accentColor: '#E00000',
    hasLiveData: true, emptyState: false,
  },
  generic: {
    id: 'generic', companyName: 'CLI Demo', ticker: null,
    sidebarSubtitle: 'white-label demo', accentColor: '#E00000',
    hasLiveData: true, emptyState: false,
  },
};

export function getTenant(id) {
  return TENANTS[id] || TENANTS.generic;
}

// Build a presentation tenant from the Laravel user/company. Any real company gets the
// CLI red brand by default; data isolation is handled server-side, so this is purely
// cosmetic (name in the sidebar/header). emptyState=false → DataContext will try to load
// the company's real dataset bundle from Laravel.
export function tenantFromUser(user) {
  if (!user) return getTenant('generic');
  const name = (typeof user.company === 'string' && user.company)
    ? user.company
    : (user.company?.name || 'Your Company');
  return {
    id: String(user.companyId ?? 'tenant'),
    companyId: user.companyId ?? null,
    companyName: name,
    ticker: null,
    sidebarSubtitle: name,
    accentColor: '#E00000',
    hasLiveData: true,
    emptyState: false,
    isSuper: user.role === 'super',
  };
}
