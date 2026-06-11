import { describe, it, expect } from 'vitest';
import { ConnectorRegistry } from '../../src/connectors/ConnectorRegistry.js';
import { BaseConnector } from '../../src/connectors/BaseConnector.js';

function makeConnector({ domain, label, isMock = false, payload = null, fail = false }) {
  class C extends BaseConnector {
    static domain = domain;
    static label = label;
    static isMock = isMock;
    async _fetch() {
      if (fail) throw new Error(`${label} exploded`);
      return payload;
    }
  }
  const c = new C({ storage: null, maxRetries: 0 });
  if (payload) c.lastPayload = payload; // pre-seed for lookup tests
  return c;
}

describe('ConnectorRegistry.runAll', () => {
  it('runs all connectors and aggregates results and errors', async () => {
    const reg = new ConnectorRegistry();
    reg.register(makeConnector({ domain: 'news', label: 'Good News', payload: { n: 1 } }), 'good');
    reg.register(makeConnector({ domain: 'macro', label: 'Bad Macro', fail: true }), 'bad');

    const out = await reg.runAll();
    expect(out.ok).toBe(false);
    expect(Object.keys(out.results)).toHaveLength(2);
    expect(out.errors).toHaveLength(1);
    expect(out.errors[0].error).toMatch(/Bad Macro exploded/);
  });

  it('reports progress callbacks across the fan-out', async () => {
    const reg = new ConnectorRegistry();
    reg.register(makeConnector({ domain: 'news', label: 'A', payload: {} }), 'a');
    reg.register(makeConnector({ domain: 'macro', label: 'B', payload: {} }), 'b');
    const phases = [];
    await reg.runAll({ onProgress: (p) => phases.push(p.phase) });
    expect(phases[0]).toBe('start');
    expect(phases.at(-1)).toBe('done');
    expect(phases.filter((p) => p === 'progress')).toHaveLength(2);
  });

  it('handles an empty registry', async () => {
    const out = await new ConnectorRegistry().runAll();
    expect(out.ok).toBe(true);
    expect(out.errors).toEqual([]);
  });
});

describe('ConnectorRegistry.getLatestForDomain', () => {
  it('prefers real connectors over mock ones', () => {
    const reg = new ConnectorRegistry();
    reg.register(makeConnector({ domain: 'news', label: 'Mock', isMock: true, payload: { src: 'mock' } }), 'm');
    reg.register(makeConnector({ domain: 'news', label: 'Real', isMock: false, payload: { src: 'real' } }), 'r');
    expect(reg.getLatestForDomain('news')).toEqual({ src: 'real' });
  });

  it('falls back to mock when no real payload exists', () => {
    const reg = new ConnectorRegistry();
    reg.register(makeConnector({ domain: 'news', label: 'Mock', isMock: true, payload: { src: 'mock' } }), 'm');
    expect(reg.getLatestForDomain('news')).toEqual({ src: 'mock' });
  });

  it('returns null for unknown domains', () => {
    expect(new ConnectorRegistry().getLatestForDomain('nope')).toBeNull();
  });
});

describe('ConnectorRegistry.derivePrCrisis', () => {
  it('reports inactive when there is no news connector', () => {
    const crisis = new ConnectorRegistry().derivePrCrisis();
    expect(crisis.active).toBe(false);
    expect(crisis.reason).toMatch(/no news connector/);
  });

  it('derives an active crisis from the news payload', () => {
    const reg = new ConnectorRegistry();
    reg.register(
      makeConnector({
        domain: 'news',
        label: 'News',
        payload: { crisisActive: true, source: 'gdelt', sentimentScore: -0.7, recentNegativeCount: 12 },
      }),
      'news'
    );
    const crisis = reg.derivePrCrisis();
    expect(crisis).toMatchObject({ active: true, source: 'gdelt', sentimentScore: -0.7, recentNegativeCount: 12 });
    expect(crisis.reason).toMatch(/12 negative articles/);
  });

  it('derives a calm signal when no crisis flag is set', () => {
    const reg = new ConnectorRegistry();
    reg.register(makeConnector({ domain: 'news', label: 'News', payload: { sentimentScore: 0.2 } }), 'news');
    const crisis = reg.derivePrCrisis();
    expect(crisis.active).toBe(false);
    expect(crisis.reason).toMatch(/no crisis signal/);
  });
});
