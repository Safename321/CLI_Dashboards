# Workday Integration — Autonomous Implementation Brief

You are an autonomous Claude Code session. Implement the Workday integration **first
buildable increment** for CLI_Dashboards v2.0.0. Run FULLY AUTONOMOUS — never pause for
sign-off; write decisions to files; commit + push to `origin/AllRepo` periodically.

## Read first (in this order)
1. `WorkDay/00-RELEVANCE-AUDIT.md` — what in the design docs is still true vs obsolete after the v2.0.0 rewrite. **Authoritative.**
2. `WorkDay/README.md`, `WorkDay/02-data-model-mapping.md`, `WorkDay/03-api-inventory.md`, `WorkDay/04-staging-plan.md`.
3. The current architecture: `cli-proxy-server/server.js`, `routes/*.js`, `middleware/auth.js`, `src/connectors/HRISConnector.js`, `src/connectors/BaseConnector.js`, `src/data/DataContext.jsx`.

## Ground truth (do NOT regress)
- This is **Express on a droplet**, NOT Vercel serverless. Add Express routers under `cli-proxy-server/routes/`, mounted in `server.js`. Do not introduce an `api/<name>.js` serverless layout.
- Auth is **JWT Bearer** via `middleware/auth.js`. Protect new endpoints with it.
- App is served under base path `/CLI_Dashboards/` (env `APP_BASE`); client fetches go through `src/lib/apiBase.js`. Keep that pattern.
- No file > ~400 lines. Keep the existing test suites green (`npm test`, `npm run build`). Don't touch `.env`, `.ntfy*`, secrets.

## Work items (update WORKDAY_PROGRESS.md as you go)
Track progress in `WORKDAY_PROGRESS.md` — keep the two machine-readable lines accurate at
all times (a notifier reads them):
- `PERCENT: <0-100>`  (rough % of the 7-item checklist below complete)
- `ETA: <e.g. "~40 min" or "2026-06-12 04:30 UTC">`  (your honest estimate to finish this increment)
Also append dated entries to the `## Log` section.

1. **Patch the design docs to v2.0.0 reality** per `00-RELEVANCE-AUDIT.md`: fix every ❌/⚠️ item in `01-architecture.md`, `04-staging-plan.md`, `CODEBASE_FILES_READ.md`, `OPEN_QUESTIONS.md` (#18 is answered: docs live in `WorkDay/`). Mark Phase-0 items already done.
2. **Add `/api/workday`** as a JWT-protected Express route (`cli-proxy-server/routes/workday.js`, mounted in `server.js` under the base path). It currently 404s; `src/connectors/HRISConnector.js` already calls it. Until real Workday creds exist, return clearly-labelled **staged data** (source: 'staged') in the CLI worker/HRIS shape — never silently mock as if real.
3. **Phase-1 CSV ingestion** (the docs' recommended first bridge): `cli-proxy-server/lib/workersCsv.js` to parse + schema-validate a workers CSV into the normalized worker shape, plus an endpoint to accept an upload. Adapt the docs' SFTP idea to a simple authenticated upload for now.
4. **Wire `WorkdayConnector`** to the real `/api/workday` (it already does — verify the proxyBase/base-path resolves under the subpath; add staged-vs-real handling and a clear `requiresOAuth` gate).
5. **Tests**: unit test the CSV parser/validator and the route's auth gate (fails closed without JWT). Keep `npm test` + `npm run build` green.
6. **Update `04-staging-plan.md`** Phase-0 estimate down (foundation partly built) and reconcile with the audit.
7. **Commit + push** to `origin/AllRepo` in logical chunks. Final: a short summary in `WORKDAY_PROGRESS.md` and set `PERCENT: 100`.

## Scope discipline
This is the **first increment**, not the whole 4–6 month plan. Do NOT stand up Postgres, SSO,
job queues, or real Workday SOAP/REST in this pass — note them as follow-ups. Deliver a clean,
tested, JWT-protected `/api/workday` + CSV path + corrected docs. Bump the app build letter
(`package.json` buildLetter) by one when you change shipping code, per the standing rule.
