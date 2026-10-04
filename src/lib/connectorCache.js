// Where connectors keep their last payload between page loads, and how it is cleared.
//
// Audit WEB-05: the cache is keyed per tenant but lives in localStorage, which outlives
// the session. Logging out cleared only the token, so the next person at a shared browser
// still had the previous tenant's connector payloads on disk. Kept in its own module
// because BaseConnector imports auth.js, and auth.js is what clears this on logout.

export const STORAGE_PREFIX = 'cli_connector_v2__';

// Domains whose payloads are about identifiable people or customer accounts. These are
// never written to disk at all; a reload simply refetches.
export const MEMORY_ONLY_DOMAINS = new Set(['hris', 'customer-health']);

export function clearConnectorCache(storage = typeof localStorage !== 'undefined' ? localStorage : null) {
  if (!storage) return 0;
  const doomed = [];
  try {
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) doomed.push(key);
    }
    doomed.forEach((key) => storage.removeItem(key));
  } catch { /* storage unavailable - nothing to clear */ }
  return doomed.length;
}
