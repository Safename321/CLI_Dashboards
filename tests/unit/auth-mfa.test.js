// D3 — emailed-code login. The contract that matters: a password-only answer of
// `mfa_required` must NOT leave a session behind, and only verifyMfa stores one.
import { describe, it, expect, beforeEach, vi } from 'vitest';

const store = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (store.has(k) ? store.get(k) : null),
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: (k) => store.delete(k),
};

const { login, verifyMfa, getToken } = await import('../../src/lib/auth.js');

const reply = (status, body) => Promise.resolve({ ok: status < 400, status, json: () => Promise.resolve(body) });

describe('login with an emailed code', () => {
  beforeEach(() => { store.clear(); vi.restoreAllMocks(); });

  it('returns the challenge and stores no session', async () => {
    globalThis.fetch = vi.fn(() => reply(200, { status: 'mfa_required', challenge: 'h', sentTo: 's***@t.test' }));
    const r = await login('s@t.test', 'pw');
    expect(r).toEqual({ mfaRequired: true, challenge: 'h', sentTo: 's***@t.test' });
    expect(getToken()).toBeNull();
  });

  it('stores the session only after the code is verified', async () => {
    globalThis.fetch = vi.fn(() => reply(200, { status: 'success', token: 'jwt', user: { id: 1, role: 'super' } }));
    const u = await verifyMfa('h', '123456');
    expect(u.role).toBe('super');
    expect(getToken()).toBe('jwt');
    expect(JSON.parse(globalThis.fetch.mock.calls[0][1].body)).toEqual({ challenge: 'h', code: '123456' });
  });

  it('a wrong code keeps the challenge; an expired or locked one asks to restart', async () => {
    globalThis.fetch = vi.fn(() => reply(422, { error: 'That code is not right.' }));
    await expect(verifyMfa('h', '000000')).rejects.toMatchObject({ restart: false });
    globalThis.fetch = vi.fn(() => reply(429, { error: 'Too many wrong codes.' }));
    await expect(verifyMfa('h', '000000')).rejects.toMatchObject({ restart: true });
    expect(getToken()).toBeNull();
  });

  it('roles without MFA still get a session straight from the password', async () => {
    globalThis.fetch = vi.fn(() => reply(200, { status: 'success', token: 'jwt2', user: { id: 2, role: 'admin' } }));
    const u = await login('a@t.test', 'pw');
    expect(u.role).toBe('admin');
    expect(getToken()).toBe('jwt2');
  });
});
