// Audit WEB-05 — tenant data must not outlive the session that fetched it.
// Connector payloads were kept in localStorage per tenant and logout cleared only the
// token, so the next person at a shared browser inherited the previous tenant's data.
import { describe, it, expect, beforeEach, vi } from 'vitest';

function storage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key: (i) => [...map.keys()][i] ?? null,
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

globalThis.sessionStorage = storage();
globalThis.localStorage = storage();

const { logout, setImpersonation } = await import('../../src/lib/auth.js');
const { clearConnectorCache, STORAGE_PREFIX } = await import('../../src/lib/connectorCache.js');
const { BaseConnector } = await import('../../src/connectors/BaseConnector.js');

class Hris extends BaseConnector { static domain = 'hris'; }
class News extends BaseConnector { static domain = 'news'; }

describe('tenant state is cleared when the viewer changes', () => {
  beforeEach(() => {
    localStorage._map.clear();
    globalThis.fetch = vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) }));
  });

  it('logout removes every cached connector payload and nothing else', () => {
    localStorage.setItem(`${STORAGE_PREFIX}news__3`, '{}');
    localStorage.setItem(`${STORAGE_PREFIX}markets__5`, '{}');
    localStorage.setItem('cli_sidebar_collapsed', '[]');   // a UI preference, not tenant data

    logout();

    expect([...localStorage._map.keys()]).toEqual(['cli_sidebar_collapsed']);
  });

  it('switching the impersonated company clears it, re-selecting the same one does not', () => {
    setImpersonation(3);
    localStorage.setItem(`${STORAGE_PREFIX}news__3`, '{}');

    setImpersonation(3);
    expect(localStorage._map.size).toBe(1);

    setImpersonation(5);
    expect(localStorage._map.size).toBe(0);
  });

  it('people and customer data are never written to disk', () => {
    expect(new Hris({ tenantId: '3' }).storage).toBeNull();
    expect(new Hris({ tenantId: '3', storage: localStorage }).storage).toBeNull();
    expect(new News({ tenantId: '3' }).storage).toBe(localStorage);
  });

  it('clearing with no storage available is harmless', () => {
    expect(clearConnectorCache(null)).toBe(0);
  });
});
