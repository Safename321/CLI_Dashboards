// Audit REL-08 — the key that makes "press Assign again" safe.
import { describe, it, expect } from 'vitest';

const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { newIdempotencyKey } = await import('../../src/lib/liveData.js');

describe('newIdempotencyKey', () => {
  it('fits the server limit and the server-side company prefix', () => {
    const key = newIdempotencyKey();
    expect(key).toMatch(/^dash-[0-9a-f]{32}$/);
    // The API accepts up to 64; legacy gets "c<companyId>:" + key, also capped at 64.
    expect(key.length).toBeLessThanOrEqual(40);
  });

  it('is different every time', () => {
    const keys = new Set(Array.from({ length: 500 }, () => newIdempotencyKey()));
    expect(keys.size).toBe(500);
  });

  it('does not need crypto.randomUUID, which plain-HTTP pages (the droplet) lack', () => {
    const original = crypto.randomUUID;
    try {
      Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
      expect(newIdempotencyKey()).toMatch(/^dash-/);
    } finally {
      Object.defineProperty(crypto, 'randomUUID', { value: original, configurable: true });
    }
  });
});
