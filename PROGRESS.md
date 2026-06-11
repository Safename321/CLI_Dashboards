# CLI Dashboards — Rewrite Progress Log

Running log per REWRITE_BRIEF.md §"OPERATING MODE". Newest entries appended at the bottom of each section. Timestamps are UTC.

## Model selection (§0)
- **2026-06-11** — Engagement running under **Claude Opus 4.8 (1M context)** (`claude-opus-4-8[1m]`).
  - Per §0 fallback order Fable 5 → Opus 4.8 → best remaining: Fable 5 is **not selectable in this session**, so Opus 4.8 (the next most capable) is used. This satisfies the directive "use the most capable model available." Not stopping over model choice per the autonomous override.

## Milestones (ntfy)
- [x] 25% — primitives + data layer + connector base/registry; app boots (2026-06-11; first send got HTTP 429, delivered on resend)
- [x] 50% — dashboards reimplemented with parity, tests green (2026-06-11; notified)
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
### 2026-06-11 — Step 4: Parallel port of all dashboards (11 subagents)
- Launched 11 parallel port agents against the v1.24L spec with a shared conventions contract (/tmp/port-conventions.md): (1) reports module + RecommendationPanel/shared-cards/DemoDataBanner, (2) executive cluster (CEO Advisory, Board Packet, Investor Relations + financial panels), (3) predictive cluster (Early Warning + Scenario Tester, Causal Analysis + behavioral matrix/simulator, Scenario Modeling), (4) employee cluster (Employee Leading 7 tabs, Customer Health, Post-Merger Integration, Hiring), (5) OASI/ASI cluster (OASI radars incl. tri-color wheel chart, Individual ASI, Org OASI, Aspirational OASI), (6) behavior cluster (Investor Behavior, Sentiment, Culture Change), (7) merger cluster (Post Merger Updates + M&A deals data), (8) ops cluster (External View, Data Provenance — base64 PDF replaced with generated HTML doc, Meeting Prep, Tenant Config + RegistryContext), (9) info cluster (Help, Further Reading — 66KB REFS line → dataset JSON, About CLI), (10) interactive tools (Fill Jobs + Mgmt Challenges decoded from base64 and rebuilt native React per §4.3b), (11) AI mentor (system prompt as own asset, /api/chat client with JWT, CLAIM deep-link rendering).
- Orchestrator-side shell wiring done meanwhile: App.jsx now holds selectedYear + YearSelector (Sidebar), TrendChartModal for onMetricClick (NOTE: v1.24L's TrendChart rendered an empty overlay — restored intended behavior with a real line chart), mentor mount + floating button, deep-link preSelection plumbing, RegistryProvider mount.
### 2026-06-11 — Step 5: Integration — 25 of 27 views live, all tests green (50%+ milestone)
- 10 of 11 port agents complete (interactive-tools agent still running). Landed: reports module (`src/reports/`), RecommendationPanel/shared-cards/DemoDataBanner, executive cluster, predictive cluster, employee cluster, OASI/ASI cluster, behavior cluster, merger cluster, ops cluster (+RegistryContext), info cluster, AI mentor module.
- Cross-agent contract fixes at integration: CustomerHealth/Hiring/EmployeeLeading used `RecommendationCard`/`StatMetricCard` with the wrong prop shapes → swapped to `RecommendationPanel` + `FinancialKPICard`; TrendChartModal extended to resolve metrics from `yearlyKPIs` as well as `financials` (Sentiment passes KPI keys).
- Wrote full `src/dashboards/index.jsx` registry (25 real views; fill-jobs/mgmt-challenges on Placeholder until the tools agent lands).
- `vite build` green: 955 modules, 1,198 kB JS (343 kB gzip), CSS 48 kB. No file >400 lines anywhere in src/ or cli-proxy-server/.
- Unit tests: 26 green (connector retry/stale-fallback/cache, registry runAll/real-over-mock/crisis, RSS parser, Anthropic content-block handler).
- Playwright e2e: **30/30 green** — login without secure-context APIs, bad-credential rejection, every nav view mounts with expected content and zero console errors.
- 25% (resend) + 50% ntfy notifications delivered.
- **NEXT (resume here):** tools agent (fill-jobs, mgmt-challenges) → register + strengthen their e2e expectations; live-verify mentor against /api/chat (needs ANTHROPIC_API_KEY; without it verify the friendly error path); rate-limit live check; multi-context login verification (HTTP/HTTPS × localhost/public); bundle security greps; README/version checks → §8 sign-off → 75%/100% milestones., wire the AI mentor + verify proxy/auth/rate-limit live (75%), add the §6 unit + e2e tests, satisfy all §8 acceptance criteria (100%). Build the two interactive tools (Fill Jobs, Mgmt Challenges) natively per §4.3b. Add README documenting demo creds + serving contexts.
