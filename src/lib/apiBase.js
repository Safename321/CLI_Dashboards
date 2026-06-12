// Base-path helpers so the app can be hosted at the origin root OR under a
// subpath (e.g. https://host/CLI_Dashboards/). Vite injects BASE_URL from the
// build-time `base` option; it always carries a trailing slash ('/' or
// '/CLI_Dashboards/'). All same-origin fetches go through these so absolute
// '/api' / '/data' paths don't escape the subpath.
// NOTE: must be the exact token `import.meta.env.BASE_URL` (no optional
// chaining) so Vite statically replaces it with the build-time base. Using
// `import.meta?.env?.BASE_URL` silently defeats that and collapses to '/'.
const BASE = import.meta.env.BASE_URL || '/';

// API endpoint under the app base.
//   apiUrl('/api/auth/login') -> '/CLI_Dashboards/api/auth/login'  (subpath)
//   apiUrl('/api/auth/login') -> '/api/auth/login'                 (root)
export function apiUrl(path) {
  return BASE.replace(/\/$/, '') + path;
}

// Static asset under the app base.
//   assetUrl('data/spgi-data.json') -> '/CLI_Dashboards/data/spgi-data.json'
export function assetUrl(path) {
  return BASE + path.replace(/^\//, '');
}

// Prefix connectors prepend before '/api/...' (no trailing slash).
export const API_PREFIX = BASE.replace(/\/$/, '');
