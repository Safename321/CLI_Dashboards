# CLI Dashboards — Rewrite Progress Log

Running log per REWRITE_BRIEF.md §"OPERATING MODE". Newest entries appended at the bottom of each section. Timestamps are UTC.

## Model selection (§0)
- **2026-06-11** — Engagement running under **Claude Opus 4.8 (1M context)** (`claude-opus-4-8[1m]`).
  - Per §0 fallback order Fable 5 → Opus 4.8 → best remaining: Fable 5 is **not selectable in this session**, so Opus 4.8 (the next most capable) is used. This satisfies the directive "use the most capable model available." Not stopping over model choice per the autonomous override.

## Milestones (ntfy)
- [x] 25% — primitives + data layer + connector base/registry; app boots (2026-06-11; ntfy returned HTTP 429 rate-limit — will retry with the 50% send)
- [ ] 50% — ~half of dashboards reimplemented with parity, tests green
- [ ] 75% — all dashboards + mentor + proxy + server auth + rate limiting
- [ ] 100% — all §8 acceptance criteria met, pushed

## Log

### 2026-06-11 — Step 0: Discovery & planning
- Confirmed fresh start: no `src/`, no prior progress files in repo root.
- Read v1.24L spec: `App.jsx` (10,374 lines, monolith), `LoginGate.jsx`, full `src/connectors/` (BaseConnector, ConnectorRegistry, 11 domain connector files + index), `cli-proxy-server/api/` (chat, sec proxies), `tests/dashboards.spec.js`, configs.
- Inventoried the authoritative dashboard switch (`renderDashboard`, App.jsx:10263): 25 dashboard components + `overview`/`further-reading` views. Written to PARITY_CHECKLIST.md.
- Confirmed the four security gaps named in §3 are present in the source:
  - **§3.1/§3.2** `LoginGate.jsx`: client-side `crypto.subtle` SHA-256 gate with embedded `PASSWORD_HASH` constant + shared password baked into the bundle. Breaks on non-secure origins; ships a credential.
  - **§3.6** `chat.js`: when `CLI_PROXY_TOKEN` is unset the endpoint runs **open** (soft warning only) — must fail closed.
  - **§3.7** `chat.js`: `Access-Control-Allow-Origin: '*'` wildcard on the chat endpoint — must be allow-listed.
  - **§3.8** No rate limiting anywhere.
- Wrote ARCHITECTURE.md (target module layout + shared-component set) and this log.
- Scaffolded the new Vite project: package.json (v2.0.0, server+security deps), vite/tailwind/postcss configs, single `index.html` + entrypoint to come, `src/index.css` design tokens, `src/config/{version,tenants}.js`, `.env.example` (server-only env, no VITE_ secrets). Removed old `assets/` bundle; relocated data + image to `public/`. Committed (`12f4305`).

### 2026-06-11 — Step 1: Connector layer
- Reimplemented the full connector layer clean under `src/connectors/`:
  - `BaseConnector.js` — config, retry-with-backoff, stale-payload fallback, schema-versioned localStorage cache, **injectable clock** (deterministic unit tests per §6), no silent failures (§4.5).
  - `ConnectorRegistry.js` — runAll fan-out, getLatestForDomain (real-over-mock), derivePrCrisis.
  - 9 domain files (financial, news, social-sentiment, macro, markets, innovation, owned-social, culture, hris, customer-health) — real connectors route through the proxy (so §5 RSS/USPTO/BLS fixes live server-side) + deterministic mock connectors for the demo.
  - `index.js` import surface + `buildRegistry.js` (mock-by-default per tenant).
### 2026-06-11 — Step 2: Data, auth, primitives, shell, secure server (NOT yet build-verified)
- Client: `data/DataContext.jsx` (immutable load, §4.4); `auth/AuthContext.jsx` + `auth/LoginScreen.jsx` (server-backed, **no crypto.subtle**, §3.1); shared primitives `components/{primitives,charts,DashboardShell,Sidebar}.jsx`; `config/nav.js`; `dashboards/{Placeholder,OverviewDashboard,index}.jsx` (Overview real, rest mount via Placeholder so smoke test passes); `App.jsx` shell-only; single `main.jsx` entrypoint (§3.4).
- Server (`cli-proxy-server/`): `server.js` (express, trust proxy); `config/credentials.js` (bcrypt verify from `CLI_ACCOUNTS` env, tenant-by-domain, timing-safe, §3.2/§3.3) + `config/hash-password.js` helper; `middleware/{cors (allow-list §3.7), rateLimit (chat + login backoff §3.8), auth (JWT §3.2)}`; `routes/auth.js` (login/me/config), `routes/chat.js` (**fails closed** §3.6), `routes/data.js` (SEC/FRED/BLS-all-series §5/GDELT/Google-News-real-XML §5/AlphaVantage/USPTO-current-API §5); `lib/{anthropic (content-block filtering §5),rss,fetchJson}.js`.
- `npm install` done (292 pkgs). **`vite build` NOT yet run / not verified.**
### 2026-06-11 — Step 3: Build-verify + boot + 25% milestone (after reboot/restart)
- `vite build` passes clean (44 modules, 157.9 kB JS / 51 kB gzip — vs ~10k-line monolith before).
- Created local `.env` (gitignored): generated `JWT_SECRET` via openssl, bcrypt-hashed demo accounts for admin@{connectiveleadership,snpglobal,zoetis}.com (dev password `ConnectiveDemo2026!` — documented for README, server-managed per §3.3).
- Server boots; verified by direct API calls: bad login → 401 "Incorrect email or password"; good login → JWT + tenant `spgi`; `/api/chat` with no token → **401 fails closed** (§3.6); with token but no ANTHROPIC_API_KEY → clean 500 "Server misconfigured" (graceful).
- Added static `dist/` serving to `cli-proxy-server/server.js` so ONE origin hosts app+API in all four §8 serving contexts (same-origin /api ⇒ no CORS dependence); SPA fallback for non-/api routes.
- Playwright (chromium installed): `scripts/login-check.mjs` drives real browser login at http://localhost:8787 → **LOGIN OK**, sidebar + Overview render, **zero console errors, zero crypto.subtle/secure-context errors**.
- **25% MILESTONE reached.** ntfy send returned HTTP 429 (rate-limited) — fire-and-forget per brief; will retry at 50%.
- **NEXT (resume here):** port the 25 dashboards to real parity (50%), wire the AI mentor + verify proxy/auth/rate-limit live (75%), add the §6 unit + e2e tests, satisfy all §8 acceptance criteria (100%). Build the two interactive tools (Fill Jobs, Mgmt Challenges) natively per §4.3b. Add README documenting demo creds + serving contexts.
