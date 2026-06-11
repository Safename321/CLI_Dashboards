// Connector registry & orchestrator. One tenant = one registry instance.
// Parallel fan-out (runAll), domain lookup with real-over-mock preference,
// and the PR-crisis derivation used by the External/Sentiment dashboards.

export class ConnectorRegistry {
  constructor() {
    this.connectors = new Map(); // key: `${domain}:${id}`
  }

  register(connector, id = null) {
    const key = `${connector.constructor.domain}:${id || connector.constructor.label}`;
    this.connectors.set(key, connector);
    return key;
  }

  unregister(key) {
    return this.connectors.delete(key);
  }

  get(key) {
    return this.connectors.get(key);
  }

  list() {
    return Array.from(this.connectors.entries()).map(([key, c]) => ({ key, ...c.status() }));
  }

  byDomain() {
    const out = {};
    for (const [key, c] of this.connectors.entries()) {
      const d = c.constructor.domain;
      (out[d] ||= []).push({ key, connector: c });
    }
    return out;
  }

  // Most recent successful payload for a domain, preferring real over mock.
  getLatestForDomain(domain) {
    let chosen = null;
    for (const c of this.connectors.values()) {
      if (c.constructor.domain !== domain || !c.lastPayload) continue;
      if (!chosen || (chosen.constructor.isMock && !c.constructor.isMock)) chosen = c;
    }
    return chosen ? chosen.lastPayload : null;
  }

  // PR-crisis signal derived from the news connector.
  derivePrCrisis() {
    const news = this.getLatestForDomain('news');
    if (!news) return { active: false, source: null, reason: 'no news connector' };
    return {
      active: !!news.crisisActive,
      source: news.source || 'unknown',
      sentimentScore: news.sentimentScore ?? null,
      recentNegativeCount: news.recentNegativeCount ?? 0,
      reason: news.crisisActive
        ? `${news.recentNegativeCount} negative articles in last 24h`
        : 'no crisis signal detected',
    };
  }

  // Run every enabled connector in parallel; aggregate results + errors.
  async runAll({ onProgress } = {}) {
    const entries = Array.from(this.connectors.entries());
    const startedAt = new Date().toISOString();
    if (entries.length === 0) return { ok: true, results: {}, errors: [], startedAt };

    let completed = 0;
    onProgress?.({ phase: 'start', total: entries.length, completed });

    const settled = await Promise.allSettled(
      entries.map(async ([key, c]) => {
        const result = await c.fetch();
        completed++;
        onProgress?.({ phase: 'progress', total: entries.length, completed, key });
        return { key, result };
      })
    );

    const results = {};
    const errors = [];
    for (const s of settled) {
      if (s.status === 'fulfilled') {
        const { key, result } = s.value;
        results[key] = result;
        if (!result.ok && !result.skipped) errors.push({ key, error: result.error });
      } else {
        errors.push({ key: 'unknown', error: s.reason?.message || String(s.reason) });
      }
    }
    onProgress?.({ phase: 'done', total: entries.length, completed });
    return { ok: errors.length === 0, results, errors, startedAt, finishedAt: new Date().toISOString() };
  }
}
