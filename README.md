# CLI Dashboards v2

Behavioral-intelligence dashboard platform for the Connective Leadership Institute (CLI) — a clean ground-up rewrite of `cli-dashboard v1.24L` with full feature parity: ~25 dashboards on the CLI Achieving Styles framework, an AI mentor, a per-tenant connector layer (real + mock data sources), report generation, and two interactive tools (Fill Jobs, Management Challenges) rebuilt as native React.

## Architecture

- **Client** (`src/`): React 18 + Vite + Tailwind + recharts.
  - `src/components/` — shared primitives (cards, charts, tables, badges, modals, OASI radars).
  - `src/dashboards/` — one file/folder per dashboard; registered in `src/dashboards/index.jsx`.
  - `src/mentor/` — AI mentor; the CLI system prompt is a standalone markdown asset.
  - `src/connectors/` — connector base + registry + 11 domains (real connectors route through the proxy; deterministic mocks for demos).
  - `src/data/` — DataContext loader + static datasets as data files.
  - `src/config/` — tenants, nav, version: single source of truth for business constants.
- **Server** (`cli-proxy-server/`): Express app serving `/api/*` (auth, chat, external data proxies) and, when `dist/` exists, the built client — so one origin hosts app + API in every serving context. The same route handlers deploy as Vercel functions.

## Security model

- **All credential validation is server-side.** The client sends email/password over `fetch` POST and receives a signed JWT. No Web Crypto / `crypto.subtle` anywhere in the auth path, so login works identically over HTTP and HTTPS, on localhost and public origins.
- **No secrets in the client bundle.** No `VITE_`-prefixed secrets; API keys live only in the server environment (`.env`, see `.env.example`).
- **Accounts are server-managed** via the `CLI_ACCOUNTS` env var (`email:bcryptHash` pairs) — changeable without rebuilding. Generate hashes with `node cli-proxy-server/config/hash-password.js '<password>'`.
- **`/api/chat` fails closed** (401 without a valid session JWT), is rate-limited per IP, and CORS is allow-listed (`CORS_ALLOWED_ORIGINS`) — no wildcard.
- **`/api/auth/login`** is rate-limited per IP with exponential backoff on failures.
- Public-demo mode: set `AUTH_DISABLED=true` to ship with auth genuinely disabled (no login screen) — never a decorative gate.

## Development

```bash
npm install
cp .env.example .env             # then set JWT_SECRET, CLI_ACCOUNTS, ANTHROPIC_API_KEY…
npm run server                   # Express proxy + static dist on :8787
npm run dev                      # Vite dev server on :5173 (proxies /api → :8787)
```

### Demo accounts (development only)

Set via `CLI_ACCOUNTS`. The development seed used in this repo's local `.env` (never committed):

| Email | Tenant |
|---|---|
| `admin@connectiveleadership.com` | generic |
| `admin@snpglobal.com` | S&P Global (SPGI) |
| `admin@zoetis.com` | Zoetis (empty-state) |

Development password for all three: `ConnectiveDemo2026!`. **Production deployments must set their own `CLI_ACCOUNTS` and `JWT_SECRET`.**

## Testing

```bash
npm test          # vitest unit tests (connectors, registry, RSS parser, mentor handler)
npm run build     # vite production build
npm run test:e2e  # Playwright: login + every dashboard mounts with expected content, no console errors
```

## Subpath hosting

The app can be hosted at the origin root (default) or under a subpath via `APP_BASE` — e.g. `https://host/CLI_Dashboards/`. The base is baked into the bundle at build time, so **`dist/` is base-specific**: the build and the server must use the same `APP_BASE`.

```bash
APP_BASE=/CLI_Dashboards/ npm run build     # bundle for subpath hosting
APP_BASE=/CLI_Dashboards/ npm run server    # serve app + API under the subpath
```

`npm run test:e2e` assumes a root build (`npm run build` with `APP_BASE` unset).

## Serving contexts

Login is verified to work in all four contexts (no secure-context-only APIs):
1. `http://localhost:8787` (Express serving `dist/`)
2. `https://localhost` (any TLS proxy in front of :8787)
3. `http://<public-ip>:8787`
4. `https://<public-domain>`

## Versioning

`package.json` version is the single source; the UI reads it via `src/config/version.js`.
