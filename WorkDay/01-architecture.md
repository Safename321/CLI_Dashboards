# 01 — System Architecture

> **Revised 2026-06-12** against CLI_Dashboards **v2.0.0** (see `00-RELEVANCE-AUDIT.md`).
> Original written 2026-06-09 from v1.24L, when the product was a static SPA with a
> Vercel-serverless proxy. The v2.0.0 rewrite replaced that with a real Express backend,
> so the CLI-side sections below have been updated. The Workday-side material is unchanged.

## TL;DR

CLI Dashboards v2.0.0 is a React SPA **plus a real Express backend**
(`cli-proxy-server/server.js`) deployed on a DigitalOcean droplet at
`161.35.118.231:8000/CLI_Dashboards/`. The backend already provides server-side
auth (bcrypt + JWT sessions), CORS allow-listing, rate limiting, and the `/api/*`
proxy routes. The Workday integration **extends this existing service** — it does
not require standing up a new one.

What still has to be built before production Workday API calls: (a) a Postgres
database, (b) SAML/OIDC SSO (email/password + JWT already exist), (c) a job queue
for async Workday sync work, and (d) the `/api/workday/*` endpoints themselves.
Keeping the integration inside `cli-proxy-server/` keeps tooling identical to what
the team already runs and minimizes new-stack risk.

## High-level architecture

```
                  ┌──────────────────────────────────────┐
                  │  Customer's Browser                  │
                  │  ┌────────────────────────────────┐  │
                  │  │ CLI Dashboard SPA              │  │
                  │  │ (React + Vite, static files)   │  │
                  │  │ Served by the same Express app │  │
                  │  └──────────┬─────────────────────┘  │
                  └─────────────┼────────────────────────┘
                                │ HTTPS, Authorization: Bearer <JWT>
                                ▼
        ┌────────────────────────────────────────────────────────┐
        │  cli-proxy-server (Express, DigitalOcean droplet)      │
        │  mounted under APP_BASE (e.g. /CLI_Dashboards/)        │
        │  ┌────────────────────────────────────────────────┐    │
        │  │ /api/auth/*     (existing — bcrypt + JWT)      │    │
        │  │ /api/chat       (existing — Anthropic)         │    │
        │  │ /api/sec-data /fred /gdelt /...  (existing)    │    │
        │  │ ── NEW ──                                      │    │
        │  │ /api/workday          (HRIS summary, staged)   │    │
        │  │ /api/workday/workers  (worker directory)       │    │
        │  │ /api/workday/workers/csv  (Phase-1 CSV upload) │    │
        │  │ /api/workday/sync     (Phase-2 — trigger read) │    │
        │  │ /api/workday/writeback (Phase-2 — push scores) │    │
        │  │ /api/jobs/status      (Phase-2 — poll jobs)    │    │
        │  └──────────┬─────────────────────────────────────┘    │
        │             │                                          │
        │  ┌──────────▼──────────┐  ┌──────────────────────┐     │
        │  │ Postgres            │  │ Job queue            │     │
        │  │ (self-hosted on     │  │ (BullMQ or pg-boss — │     │
        │  │  droplet, or Neon)  │  │  Node worker on the  │     │
        │  │ NOT BUILT YET       │  │  droplet) NOT BUILT  │     │
        │  └─────────────────────┘  └──────────┬───────────┘     │
        └─────────────────────────────────────┼─────────────────┘
                                              │  scheduled / triggered
                                              ▼
                                    ┌──────────────────────┐
                                    │ Customer's Workday   │
                                    │ Tenant               │
                                    │ ─ WWS (SOAP)         │
                                    │ ─ REST API           │
                                    │ ─ RaaS (reports)     │
                                    └──────────────────────┘
```

## Where the integration code lives

**Current reality:** `cli-proxy-server/` is already a real Express service — routers in
`routes/*.js`, shared logic in `lib/`, guards in `middleware/`, mounted in `server.js`
under the `APP_BASE` subpath. The Workday integration extends that layout (Express
routers, **not** Vercel `api/<name>.js` serverless functions — that was the v1.24L plan):

```
cli-proxy-server/
├── server.js                         (existing — mounts all routers under APP_BASE)
├── routes/
│   ├── auth.js                       (existing — login/me, bcrypt + JWT)
│   ├── chat.js                       (existing — Anthropic proxy, JWT-gated)
│   ├── data.js                       (existing — SEC/FRED/GDELT/... proxies)
│   └── workday.js                    (NEW — /api/workday/*; JWT-gated; grows into
│                                      routes/workday/ if it approaches ~400 lines)
├── middleware/
│   ├── auth.js                       (existing — signSession/verifySession/requireAuth)
│   ├── cors.js / rateLimit.js        (existing)
├── lib/
│   ├── anthropic.js / fetchJson.js   (existing)
│   ├── workersCsv.js                 (NEW — Phase-1 CSV parse + schema validation)
│   ├── workdayStore.js               (NEW — staged/ingested worker store until Postgres)
│   ├── db.js                         (Phase 0 remainder — Postgres client)
│   └── workday/
│       ├── soap.js                   (Phase 2 — WWS SOAP client)
│       ├── rest.js                   (Phase 2 — REST client)
│       └── mappers.js                (Phase 2 — Workday ↔ CLI shape)
├── config/credentials.js             (existing — bcrypt account store)
└── migrations/                       (Phase 0 remainder — DB schema migrations)
```

