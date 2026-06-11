// Loads the tenant dataset into React state (§4.4 — network/JSON is source of
// truth, immutable updates, no module-global mutable app state).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const DataContext = createContext(null);

export function DataProvider({ tenant, children }) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    // Empty-state tenants (e.g. Zoetis) intentionally ship with no dataset.
    if (tenant?.emptyState) {
      setData(null);
      setStatus('ready');
      return;
    }
    fetch('/data/spgi-data.json')
      .then((r) => {
        if (!r.ok) throw new Error(`data load failed: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[DataContext] load error:', err);
        setError(err.message);
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [tenant?.id, tenant?.emptyState]);

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
