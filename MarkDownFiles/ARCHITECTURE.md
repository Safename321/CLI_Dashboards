# Architecture — CLI Dashboards clean rewrite

Per REWRITE_BRIEF §4 & §7.2. Goal: full v1.24L parity with no file > ~400 lines, no duplicated card/chart/table logic, ~4,000–5,500 lines of App-equivalent React total. The §7.2 sign-off is overridden by autonomous mode — this is the chosen structure; proceeding.

## Module layout

```
/                         # repo root = the new app (deployed bundle replaced)
├─ index.html             # single mount point, #root
├─ package.json           # version = single source of truth (§4.9)
├─ vite.config.js
├─ tailwind.config.js  postcss.config.js
├─ .env.example           # documents server env only; NO VITE_ secrets (§3.5)
├─ public/
│   ├─ cli-wheel.png
│   └─ data/spgi-data.json
├─ src/
│   ├─ main.jsx           # the ONLY entrypoint (§3.4)
│   ├─ App.jsx            # shell ONLY: routing switch, sidebar, top-level state
│   ├─ index.css          # Tailwind entry + design tokens
│   ├─ config/
│   │   ├─ tenants.js     # tenant metadata (NO password/hash — auth is server-side)
│   │   ├─ version.js     # re-exports version from package.json (single source)
│   │   └─ nav.js         # sidebar nav groups + view→component map
│   ├─ auth/
│   │   ├─ AuthContext.jsx   # session state, login()/logout(), token in memory
│   │   └─ LoginScreen.jsx   # posts creds to /api/auth/login; NO crypto.subtle
│   ├─ data/
│   │   ├─ DataContext.jsx   # loads spgi-data.json into React state/context
│   │   └─ datasets/*.js     # static datasets as data files (causal links, scenario levers, OASI styles)
│   ├─ components/        # shared primitives — build once, reuse everywhere (§4.2)
│   │   ├─ MetricCard.jsx     BulletChart.jsx    StatusBadge.jsx
│   │   ├─ charts/ (Radar, Line, Bar, Donut wrappers over recharts)
│   │   ├─ ReportModal.jsx    RecommendationPanel.jsx   DataTable.jsx
│   │   ├─ DashboardShell.jsx (title/subtitle/alert header + tab strip)
│   │   └─ Tabs.jsx  Slider.jsx  Iframe.jsx (a11y: title)
│   ├─ dashboards/        # ONE file per dashboard (27 views); data-driven where they differ only by content
│   ├─ mentor/
│   │   ├─ Mentor.jsx        # chat UI + deep-link navigation
│   │   ├─ systemPrompt.md   # CLI Achieving Styles prompt as an ASSET, not inline (§4.1)
│   │   └─ responseHandler.js# filter content blocks by type; empty/error handling (§5)
│   └─ connectors/        # BaseConnector + ConnectorRegistry + 11 domains real+mock + index
├─ cli-proxy-server/      # Express server (local dev) + Vercel functions (deploy)
│   ├─ server.js          # express app wiring all routes + middleware
│   ├─ middleware/
│   │   ├─ cors.js        # allow-list reflection (§3.7)
│   │   ├─ rateLimit.js   # per-IP limiter + login backoff (§3.8)
│   │   └─ auth.js        # JWT verify for protected routes (§3.6)
│   ├─ routes/
│   │   ├─ auth.js        # POST /api/auth/login → validate (bcrypt) → signed JWT
│   │   ├─ chat.js        # POST /api/chat → verify token → forward to Anthropic (fails closed)
│   │   └─ data/*.js      # sec/fred/bls-jolts/gdelt/google-news/alphavantage/uspto/markets
│   ├─ config/credentials.js  # demo accounts from env map (§3.3), bcrypt hashes
│   └─ lib/ (anthropic.js, rss.js using a real XML parser, fetchJson with retry)
└─ tests/
    ├─ dashboards.spec.js   # e2e: every view mounts, real per-dashboard assertions (§6)
    └─ unit/               # connector retry/stale, registry runAll/crisis, RSS parser, mentor handler
```

