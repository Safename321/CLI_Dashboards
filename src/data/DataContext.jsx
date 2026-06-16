// Loads the tenant dataset for the v2 dashboards. Data isolation is server-side:
//  - public/demo build (VITE_AUTH_DISABLED=true) → static S&P demo (data/spgi-data.json)
//  - empty-state tenant                          → no data (emptyState banners render)
//  - real authenticated tenant                   → Laravel /dashboard/dataset-bundle,
//                                                   scoped to the JWT (or impersonated company)
// Network/JSON is the source of truth; updates are immutable.
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { assetUrl } from '../lib/apiBase.js';
import { dashFetch, getEffectiveTenantKey } from '../lib/auth.js';

const DataContext = createContext(null);
const AUTH_DISABLED = import.meta.env.VITE_AUTH_DISABLED === 'true';

export function DataProvider({ tenant, children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const tenantKey = getEffectiveTenantKey();

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);

    const done = (d) => { if (!cancelled) { setData(d); setStatus('ready'); } };
    const fail = (e) => { if (!cancelled) { setError(e.message || String(e)); setStatus('error'); } };

    // Public demo build: bundled S&P dataset.
    if (AUTH_DISABLED) {
      fetch(assetUrl('data/spgi-data.json'))
        .then((r) => { if (!r.ok) throw new Error(`demo data load failed: ${r.status}`); return r.json(); })
        .then(done).catch(fail);
      return () => { cancelled = true; };
    }

    // Empty-state tenants intentionally have no dataset.
    if (tenant?.emptyState) { done(null); return () => { cancelled = true; }; }

    // Real tenant: assembled bundle from Laravel, scoped server-side by the JWT.
    dashFetch('/dashboard/dataset-bundle')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        const bundle = json?.data ?? json ?? null;
        const empty = !bundle || Object.keys(bundle).length === 0;
        done(empty ? null : bundle);   // null → dashboards show their emptyState
      })
      .catch(fail);

    return () => { cancelled = true; };
  }, [tenantKey, tenant?.emptyState]);

  const value = useMemo(() => ({ data, status, error, tenant }), [data, status, error, tenant]);
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

// Convenience: financials for a given year (falls back to latest available).
export function useYearData(year) {
  const { data } = useData();
  return useMemo(() => {
    const fin = data?.financials || {};
    const years = Object.keys(fin).sort();
    const key = year && fin[year] ? year : years[years.length - 1];
    return key ? { year: key, ...fin[key] } : null;
  }, [data, year]);
}
