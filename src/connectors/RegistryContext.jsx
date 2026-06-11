// React context around the connector registry (§4.4): one registry instance
// per tenant, run results/errors held in React state (immutable updates),
// no module-global mutable state. Dashboards consume via useRegistry().
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { buildDefaultRegistry } from './buildRegistry.js';

const RegistryContext = createContext(null);

const EMPTY_RUN_STATE = { results: {}, errors: [], lastRun: null, running: false };

export function RegistryProvider({ tenant, children }) {
  // Build the registry once per tenant. The registry object itself owns the
  // connector instances; all run *outcomes* live in React state below.
  const registry = useMemo(() => buildDefaultRegistry(tenant || {}), [tenant]);

  const [runState, setRunState] = useState(EMPTY_RUN_STATE);
  const runningRef = useRef(false);

  // New tenant → new registry → clear previous tenant's run outcomes.
  useEffect(() => {
    runningRef.current = false;
    setRunState(EMPTY_RUN_STATE);
  }, [registry]);

  const runAll = useCallback(async () => {
    if (runningRef.current) return null; // ignore re-entrant clicks
    runningRef.current = true;
    setRunState((s) => ({ ...s, running: true }));
    try {
      const run = await registry.runAll();
      setRunState({
        results: { ...run.results },
        errors: [...run.errors],
        lastRun: run,
        running: false,
      });
      return run;
    } catch (err) {
      console.error('[RegistryContext] runAll failed:', err);
      setRunState((s) => ({
        ...s,
        errors: [...s.errors, { key: 'runAll', error: err.message || String(err) }],
        running: false,
      }));
      return null;
    } finally {
      runningRef.current = false;
    }
  }, [registry]);

  const value = useMemo(
    () => ({
      registry,
      results: runState.results,
      errors: runState.errors,
      lastRun: runState.lastRun,
      running: runState.running,
      runAll,
    }),
    [registry, runState, runAll]
  );

  return <RegistryContext.Provider value={value}>{children}</RegistryContext.Provider>;
}

export function useRegistry() {
  const ctx = useContext(RegistryContext);
  if (!ctx) throw new Error('useRegistry must be used within a RegistryProvider');
  return ctx;
}
