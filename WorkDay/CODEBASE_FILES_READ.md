# Codebase Files Read

Files inspected during the production of the four design documents. Listed so future revisions can be informed by the same source material.

Source tree: `/home/claude/cli-dashboard-v1.24L/`
Read on: June 9, 2026 · 5:59 PM ET

## Top-level configuration

| File | What it told me |
|---|---|
| `package.json` | React 18 + Vite 5, no backend dependencies, no database driver. Confirms the SPA-only nature of the current product. |
| `vite.config.js` | Static build, base path `/CLI_Dashboards/`. Built artifact is plain static HTML/CSS/JS. |
| `.env` | Single env var (Anthropic API key placeholder). No real secrets layer in the dashboard itself. |
| `.gitignore` | Standard Vite ignores. Nothing about secret stores, ENV layers, or Docker. |
| `index.html`, `main.jsx` | Plain Vite entry. Nothing custom. |
| `tailwind.config.js`, `postcss.config.js` | Tailwind setup only. |

## Source

| File | What it told me |
|---|---|
| `src/App.jsx` (sampled) | ~10,375 lines monolithic. Hardcoded data shapes for `achievingStyles`, `ORG_OASI_SCORES`, `IDEAL_OASI_SCORES`. localStorage caching of `cli_spgi_data`. SEC EDGAR fetch via proxy. Anthropic chat via proxy. No backend calls beyond those. |
| `src/LoginGate.jsx` | The entire auth layer. Shared SHA-256 password hash, tenant detection by email domain (Zoetis, SPGI, generic). No SSO, no per-user accounts, no roles. |
| `src/connectors/BaseConnector.js` | Generic retry / localStorage-persistence pattern. Defines the connector contract used by all 10 domain connectors. |
| `src/connectors/ConnectorRegistry.js` | Registry + orchestrator with `runAll()` parallel execution and `getLatestForDomain()`. Models the right abstraction for what an HRIS connector should look like. |
| `src/connectors/HRISConnector.js` | **Already contains a `WorkdayConnector` stub.** Points at a `/api/workday` endpoint that doesn't exist yet. `requiresOAuth = true` flag is set. Confirms the Workday-integration shape was anticipated, just not built. |
| `src/connectors/CustomerHealthConnector.js`, `CultureConnector.js` | Other per-customer OAuth stubs. Same pattern as HRIS. |
| `src/connectors/FinancialConnector.js` | Real implementation (SEC EDGAR). Closest existing reference for "production integration." |
| `src/connectors/index.js` | Public API of the connector layer. |

## Proxy server (the closest thing to a backend)

| File | What it told me |
|---|---|
| `cli-proxy-server/api/chat.js` | The mature endpoint. Has `x-cli-token` auth header pattern, ANTHROPIC_API_KEY env var, error handling, CORS. **This is the pattern to extend for Workday endpoints.** |
| `cli-proxy-server/api/sec-data.js` (referenced) | Read-only proxy for SEC EDGAR. No auth header (public data). |
| `cli-proxy-server/api/gdelt.js`, `fred.js`, `bls-jolts.js`, `google-news.js`, `alphavantage.js`, `uspto.js` | All thin Vercel serverless proxies. Edge-cached. No DB. No session state. |
| `cli-proxy-server/README.md` | Documents the deployment story: Vercel project, env vars, no compose file, no Docker. |

## Data

| File | What it told me |
|---|---|
| `public/data/spgi-data.json` | The entire data layer for SPGI demo. ~9 KB. Holds company info, divisions, financials by year, sentiment, yearlyKPIs (achievingStyles, OASI scores). The "data model" lives in this file plus hardcoded App.jsx objects. |

## What I deliberately did not read

- `src/App.jsx` line-by-line (sampled by grep; the monolithic file isn't useful read top-to-bottom for design questions)
- `dist/` (build output, not source)
- `node_modules/` (irrelevant)
- The embedded `FILL_JOBS_HTML_B64` and `MGMT_CHALLENGES_HTML_B64` blobs in App.jsx (UI-only, irrelevant to integration design)
- `tests/` directory (Playwright e2e tests, irrelevant to integration design)
- Previous bump summaries (v1.24E through v1.24L) — context for what's been built but not material to the design question

## What the codebase confirms

1. **No backend exists.** All Workday integration code is greenfield.
2. **A connector pattern already exists** and is the right abstraction for the HRIS integration. The new code should plug into the existing `BaseConnector` / `ConnectorRegistry` pattern, not invent a new one.
3. **The Vercel proxy is the right home for the integration's server side.** Same tooling as the existing team's work, same deployment story, same env-var pattern. The right architectural move is to extend that project, not stand up a parallel service.
4. **The `WorkdayConnector` stub at `src/connectors/HRISConnector.js:6-25` is the entry point.** When the integration exists, this file pulls real data from the new server-side endpoints.
