// Base connector — config, freshness, retry-with-backoff, stale fallback,
// schema-versioned localStorage cache, consistent result shape.
//
// Subclasses implement async _fetch() and define static domain/label.
// No silent failures (§4.5): every failed fetch records lastError and still
// returns the last-known payload as stalePayload so the UI can surface both.

import { API_PREFIX } from '../lib/apiBase.js';

const STORAGE_PREFIX = 'cli_connector_v2__';
const SCHEMA_VERSION = 2;

// Injectable now()/sleep keep retry + staleness deterministic in unit tests.
const realClock = {
  now: () => Date.now(),
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
};

export class BaseConnector {
  constructor(config = {}) {
    // Default the proxy base to the app's mount path so real connectors hit
    // '/<base>/api/...' when hosted under a subpath; subclasses read config.proxyBase.
    this.config = { proxyBase: API_PREFIX, ...config };
    this.tenantId = config.tenantId || 'default';
    this.enabled = config.enabled !== false;
    this.refreshMinutes = config.refreshMinutes || 60;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryBaseMs = config.retryBaseMs ?? 500;
    this.clock = config.clock || realClock;
    this.storage = config.storage ?? (typeof localStorage !== 'undefined' ? localStorage : null);

    this.lastFetchAt = null;
    this.lastSuccessAt = null;
    this.lastError = null;
    this.lastPayload = null;
    this._restore();
  }

  static domain = 'base';
  static label = 'Base Connector';
  static isMock = false;
  static requiresOAuth = false;

  _key() {
    return `${STORAGE_PREFIX}${this.constructor.domain}__${this.tenantId}`;
  }

  _restore() {
    if (!this.storage) return;
    try {
      const raw = this.storage.getItem(this._key());
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved.schema !== SCHEMA_VERSION) return; // drop incompatible cache
      this.lastFetchAt = saved.lastFetchAt ?? null;
      this.lastSuccessAt = saved.lastSuccessAt ?? null;
      this.lastError = saved.lastError ?? null;
      this.lastPayload = saved.lastPayload ?? null;
    } catch {
      /* corrupted cache — ignore */
    }
  }

  _save() {
    if (!this.storage) return;
    try {
      this.storage.setItem(
        this._key(),
        JSON.stringify({
          schema: SCHEMA_VERSION,
          lastFetchAt: this.lastFetchAt,
          lastSuccessAt: this.lastSuccessAt,
          lastError: this.lastError,
          lastPayload: this.lastPayload,
        })
      );
    } catch {
      /* quota/write failure — non-fatal */
    }
  }

  // Retry only transient (network) errors; auth/config errors fail fast.
  async _fetchWithRetry() {
    let lastErr;
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await this._fetch();
      } catch (err) {
        lastErr = err;
        const fatal = err.message && /requires|missing|in config|apiKey|unauthorized/i.test(err.message);
        if (fatal || attempt === this.maxRetries) break;
        await this.clock.sleep(this.retryBaseMs * 2 ** attempt);
      }
    }
    throw lastErr;
  }

  async fetch() {
    if (!this.enabled) return { ok: false, skipped: true, reason: 'disabled', domain: this.constructor.domain };
    const stamp = new Date(this.clock.now()).toISOString();
    try {
      const payload = await this._fetchWithRetry();
      this.lastFetchAt = stamp;
      this.lastSuccessAt = stamp;
      this.lastError = null;
      this.lastPayload = payload;
      this._save();
      return {
        ok: true,
        domain: this.constructor.domain,
        label: this.constructor.label,
        isMock: this.constructor.isMock,
        fetchedAt: stamp,
        payload,
      };
    } catch (err) {
      this.lastFetchAt = stamp;
      this.lastError = err.message || String(err);
      this._save();
      return {
        ok: false,
        domain: this.constructor.domain,
        label: this.constructor.label,
        error: this.lastError,
        fetchedAt: stamp,
        stalePayload: this.lastPayload, // stale-but-useful
        staleAt: this.lastSuccessAt,
      };
    }
  }

  async _fetch() {
    throw new Error('BaseConnector._fetch() must be implemented by subclass');
  }

  isStale() {
    if (!this.lastSuccessAt) return true;
    const ageMs = this.clock.now() - new Date(this.lastSuccessAt).getTime();
    return ageMs > this.refreshMinutes * 60 * 1000;
  }

  status() {
    return {
      domain: this.constructor.domain,
      label: this.constructor.label,
      enabled: this.enabled,
      isMock: this.constructor.isMock,
      requiresOAuth: this.constructor.requiresOAuth,
      lastFetchAt: this.lastFetchAt,
      lastSuccessAt: this.lastSuccessAt,
      lastError: this.lastError,
      isStale: this.isStale(),
      refreshMinutes: this.refreshMinutes,
    };
  }
}

// Recommended cache TTLs per domain (minutes).
export const CACHE_TTL_MINUTES = {
  financial: 24 * 60,
  macro: 24 * 60,
  news: 60,
  markets: 15,
  'social-sentiment': 60,
  'owned-social': 60,
  innovation: 7 * 24 * 60,
  culture: 24 * 60,
  hris: 60,
  'customer-health': 30,
  'cli-instrument': 24 * 60,
};
