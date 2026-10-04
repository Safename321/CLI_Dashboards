// Audit WEB-02 — the CSP exists in two places (vercel.json header, build-time <meta>).
// A policy edited in one and not the other is a host that silently differs, so pin them.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { CSP_HEADER, CSP_META } from '../../csp.config.js';

const vercel = JSON.parse(readFileSync(new URL('../../vercel.json', import.meta.url), 'utf8'));
const headerRoute = vercel.routes.find((r) => r.headers);

describe('content security policy', () => {
  it('vercel.json sends exactly the policy in csp.config.js', () => {
    expect(headerRoute.headers['Content-Security-Policy']).toBe(CSP_HEADER);
  });

  it('the header route runs before the SPA fallback and lets routing continue', () => {
    expect(vercel.routes[0]).toBe(headerRoute);
    expect(headerRoute.continue).toBe(true);
  });

  it('scripts are same-origin only', () => {
    const script = CSP_META.split('; ').find((d) => d.startsWith('script-src'));
    expect(script).toBe("script-src 'self'");
  });

  it('the API hosts the app calls are allowed', () => {
    expect(CSP_META).toContain('https://app.cardinalfund.com');
    expect(CSP_META).toContain('https://api.connectiveleadership.com');
  });
});
