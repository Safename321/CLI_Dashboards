// Content-Security-Policy for the dashboard (audit WEB-02).
//
// The API already sends security headers; the SPA hosts sent none. Built from what the
// bundle actually loads (checked 2026-10-05): all script and CSS is same-origin, the only
// network calls go to the two Laravel API hosts (src/lib/auth.js), and images are local,
// data: (chart exports) or blob:.
//
// style-src keeps 'unsafe-inline' on purpose: the downloadable reports (swot, scenario,
// mentor, board packet...) are HTML built in the browser with an inline <style> block and
// opened from a blob: URL, which inherits this policy. Scripts stay strictly 'self'.
//
// Two copies have to agree: vite.config.js injects this as a <meta> tag into production
// builds (GitHub Pages and the droplet can only take a meta tag), and vercel.json sends
// it as a real header. tests/unit/csp.test.js fails if they drift.
export const CSP_DIRECTIVES = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://app.cardinalfund.com https://api.connectiveleadership.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

// frame-ancestors is ignored in a <meta> tag, so it is only in the header copy.
export const CSP_META = CSP_DIRECTIVES.join('; ');
export const CSP_HEADER = [...CSP_DIRECTIVES, "frame-ancestors 'none'"].join('; ');
