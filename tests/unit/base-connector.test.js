import { describe, it, expect } from 'vitest';
import { BaseConnector } from '../../src/connectors/BaseConnector.js';

// Deterministic clock: now is settable, sleep records delays without waiting.
function fakeClock(start = 1_000_000) {
  const c = {
    t: start,
    sleeps: [],
    now: () => c.t,
    sleep: async (ms) => {
      c.sleeps.push(ms);
      c.t += ms;
    },
  };
  return c;
}

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    _map: map,
  };
}

class FlakyConnector extends BaseConnector {
  static domain = 'news';
  static label = 'Flaky';
  constructor(config, failures, payload = { value: 42 }) {
    super(config);
    this.failures = failures; // how many times _fetch throws before succeeding
    this.calls = 0;
    this.payload = payload;
  }
  async _fetch() {
    this.calls++;
    if (this.calls <= this.failures) throw new Error('network timeout');
    return this.payload;
  }
}

class FatalConnector extends BaseConnector {
  static domain = 'news';
  static label = 'Fatal';
  constructor(config) {
    super(config);
    this.calls = 0;
  }
  async _fetch() {
    this.calls++;
    throw new Error('apiKey missing in config');
  }
}

describe('BaseConnector retry with backoff', () => {
  it('retries transient errors with exponential backoff and succeeds', async () => {
    const clock = fakeClock();
    const c = new FlakyConnector({ clock, storage: null, retryBaseMs: 100 }, 2);
    const result = await c.fetch();
    expect(result.ok).toBe(true);
    expect(result.payload).toEqual({ value: 42 });
    expect(c.calls).toBe(3);
    expect(clock.sleeps).toEqual([100, 200]); // base * 2^attempt
  });

  it('gives up after maxRetries and reports the error', async () => {
    const clock = fakeClock();
    const c = new FlakyConnector({ clock, storage: null, maxRetries: 2, retryBaseMs: 50 }, 99);
    const result = await c.fetch();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/network timeout/);
    expect(c.calls).toBe(3); // initial + 2 retries
  });

  it('fails fast on fatal (config/auth) errors without retrying', async () => {
    const clock = fakeClock();
    const c = new FatalConnector({ clock, storage: null });
    const result = await c.fetch();
    expect(result.ok).toBe(false);
    expect(c.calls).toBe(1);
    expect(clock.sleeps).toEqual([]);
  });
});

describe('BaseConnector stale fallback', () => {
  it('returns last good payload as stalePayload when a later fetch fails', async () => {
    const clock = fakeClock();
    const c = new FlakyConnector({ clock, storage: null, maxRetries: 0 }, 0, { fresh: true });
    const first = await c.fetch();
    expect(first.ok).toBe(true);

    c.failures = 99; // every subsequent _fetch throws
    const second = await c.fetch();
    expect(second.ok).toBe(false);
    expect(second.stalePayload).toEqual({ fresh: true });
    expect(second.staleAt).toBe(first.fetchedAt);
  });

  it('reports staleness via the injected clock', async () => {
    const clock = fakeClock();
    const c = new FlakyConnector({ clock, storage: null, refreshMinutes: 1 }, 0);
    await c.fetch();
    expect(c.isStale()).toBe(false);
    clock.t += 2 * 60 * 1000;
    expect(c.isStale()).toBe(true);
  });
});

describe('BaseConnector cache persistence', () => {
  it('persists results and restores them in a new instance', async () => {
    const clock = fakeClock();
    const storage = memoryStorage();
    const c = new FlakyConnector({ clock, storage, tenantId: 'spgi' }, 0, { cached: 1 });
    await c.fetch();

    const revived = new FlakyConnector({ clock, storage, tenantId: 'spgi' }, 0);
    expect(revived.lastPayload).toEqual({ cached: 1 });
    expect(revived.lastError).toBeNull();
  });

  it('drops cache entries with a different schema version', async () => {
    const clock = fakeClock();
    const storage = memoryStorage();
    const c = new FlakyConnector({ clock, storage, tenantId: 'spgi' }, 0);
    await c.fetch();
    // Corrupt the schema version in place.
    const key = Array.from(storage._map.keys())[0];
    const saved = JSON.parse(storage.getItem(key));
    saved.schema = saved.schema - 1;
    storage.setItem(key, JSON.stringify(saved));

    const revived = new FlakyConnector({ clock, storage, tenantId: 'spgi' }, 0);
    expect(revived.lastPayload).toBeNull();
  });

  it('skips disabled connectors without fetching', async () => {
    const c = new FlakyConnector({ enabled: false, storage: null }, 0);
    const result = await c.fetch();
    expect(result.skipped).toBe(true);
    expect(c.calls).toBe(0);
  });
});
