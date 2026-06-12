// WorkdayConnector client behavior: sends the session JWT, fails fast when
// signed out, forwards customer Workday creds only when configured, and passes
// the server's staged/csv labelling through untouched.
import { describe, it, expect, vi, afterEach } from 'vitest';
import { WorkdayConnector } from '../../src/connectors/HRISConnector.js';

const fakeClock = { now: () => 1750000000000, sleep: async () => {} };

function makeConnector(extra = {}) {
  return new WorkdayConnector({
    proxyBase: '/CLI_Dashboards',
    storage: null,
    clock: fakeClock,
    maxRetries: 0,
    ...extra,
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('WorkdayConnector', () => {
  it('calls /api/workday under the proxy base with the session JWT', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ source: 'staged' }) }));
    vi.stubGlobal('fetch', fetchSpy);
    const c = makeConnector({ getAuthToken: () => 'jwt-123' });
    const result = await c.fetch();
    expect(result.ok).toBe(true);
    expect(result.payload.source).toBe('staged'); // server labelling passes through
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('/CLI_Dashboards/api/workday');
    expect(opts.headers.Authorization).toBe('Bearer jwt-123');
    expect(opts.headers['x-customer-token']).toBeUndefined();
  });

  it('fails fast without a session token (no network call, no retries)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    const c = makeConnector(); // no getAuthToken/authToken
    const result = await c.fetch();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/requires a signed-in session/);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('forwards customer Workday creds when configured (Phase-2 gate)', async () => {
    const fetchSpy = vi.fn(async () => ({ ok: true, status: 200, json: async () => ({ source: 'staged' }) }));
    vi.stubGlobal('fetch', fetchSpy);
    const c = makeConnector({
      getAuthToken: () => 'jwt-123',
      tenantUrl: 'https://wd5.example.com',
      accessToken: 'customer-oauth',
    });
    expect(c.hasCustomerCreds()).toBe(true);
    await c.fetch();
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(url).toBe('/CLI_Dashboards/api/workday?tenant=https%3A%2F%2Fwd5.example.com');
    expect(opts.headers['x-customer-token']).toBe('customer-oauth');
  });

  it('surfaces a 401 as a session problem', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: false, status: 401, json: async () => ({}) })));
    const result = await makeConnector({ getAuthToken: () => 'expired' }).fetch();
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/unauthorized/i);
  });
});
