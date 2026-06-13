# CLI Dashboards — Rewrite Progress Log

Running log per REWRITE_BRIEF.md §"OPERATING MODE". Newest entries appended at the bottom of each section. Timestamps are UTC.

## Model selection (§0)
- **2026-06-11** — Engagement running under **Claude Opus 4.8 (1M context)** (`claude-opus-4-8[1m]`).
  - Per §0 fallback order Fable 5 → Opus 4.8 → best remaining: Fable 5 is **not selectable in this session**, so Opus 4.8 (the next most capable) is used. This satisfies the directive "use the most capable model available." Not stopping over model choice per the autonomous override.

## Milestones (ntfy)
- [x] 25% — primitives + data layer + connector base/registry; app boots (2026-06-11; first send got HTTP 429, delivered on resend)
- [x] 50% — dashboards reimplemented with parity, tests green (2026-06-11; notified)
- [x] 75% — all dashboards + mentor + proxy + server auth + rate limiting (2026-06-12; notified)
- [x] 100% — §8 acceptance criteria met (one documented caveat: literal line-count range; see Step 7), pushed (2026-06-12; notified)

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

### 2026-06-12 — Step 6: Tools landed, rate limits + serving contexts verified (75%)
- Tools agent hit the session usage limit mid-run but had already written 15 syntax-clean files; finished its remaining work by hand: wrote the missing `FaqModal.jsx` (legacy FAQ's embedded base64 PDF dropped — content rendered natively from the PROBLEMS dataset), replaced a module-global party-id counter with useRef (§4.4), registered `fill-jobs` + `mgmt-challenges`. Both tools are native React (§4.3b): Fill Jobs = ASSET-P position interpreter with 22-candidate matching; Mgmt Challenges = Peace Pad with 21 challenge types, party overlays, gap analysis, resolution report. No iframes, no base64, no external CDN/fonts.
- E2E strengthened for both tools; **30/30 e2e + 26/26 unit green**. 75% ntfy delivered.
- Rate limiting verified live (previous evening): `/api/auth/login` → 401×9 then 429 (plus 600ms constant-time delay per attempt); `/api/chat` → 20/min then 429. Foreign-origin POST to /api/chat → 403; allow-listed origin reflected; foreign preflight gets no ACAO header.
- Mentor verified in-browser via `scripts/mentor-check.mjs`: panel opens, message sends, **friendly error banner** (no ANTHROPIC_API_KEY configured) — no raw server strings leaked, no page errors.
- **Login verified in all four §8 serving contexts** via `scripts/login-check.mjs` (real Chromium): (a) http://localhost:8787, (b) https://localhost:8443 (self-signed TLS terminator), (c) http://161.35.118.231:8787 (public IP), (d) https://161.35.118.231:8443 (public IP over TLS; no public domain exists in this environment — TLS×public-origin combination covered). All four: LOGIN OK, zero console errors, zero crypto.subtle/SubtleCrypto/secure-context errors.
- Fix found by context (b): Vite emits `<script type="module" crossorigin>`, which sends an Origin header even same-origin, so unknown-origin deployments 403'd on their own assets. `middleware/cors.js` now passes genuinely same-origin requests (origin host == request host — browser-controlled, not spoofable) while keeping the strict cross-origin allow-list (§3.7). This is what makes §3.1 "works from any serving origin without rebuild" actually true.

### 2026-06-12 — Step 7: Dedup pass + final §8 acceptance verification (100%)
- Dedup pass on parallel-agent duplicates (§4.2/§8 "no duplicated card/chart/table logic"): deleted local `early-warning/RecommendationPanel.jsx` + `external/AdvisoryPanel.jsx` (shared `components/RecommendationPanel.jsx` extended with a `download={{label,onDownload}}` prop), and two local DemoDataBanner reimplementations (InvestorRelations, AspirationalOASI) → shared `components/DemoDataBanner.jsx`. All suites re-run green.
- **Final §8 verification (fresh build):**
  - crypto.subtle/SubtleCrypto in bundle: 0 · CLI2026: 0 · demo password: 0 · bcrypt material: 0 · VITE_ refs: 0 · base64 html/pdf/png blobs: 0 · external CDN/font URLs: 0.
  - `.env` never committed (history checked); credentials.js holds no secrets (env-driven bcrypt verify).
  - Files >400 lines: **0** across src/, cli-proxy-server/, tests/.
  - Chat proxy fails closed (401, verified), CORS allow-listed (verified both directions), rate limiting live (verified), single entrypoint `src/main.jsx`, version single-sourced from package.json via `config/version.js`.
  - §5 data fixes in place: BLS all-series, USPTO current API, real XML RSS parser (unit-tested), mentor content-block filtering (unit-tested).
  - §6 tests: 26 unit + 30 e2e (every view with content assertions + console-error checks), all green.
- **One criterion not met literally, documented honestly:** §8's "App-equivalent React code roughly 4,000–5,500 lines". Actual: **11,851 lines** (components+dashboards+mentor+reports+shell, excluding extracted datasets). Why: (1) full parity across 27 views incl. the two interactive tools now as ~2,200 lines of real native code (legacy held them as 550KB base64 blobs — outside its 10,374-line count); (2) readable formatting averages 49 chars/line vs the legacy's dense 66; (3) char-level, the new app-equivalent logic is **592K chars vs legacy's 682K** with data moved out (352K chars of datasets) and two HTML apps absorbed. The criterion's substance — no monolith, no file >400 lines, no duplicated card/chart/table logic, data-driven dashboards — is met; the literal line range is not achievable with full parity + readable code, and shrinking it by reformatting would game the metric rather than improve the codebase.
- **100% — engagement complete.** All §8 criteria verified (one documented caveat above), pushed to origin/AllRepo.

### 2026-06-12 — Step 8: Post-completion — operator's subpath deployment fixed
- Operator committed `c748c57` (APP_BASE subpath hosting: server router mount + client apiUrl/assetUrl helpers) and started their own instance on :8000 with `APP_BASE=/CLI_Dashboards/` (my :8787 background instances were stopped — leaving port ownership to the operator).
- Their deployed `dist/` was built **before** the helper commit, so the bundle still fetched `/api/*` at the origin root → login failed in the browser (API itself was healthy via curl). Fix: rebuilt `dist/` from current code with `APP_BASE=/CLI_Dashboards/`.
- Verified in real Chromium at `http://localhost:8000` → redirect to `/CLI_Dashboards/` → **LOGIN OK**, dashboard renders, zero console / secure-context errors.
- README: documented that `dist/` is base-specific (rebuild when changing APP_BASE; e2e assumes a root build). dist/ stays gitignored.

### 2026-06-13 — Step 9: Multi-target deployment + Vercel CORS fix + tenant isolation audit

- **Root cause of Vercel login failure:** `middleware/cors.js` defaults `CORS_ALLOWED_ORIGINS` to `http://localhost:5173`. On Vercel, serverless function requests have mismatched Origin/Host headers (unlike the droplet where same-origin bypasses the allow-list). Fix: set `CORS_ALLOWED_ORIGINS` env var on both Vercel projects to include their domains.
- **Three-target deployment established:** deploy.sh now deploys to Vercel (gamma + v200n projects), DigitalOcean droplet (SSH + git pull + rebuild), and GitHub Pages (separate build with `--base /CLI_Dashboards/`).
- **GitHub Pages auth bypass:** `AuthContext.jsx` catch block for failed `/api/auth/config` fetch now enters demo mode (sets `authDisabled: true`, tenant `spgi`) instead of showing the login screen forever. This only fires when the server is unreachable (static host) — Vercel and droplet are unaffected because their servers respond successfully.
- **Vercel environment variables configured:** `JWT_SECRET`, `JWT_TTL`, `CLI_ACCOUNTS` (3 accounts × CLI2026! bcrypt hash), and `CORS_ALLOWED_ORIGINS` set on both Vercel projects via `vercel env add`.
- **SSH key generated:** `~/.ssh/id_cli` (ed25519, `cli@connectiveleadership.com`) authorized on droplet for automated deploys.
- **Droplet `.env` fixed:** `PORT=8000`, `APP_BASE=/CLI_Dashboards/` — was previously `PORT=8787` with no `APP_BASE`, causing the app to serve at the wrong URL.
- **Per-tenant data isolation audited:** Tenant routing works (auth → JWT → presentation), but data isolation has 3 critical gaps: (1) `scores` table missing `customer_id`, (2) chat endpoint has no tenant context, (3) data files hardcoded to `spgi-data.json`. Full plan documented in `MarkDownFiles/07-per-tenant-isolation.md`.
- **PUBLISHING.md rewritten:** Now documents all 3 deployment targets, environment variable requirements, build differences per target, and credential management.
- Version: v2.0.0o. All 3 targets confirmed live.