The dashboard SPA (`src/dashboards/*`, `src/connectors/*`) doesn't change much —
`HRISConnector.js`'s `WorkdayConnector` points at `/api/workday` (via the
`src/lib/apiBase.js` base-path helpers) and starts returning real data. The existing
connector pattern (BaseConnector / ConnectorRegistry) is well-suited for this and is
preserved.

## What runs the integration

**A long-running Express process on the droplet** — the same one already serving the
SPA and `/api/*`. There is **no 10-second serverless timeout** (that constraint was
Vercel-specific and is gone). Still:

- **Synchronous Workday calls** (single-worker lookups) run inline in the Express
  route handler, called from the SPA on-demand.
- **Asynchronous Workday work** (full org sync, score writeback for 5,000 workers)
  should still go through a **job queue** so HTTP requests stay fast and failures
  retry cleanly. On a droplet, a self-hosted Node queue — **BullMQ (Redis) or
  pg-boss (Postgres-backed, no extra infra once Postgres exists)** — fits better
  than the Vercel-coupled Inngest the original doc recommended. [ASSUMPTION → team
  choice; pg-boss is the lowest-friction once Postgres lands.]
- **Scheduled syncs** (nightly delta-pull) run as cron on the droplet (system cron
  or the queue's scheduler), invoking the same enqueue path.

If the service later moves back to Vercel/serverless, the route handlers port — but
that is a possible future, not today's architecture.

## Auth-token storage

**Today (v2.0.0):** server-side **bcrypt credential store** (`config/credentials.js`)
+ **JWT sessions** signed with `JWT_SECRET` (`middleware/auth.js`), sent as
`Authorization: Bearer <JWT>`. Secrets (`ANTHROPIC_API_KEY`, `JWT_SECRET`) live in a
gitignored `.env` on the droplet. The old `CLI_PROXY_TOKEN` / `x-cli-token` /
`x-cli-session-token` scheme is gone. Per-user-ish accounts exist; **SAML/OIDC SSO
does not yet.**

**For Workday integration:** three categories of secrets — with the option to move
sensitive items to a managed secret store (HashiCorp Vault Cloud, Doppler, AWS
Secrets Manager) when revenue justifies it:

| Secret | Scope | Storage |
|---|---|---|
| Anthropic API key | CLI-wide | droplet `.env` (existing) |
| `JWT_SECRET` | CLI-wide | droplet `.env` (existing) |
| SAML / OIDC IdP secrets | CLI-wide (one per IdP) | droplet `.env` (when SSO is built) |
| Workday ISU credentials | **Per customer** | Encrypted column in Postgres (`customer_credentials` table), encryption key in `.env` |
| OAuth refresh tokens (if using OAuth) | **Per customer** | Same encrypted-column pattern |

Workday credentials must be per-customer because every customer has their own tenant
with their own ISU. CLI does not (and must not) hold one set of Workday credentials
that works across customers — that's a multi-tenant breach waiting to happen.

[ASSUMPTION] CLI does not currently have a key-management story. The recommendation
above (encrypted column in Postgres, AES-256-GCM with the key in env var) is a
starting point, not a final answer. A real KMS conversation should happen before
storing the first real customer's Workday credentials.

## Observability

**Today:** essentially none — `console.log`/`console.error` to the droplet process
output. (Still true in v2.0.0; unchanged from the original assessment.)

**For Workday integration**, the minimum-viable observability stack:

| Concern | Tool | Why |
|---|---|---|
| Application logs | Structured JSON logs shipped to Axiom or BetterStack (log drain or agent on the droplet) | Free tiers cover early usage |
| Error tracking | Sentry | Catches unhandled exceptions; per-customer tagging |
| Workday-specific failures | Sentry + custom dashboard | Workday returns informative SOAP faults that need to be parsed and surfaced, not just logged |
| Job-queue observability | BullMQ/pg-boss dashboards (e.g. bull-board) | Comes nearly free with the queue choice |
| Uptime | An outside ping monitor (e.g. UptimeRobot) against the droplet | The droplet can't monitor itself |

The Workday-specific dashboard matters because procurement teams will ask "what
happens when the integration fails for our tenant?" The answer needs to be more
sophisticated than "we get a Sentry alert" — it needs to be "the customer gets a
notification, the failed sync is queued for retry, and there's an admin page in the
dashboard that shows them the state of every recent sync attempt." That admin page
is itself a deliverable in Phase 2.

## Data flow A — Workday → CLI (inbound sync)

The dashboard needs to know about every worker the customer wants assessed. The
inbound sync populates and maintains the `workers`, `positions`, `requisitions`,
and `organizations` tables.

```
Trigger
   │  (one of: nightly cron, customer admin clicks "Sync Now", webhook from Workday)
   ▼
/api/workday/sync   (Express route, JWT-gated)
   │
   │  1. Authenticate the request (JWT session, validate customer scope)
   │  2. Look up customer's Workday credentials (decrypt from DB)
   │  3. Enqueue a job: "sync workers for customer X"
   ▼
Job queue (BullMQ / pg-boss)
   │
   ▼
Background worker (Node process on the droplet)
   │  1. Call Workday WWS Get_Workers (paged, 200/page)
   │  2. For each worker page:
   │     - Map Workday fields → CLI worker shape
   │     - Upsert into `workers` table by workday_id
   │  3. Call Get_Job_Requisitions, Get_Organizations
   │  4. Update last_sync_at on the customer record
   │  5. Emit completion event (Sentry breadcrumb + admin notification)
```

**Idempotency:** every Workday object has a `workday_id` (WID); upserts use that as
the conflict key. Re-running a sync is safe and produces the same end-state.

**Failure handling:** transient errors (5xx, 429) are retried with exponential
backoff inside the queue (3 retries, then dead-letter). Permanent errors (401, 403,
malformed credentials) are surfaced immediately to the customer admin via an
in-dashboard alert + email.

## Data flow B — CLI → Workday (write-back)

When a worker completes an ASI assessment, the resulting score needs to flow back to
the worker's profile in Workday so that the customer's HR team can see it in their
primary system. Same pattern as inbound, in reverse.

```
Trigger
   │  (worker finishes ASI in CLI; CLI writes to `scores` table; emits event)
   ▼
Job queue (BullMQ / pg-boss)
   │
   ▼
Background worker
   │  1. Load the score row + the customer's Workday credentials
   │  2. Look up the worker's workday_id from `workers` table
   │  3. Build Workday Put_Worker_Document (or Add_Worker_Custom_Field) payload
   │  4. Call WWS with payload
   │  5. On success: mark score.writeback_status = 'completed'
   │  6. On failure: retry; after 3 attempts, mark 'failed' + alert
```

**Pre-flight check:** before writing, verify the customer has provisioned the
required CLI custom fields on the Worker object (`CLI_ASI_Intrinsic`,
`CLI_ASI_Competitive`, etc. — see `02-data-model-mapping.md` for the full list). If
not, fail fast with a clear message rather than burying a SOAP fault.

**Atomicity:** Workday doesn't have transactions across calls. If a write-back spans
multiple custom fields, the worker considers each write independently. We accept
this and design the writeback so each field is its own writable unit.

## What this architecture deliberately doesn't include

- **No real-time bidirectional sync.** Workday → CLI is batch + on-demand. CLI →
  Workday is event-triggered but queued, not real-time. The cost and complexity of
  true bidirectional consistency isn't worth it for a behavioral-assessment use case
  where data is naturally low-frequency.
- **No SCIM provisioning yet.** SCIM (System for Cross-domain Identity Management)
  is what enterprise customers use to auto-provision users into SaaS apps. It's a
  Phase 3 conversation — by the time CLI is selling at the volume where SCIM
  matters, most of the rest will already be in place.
- **No Workday Extend.** That's a Phase 4 conversation — building a native Workday
  app that runs inside the customer's tenant. Powerful, but it's effectively a
  second product. Defer until there's a compelling reason.
- **No customer-facing audit log UI in Phase 2.** Database tables exist
  (`audit_events`); a UI on top of them comes in Phase 3 when SOC 2 audit prep
  happens.

## Open architecture questions

- [ASSUMPTION] Postgres flavor: **self-hosted on the droplet** vs managed (Neon /
  Supabase). The original doc assumed Vercel-adjacent managed Postgres; on a droplet,
  self-hosted is cheapest and pg-boss then gives queueing for free, but managed
  Postgres buys backups/PITR with zero ops. **Recommend Neon (managed) unless ops
  budget exists**, but the team should make the call.
- [ASSUMPTION] Job queue: BullMQ (needs Redis) vs pg-boss (needs only Postgres) vs
  Inngest (best if the service ever returns to Vercel). Recommend **pg-boss** once
  Postgres exists.
- Whether CLI should host the database itself or use a customer-controlled database
  (e.g. CMK encryption keys held by the customer). BlackRock-class customers may
  demand this. Defer to `OPEN_QUESTIONS.md`.