## Key decisions
- **Auth model (§3):** Client posts `{email, password}` to `/api/auth/login`. Server validates against bcrypt hashes from an env-configured account map, returns a short-lived **JWT** (also sets tenant from the email domain server-side). Client holds the token in memory + a non-`httpOnly` mirror is avoided; session restore re-validates via `/api/auth/me`. No Web Crypto on the client anywhere in the auth path. If deployed without a configured backend, the app runs with auth **fully disabled** (no login screen) as a documented public demo — never a decorative gate.
- **Interactive tools (§4.3):** Choosing **(b) native React rebuild** for Fill Jobs and Management Challenges so they share the design system + connector layer; no iframes, no base64, no external CDN.
- **State (§4.4):** Data via `DataContext`; immutable updates; `localStorage` only as schema-versioned connector cache (already how BaseConnector works) — network is source of truth.
- **Charts:** thin wrappers over `recharts` (already a dep) so dashboards never re-implement chart boilerplate.
- **Version (§4.9):** `package.json` version imported by `src/config/version.js`; UI reads it from there. No hardcoded `v1.24L` strings.
- **Local dev server:** Express (mirrors the Vercel functions) so login/chat/rate-limit/CORS are testable across all four serving contexts without deploying.

## Dependencies to add
- runtime client: (none beyond react/react-dom/recharts)
- server: `express`, `jsonwebtoken`, `bcryptjs`, `express-rate-limit`, `cors`, `fast-xml-parser` (RSS), `dotenv`
- dev: existing playwright/vite/tailwind + `vitest` for unit tests

## Deployment architecture (3 targets)

The app deploys to three hosts simultaneously via `deploy.sh`:

```
deploy.sh
├── Vercel (gamma)  — cli-dashboards-gamma.vercel.app     (primary, serverless)
├── Vercel (v200n)  — cli-dashboards-v200n.vercel.app     (secondary, serverless)
├── DO Droplet      — 161.35.118.231:8000/CLI_Dashboards/ (reference, Express)
└── GitHub Pages    — safename321.github.io/CLI_Dashboards (demo, static-only)
```

### Build differences per target

| Target | Vite `base` | `APP_BASE` env | Auth | Server |
|--------|-------------|----------------|------|--------|
| Vercel | `/` (default) | not set | Full (JWT) | Serverless functions via `vercel.json` |
| Droplet | `/CLI_Dashboards/` | `/CLI_Dashboards/` | Full (JWT) | Express on port 8000 |
| GitHub Pages | `/CLI_Dashboards/` (via `--base`) | not set | Disabled (no server) | None — static files only |

### CORS

The server's `middleware/cors.js` checks `CORS_ALLOWED_ORIGINS` for cross-origin requests. Same-origin requests (where `Origin` header host matches `Host` header) bypass the allow-list. On Vercel, serverless functions see mismatched Origin/Host headers, so the Vercel domain **must** be in the allow-list or login fails with 403.

### Environment variables per target

| Variable | Vercel | Droplet `.env` | GitHub Pages |
|----------|--------|----------------|--------------|
| `JWT_SECRET` | Vercel Dashboard | `.env` | N/A |
| `JWT_TTL` | Vercel Dashboard | `.env` | N/A |
| `CLI_ACCOUNTS` | Vercel Dashboard | `.env` | N/A |
| `CORS_ALLOWED_ORIGINS` | Vercel Dashboard | `.env` | N/A |
| `PORT` | auto | `8000` | N/A |
| `APP_BASE` | not set | `/CLI_Dashboards/` | N/A |
| `ANTHROPIC_API_KEY` | Vercel Dashboard | `.env` | N/A |

### Tenant isolation status

Tenant routing is implemented (email domain → tenant ID in JWT → presentation metadata). Data isolation is **not yet implemented** — see `MarkDownFiles/07-per-tenant-isolation.md` for the full plan. Key gaps: `scores` table missing `customer_id`, chat endpoint has no tenant context, data files are hardcoded to S&P Global.
