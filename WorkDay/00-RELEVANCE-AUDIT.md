# 00 — Relevance Audit (post-v2.0.0 rewrite)

**Audited:** 2026-06-12 · **Against:** current `CLI_Dashboards` v2.0.0d (branch AllRepo)
**Why:** The four design docs were written **2026-06-09 from the v1.24L codebase**. Since
then the app was **rewritten ground-up to v2.0.0**. This audit checks every material
claim/item in the docs for whether it is *still true*, and records the correction where
it is not. The Workday-side material (object model, API surface, phasing strategy) is
largely unaffected; the **CLI-side architecture/foundation assumptions are the ones that
moved.**

## Headline

The docs' founding premise — *"CLI has no backend; it's a static SPA with a client-side
shared password; Phase 0 = build the foundation"* — is **partly obsolete.** The v2.0.0
rewrite already built a real backend with real per-user-ish auth. Roughly **30–40% of
Phase 0 is now done.** The Workday-side design remains valid.

## Item-by-item

| # | Doc / claim | Still true? | Correction (current reality) |
|---|---|---|---|
| 1 | README/CODEBASE: "No backend exists. Greenfield." | ❌ **Obsolete** | There is an **Express backend** at `cli-proxy-server/server.js` (routers + middleware), deployed on a DigitalOcean droplet, serving the SPA + `/api/*`. |
| 2 | "Auth is a single shared password hashed client-side in `LoginGate.jsx`." | ❌ **Obsolete** | `LoginGate.jsx` no longer exists. Auth is **server-side bcrypt + JWT** (`cli-proxy-server/routes/auth.js`, `middleware/auth.js`, client `src/auth/AuthContext.jsx`). No `crypto.subtle`. |
| 3 | 01-arch: deploy target is **Vercel serverless** (`api/` folder, 10-s timeout, `cli-proxy.vercel.app`). | ⚠️ **Changed** | Current deploy is a **long-running Express server** (no 10-s function limit) on a droplet at `161.35.118.231:8000/CLI_Dashboards/`. Route layout is `routes/*.js` Express routers, **not** `api/<name>.js` serverless functions. Vercel handlers may still be a future target but are not today's reality. |
| 4 | Auth token = `CLI_PROXY_TOKEN` / `x-cli-token` / `x-cli-session-token`. | ⚠️ **Changed** | Now `Authorization: Bearer <JWT>` issued by `/api/auth/login`, validated by `middleware/auth.js`. Chat fails closed without it. |
| 5 | Phase 0: "Replace shared-password LoginGate with real per-user auth (SSO + email/password)." | 🟡 **Partly done** | Email/password + JWT sessions + per-tenant accounts **exist**. **SAML/OIDC SSO still missing** — that part of Phase 0 remains. |
| 6 | Phase 0: "Build the proxy into a real service with auth, sessions, DB client." | 🟡 **Partly done** | Auth + sessions + CORS allow-list + rate limiting **done**. **Postgres/DB client still missing.** |
| 7 | Phase 0: "Migrate hardcoded `App.jsx` data (achievingStyles/OASI) into a DB." | 🟡 **Partly addressed** | The 10,375-line monolith is gone; data now lives in `public/data/spgi-data.json` + `src/data/datasets/*` read via `DataContext`. Still **file-based, not DB-backed** — the DB migration itself is still open, but "hardcoded in App.jsx" is solved. |
| 8 | CODEBASE_FILES_READ list (`App.jsx` 10k-line monolith, `LoginGate.jsx`, `api/chat.js`, `api/sec-data.js`). | ❌ **Stale** | Those files don't exist in v2.0.0. Equivalents: `routes/chat.js`+`lib/anthropic.js` (chat), `routes/data.js` (SEC/FRED/etc.), `src/auth/*` (login), `src/dashboards/*` (UI). Any future re-read should use the v2.0.0 tree. |
| 9 | "WorkdayConnector stub points at `/api/workday` which doesn't exist yet." | ✅ **Still true** | Confirmed: `src/connectors/HRISConnector.js` calls `/api/workday` and **no such route exists** server-side. This is still the integration entry point and the first concrete build target. |
| 10 | Observability "essentially none, console.log only." | ✅ **Still true** | No Sentry/log-drain yet. |
| 11 | 02-data-model-mapping (Workday object ↔ CLI shape, WID identity). | ✅ **Still valid** | Workday-side; unaffected by our rewrite. Map target shapes onto current `src/data` shapes. |
| 12 | 03-api-inventory (WWS SOAP / REST / RaaS, ISU auth, rate limits, paging). | ✅ **Still valid** | Workday-side; unaffected. |
| 13 | Phasing strategy: CSV/SFTP Phase 1 bridge → API Phase 2 → Marketplace Phase 3 → Extend Phase 4. | ✅ **Still valid** | Sound strategy. Phase-0 estimates shrink because foundation is partly built (see #5–7). |
| 14 | Secrets: per-customer Workday creds, encryption-at-rest (AES-256-GCM), env-var key. | ✅ **Still relevant** | Not built. Note: we already keep `ANTHROPIC_API_KEY`/`JWT_SECRET` server-side in gitignored `.env` (good hygiene baseline). |
| 15 | Job queue (Inngest), Postgres (Neon/Vercel/Supabase) choices. | ✅ **Still open** | Not built. Caveat: choices assumed Vercel; on a droplet, a self-hosted Postgres + a Node worker/queue (BullMQ/pg-boss) may fit better than Vercel-coupled Inngest. Flag in OPEN_QUESTIONS. |
| 16 | OPEN_QUESTIONS #1–17 (named customer, SOC2 budget, Workday version, multi-tenancy, etc.). | ✅ **Still open** | All remain genuine unknowns. **#18 ("where do docs live — no `/docs/`")** is now answered: they live in `WorkDay/` in the repo. |

## Net effect on the plan

- **Phase 0 estimate drops** from 8–12 eng-weeks to roughly **5–8**, because auth/sessions,
  the service skeleton, CORS, rate limiting, and de-monolithing are done. Remaining Phase 0:
  **DB + migrations, SSO, encrypted per-customer credential store, job queue, observability.**
- **Architecture doc needs a deployment-reality patch**: Express-on-droplet today (not Vercel
  serverless); routes are Express routers; auth is JWT Bearer. The proposed `api/` file tree
  should be re-expressed as `cli-proxy-server/routes/workday/*` + `lib/workday/*`.
- **First concrete buildable step is unchanged and ready:** implement the `/api/workday`
  endpoint (JWT-protected, on the existing Express server) that `HRISConnector.js` already
  expects, plus the Phase-1 CSV ingestion path — adapted to Express/droplet, not Vercel.

See `WORKDAY_IMPL_BRIEF.md` (repo root) for the implementation that follows from this audit.
