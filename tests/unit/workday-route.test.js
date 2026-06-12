// /api/workday route tests: the auth gate FAILS CLOSED without a valid JWT,
// staged data is clearly labelled, and the Phase-1 CSV upload round-trips into
// the tenant-scoped store. Runs the real router on an ephemeral port.
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import express from 'express';

let server;
let base;
let signSession;
let resetStore;
let authHeader; // valid session for tenant 'spgi'

beforeAll(async () => {
  process.env.JWT_SECRET = 'workday-route-test-secret';
  // Dynamic imports so JWT_SECRET is set before middleware/auth.js loads it.
  const auth = await import('../../cli-proxy-server/middleware/auth.js');
  signSession = auth.signSession;
  resetStore = (await import('../../cli-proxy-server/lib/workdayStore.js')).__resetWorkdayStore;
  const { default: workdayRoutes } = await import('../../cli-proxy-server/routes/workday.js');

  const app = express();
  app.use(express.json());
  app.use('/api/workday', workdayRoutes);
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  base = `http://127.0.0.1:${server.address().port}`;
  authHeader = { Authorization: `Bearer ${signSession({ email: 't@example.com', tenant: 'spgi' })}` };
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

beforeEach(() => resetStore());

const CSV = [
  'workday_id,legal_name,email,status,hire_date,termination_date',
  'W1,Ada Lovelace,ada@x.com,active,2019-03-01,',
  'W2,Mary Shelley,mary@x.com,on_leave,2021-07-15,',
  'W3,Kurt Vonnegut,kurt@x.com,terminated,2020-01-01,2026-02-01',
].join('\n');

describe('auth gate (§3.6 — fails closed)', () => {
  it('401s every endpoint without a token', async () => {
    for (const [method, path, opts] of [
      ['GET', '/api/workday', {}],
      ['GET', '/api/workday/workers', {}],
      ['GET', '/api/workday/status', {}],
      ['POST', '/api/workday/workers/csv', { headers: { 'Content-Type': 'text/csv' }, body: CSV }],
    ]) {
      const res = await fetch(base + path, { method, ...opts });
      expect(res.status, `${method} ${path}`).toBe(401);
    }
  });

  it('401s with a garbage token', async () => {
    const res = await fetch(`${base}/api/workday`, { headers: { Authorization: 'Bearer not-a-jwt' } });
    expect(res.status).toBe(401);
  });
});

describe('staged mode (no upload, no Workday creds)', () => {
  it('GET /api/workday returns a summary clearly labelled staged', async () => {
    const res = await fetch(`${base}/api/workday`, { headers: authHeader });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe('staged');
    expect(body.note).toMatch(/STAGED DATA/);
    expect(body.meta.live).toBe(false);
    expect(body.headcount).toBeGreaterThan(0); // staged roster's active count
  });

  it('GET /workers serves the staged roster with unmistakably fake WIDs', async () => {
    const body = await (await fetch(`${base}/api/workday/workers`, { headers: authHeader })).json();
    expect(body.source).toBe('staged');
    expect(body.count).toBe(body.workers.length);
    expect(body.workers.every((w) => w.workdayId.startsWith('STAGED-'))).toBe(true);
  });

  it('acknowledges (does not silently ignore) customer Workday creds', async () => {
    const body = await (
      await fetch(`${base}/api/workday?tenant=${encodeURIComponent('https://wd5.example.com')}`, {
        headers: { ...authHeader, 'x-customer-token': 'customer-oauth-token' },
      })
    ).json();
    expect(body.meta.liveRequested).toBe(true);
    expect(body.meta.live).toBe(false);
    expect(body.meta.liveReason).toMatch(/Phase 2/);
  });
});

describe('Phase-1 CSV ingestion', () => {
  it('uploads text/csv, then summary + workers + status flip to source csv', async () => {
    const up = await fetch(`${base}/api/workday/workers/csv?filename=workers.csv`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'text/csv' },
      body: CSV,
    });
    expect(up.status).toBe(200);
    const result = await up.json();
    expect(result).toMatchObject({ ok: true, source: 'csv', inserted: 3, updated: 0, total: 3, rowErrors: [] });

    const summary = await (await fetch(`${base}/api/workday`, { headers: authHeader })).json();
    expect(summary.source).toBe('csv');
    expect(summary.headcount).toBe(2); // active + on_leave
    expect(summary.statusBreakdown).toEqual({ active: 1, on_leave: 1, terminated: 1 });
    expect(summary.openReqs).toBeNull(); // not derivable from a workers CSV

    const workers = await (await fetch(`${base}/api/workday/workers`, { headers: authHeader })).json();
    expect(workers.source).toBe('csv');
    expect(workers.count).toBe(3);

    const status = await (await fetch(`${base}/api/workday/status`, { headers: authHeader })).json();
    expect(status).toMatchObject({ source: 'csv', workerCount: 3, fileName: 'workers.csv', live: false });
  });

  it('accepts JSON { csv } bodies and upserts by WID on re-upload', async () => {
    const post = (csv) =>
      fetch(`${base}/api/workday/workers/csv`, {
        method: 'POST',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ csv }),
      });
    expect((await (await post(CSV)).json()).inserted).toBe(3);
    const again = await (await post('workday_id,legal_name\nW1,Ada L. Updated\nW9,New Person')).json();
    expect(again).toMatchObject({ inserted: 1, updated: 1, total: 4 });
  });

  it('422s a CSV with no valid rows, reporting row errors', async () => {
    const res = await fetch(`${base}/api/workday/workers/csv`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'text/csv' },
      body: 'email,foo\na@x.com,bar',
    });
    expect(res.status).toBe(422);
    expect((await res.json()).rowErrors[0].error).toMatch(/Missing required column/);
  });

  it('400s an empty body', async () => {
    const res = await fetch(`${base}/api/workday/workers/csv`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'text/csv' },
      body: '',
    });
    expect(res.status).toBe(400);
  });

  it('scopes uploads to the session tenant', async () => {
    await fetch(`${base}/api/workday/workers/csv`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'text/csv' },
      body: CSV,
    });
    const otherTenant = { Authorization: `Bearer ${signSession({ email: 'z@example.com', tenant: 'zoetis' })}` };
    const body = await (await fetch(`${base}/api/workday`, { headers: otherTenant })).json();
    expect(body.source).toBe('staged'); // spgi's upload must not leak into zoetis
  });
});
