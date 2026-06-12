# 01 — System Architecture

## TL;DR

Today's CLI Dashboards is a static React SPA with no server-side persistence. A Workday integration cannot live inside the existing app — there is nothing to live inside. **The integration requires a real backend service to be stood up first.** This document describes that backend, where the integration code goes, and how the two primary data flows work.

The chosen path is to **extend the existing `cli-proxy.vercel.app` Vercel project from a pass-through proxy into a proper service**, adding (a) a Postgres database, (b) per-customer authentication via SAML/OIDC SSO, (c) a job queue for async Workday sync work, and (d) endpoints that the dashboard SPA can call. This keeps tooling identical to what the team already runs and minimizes new-stack risk.

## High-level architecture

```
                  ┌──────────────────────────────────────┐
                  │  Customer's Browser                  │
                  │  ┌────────────────────────────────┐  │
                  │  │ CLI Dashboard SPA              │  │
                  │  │ (React + Vite, static files)   │  │
                  │  │ Hosted: Vercel (CLI's own)     │  │
                  │  └──────────┬─────────────────────┘  │
                  └─────────────┼────────────────────────┘
                                │ HTTPS, x-cli-session-token
                                ▼
        ┌────────────────────────────────────────────────────────┐
        │  cli-proxy.vercel.app (existing — to be extended)      │
        │  ┌────────────────────────────────────────────────┐    │
        │  │ /api/chat       (existing — Anthropic)         │    │
        │  │ /api/sec-data   (existing — SEC EDGAR)         │    │
        │  │ /api/gdelt /fred /bls-jolts /...  (existing)   │    │
        │  │ ── NEW ──                                      │    │
        │  │ /api/auth/*     (SAML/OIDC SSO)                │    │
        │  │ /api/workers    (worker directory CRUD)        │    │
        │  │ /api/scores     (ASI/OASI/360 results CRUD)    │    │
        │  │ /api/roles      (ASSET role-fit CRUD)          │    │
        │  │ /api/workday/sync   (trigger Workday read)     │    │
        │  │ /api/workday/writeback (push scores → Workday) │    │
        │  │ /api/jobs/status   (poll async jobs)           │    │
        │  └──────────┬─────────────────────────────────────┘    │
        │             │                                          │
        │  ┌──────────▼──────────┐  ┌──────────────────────┐     │
        │  │ Postgres            │  │ Job Queue            │     │
        │  │ (Neon or Vercel PG) │  │ (Inngest or QStash)  │     │
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

**Repo proposal:** the existing `cli-proxy-server/` directory becomes a real service repo, deployed independently to its own Vercel project (the one already at `cli-proxy.vercel.app`). The current files in `cli-proxy-server/api/` (`chat.js`, `sec-data.js`, etc.) already follow Vercel's `api/`-folder serverless-function convention. We extend that convention, not replace it.

```
cli-proxy-server/
├── api/
│   ├── chat.js                       (existing)
│   ├── sec-data.js                   (existing)
│   ├── gdelt.js / fred.js / ...      (existing)
│   ├── auth/
│   │   ├── login.js                  (NEW — SAML/OIDC entry)
│   │   ├── callback.js               (NEW — SSO callback)
│   │   └── session.js                (NEW — token validation)
│   ├── workers/
│   │   ├── index.js                  (NEW — list/get workers)
│   │   └── [id].js                   (NEW — get/update one worker)
│   ├── scores/
│   │   ├── index.js                  (NEW — ASI/OASI/360 results)
│   │   └── [id].js
│   ├── roles/
│   │   ├── index.js                  (NEW — ASSET role definitions)
│   │   └── [id].js
│   └── workday/
│       ├── sync.js                   (NEW — trigger inbound sync)
│       ├── writeback.js              (NEW — push to Workday)
│       └── webhook.js                (NEW — Workday → us, if used)
├── lib/
│   ├── db.js                         (NEW — Postgres client)
│   ├── workday/
│   │   ├── soap.js                   (NEW — WWS SOAP client)
│   │   ├── rest.js                   (NEW — REST client)
│   │   └── mappers.js                (NEW — Workday ↔ CLI shape)
│   ├── auth.js                       (NEW — session/token logic)
│   └── jobs.js                       (NEW — queue client)
├── migrations/                       (NEW — DB schema migrations)
└── README.md
```

The dashboard SPA (`src/App.jsx`, `src/connectors/*`) doesn't change much — `HRISConnector.js` (already a stub pointing at `/api/workday`) gets pointed at the new endpoints and starts returning real data. The existing connector pattern (BaseConnector / ConnectorRegistry) is well-suited for this and should be preserved.

## What runs the integration

**A serverless function model**, the same one already in use for the proxy. Specifically:

- **Synchronous Workday calls** (single-worker lookups, e.g. "fetch this candidate's profile") run as Vercel serverless functions, ~10-second timeout, called from the SPA on-demand.
- **Asynchronous Workday work** (full org sync, score writeback for 5,000 workers) runs through a **job queue** triggered by the serverless function and processed by background workers. Recommend **Inngest** ([ASSUMPTION] — team should choose between Inngest, QStash by Upstash, or Trigger.dev) because Inngest's Vercel integration is the lowest-friction and it has built-in retries, observability, and a free tier.
- **Scheduled syncs** (nightly delta-pull from Workday) run as Vercel Cron Jobs invoking a serverless function that enqueues the work.

This is a **PaaS-only stack** — no Docker, no Kubernetes, no AWS account. That's deliberate. The team already runs Vercel; adding Vercel Postgres (or Neon) and Inngest keeps everything in one mental model. If scale demands it later, the same code patterns lift cleanly to a real container service.

## Auth-token storage

**Today:** a single `CLI_PROXY_TOKEN` env var on Vercel guards the proxy. There is no per-user auth.

**For Workday integration:** three categories of secrets, all stored as Vercel project environment variables (encrypted at rest by Vercel) — with the option to move sensitive items to a managed secret store (HashiCorp Vault Cloud, Doppler, AWS Secrets Manager) when revenue justifies it:

| Secret | Scope | Storage |
|---|---|---|
| Anthropic API key | CLI-wide | Vercel env var (existing) |
| `CLI_PROXY_TOKEN` | CLI-wide | Vercel env var (existing) |
| SAML / OIDC IdP secrets | CLI-wide (one per IdP) | Vercel env var |
| Workday ISU credentials | **Per customer** | Encrypted column in Postgres (`customer_credentials` table), encryption key in Vercel env var |
| OAuth refresh tokens (if using OAuth) | **Per customer** | Same encrypted-column pattern |

Workday credentials must be per-customer because every customer has their own tenant with their own ISU. CLI does not (and must not) hold one set of Workday credentials that works across customers — that's a multi-tenant breach waiting to happen.

[ASSUMPTION] CLI does not currently have a key-management story. The recommendation above (encrypted column in Postgres, AES-256-GCM with the key in env var) is a starting point, not a final answer. A real KMS conversation should happen before storing the first real customer's Workday credentials.

## Observability

**Today:** essentially none. The proxy uses `console.log` and `console.error`, which surface in Vercel's function logs but nothing more.

**For Workday integration**, the minimum-viable observability stack:

| Concern | Tool | Why |
|---|---|---|
| Application logs | Vercel function logs + log-drain to Axiom or BetterStack | Free tiers cover early usage; structured JSON logs |
| Error tracking | Sentry | Catches unhandled exceptions; integrates with Vercel deploys; per-customer tagging |
| Workday-specific failures | Sentry + custom dashboard | Workday returns informative SOAP faults that need to be parsed and surfaced, not just logged |
| Job-queue observability | Inngest's built-in dashboard | If we use Inngest, this comes for free |
| Uptime | Vercel + a separate ping monitor (e.g. UptimeRobot) | Vercel can fool itself; an outside pinger can't |

The Workday-specific dashboard matters because procurement teams will ask "what happens when the integration fails for our tenant?" The answer needs to be more sophisticated than "we get a Sentry alert" — it needs to be "the customer gets a notification, the failed sync is queued for retry, and there's an admin page in the dashboard that shows them the state of every recent sync attempt." That admin page is itself a deliverable in Phase 2.

## Data flow A — Workday → CLI (inbound sync)

The dashboard needs to know about every worker the customer wants assessed. The inbound sync populates and maintains the `workers`, `positions`, `requisitions`, and `organizations` tables.

```
Trigger
   │  (one of: nightly cron, customer admin clicks "Sync Now", webhook from Workday)
   ▼
/api/workday/sync   (serverless function)
   │
   │  1. Authenticate the request (CLI session token, validate customer scope)
   │  2. Look up customer's Workday credentials (decrypt from DB)
   │  3. Enqueue a job: "sync workers for customer X"
   ▼
Job queue (Inngest)
   │
   ▼
Background worker
   │  1. Call Workday WWS Get_Workers (paged, 200/page)
   │  2. For each worker page:
   │     - Map Workday fields → CLI worker shape
   │     - Upsert into `workers` table by workday_id
   │  3. Call Get_Job_Requisitions, Get_Organizations
   │  4. Update last_sync_at on the customer record
   │  5. Emit completion event (Sentry breadcrumb + admin notification)
```

**Idempotency:** every Workday object has a `workday_id` (WID); upserts use that as the conflict key. Re-running a sync is safe and produces the same end-state.

**Failure handling:** transient errors (5xx, 429) are retried with exponential backoff inside Inngest (3 retries, then dead-letter). Permanent errors (401, 403, malformed credentials) are surfaced immediately to the customer admin via an in-dashboard alert + email.

## Data flow B — CLI → Workday (write-back)

When a worker completes an ASI assessment, the resulting score needs to flow back to the worker's profile in Workday so that the customer's HR team can see it in their primary system. Same pattern as inbound, in reverse.

```
Trigger
   │  (worker finishes ASI in CLI; CLI writes to `scores` table; emits event)
   ▼
Job queue (Inngest)
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

**Pre-flight check:** before writing, verify the customer has provisioned the required CLI custom fields on the Worker object (`CLI_ASI_Intrinsic`, `CLI_ASI_Competitive`, etc. — see `02-data-model-mapping.md` for the full list). If not, fail fast with a clear message rather than burying a SOAP fault.

**Atomicity:** Workday doesn't have transactions across calls. If a write-back spans multiple custom fields, the worker considers each write independently. We accept this and design the writeback so each field is its own writable unit.

## What this architecture deliberately doesn't include

- **No real-time bidirectional sync.** Workday → CLI is batch + on-demand. CLI → Workday is event-triggered but queued, not real-time. The cost and complexity of true bidirectional consistency isn't worth it for a behavioral-assessment use case where data is naturally low-frequency.
- **No SCIM provisioning yet.** SCIM (System for Cross-domain Identity Management) is what enterprise customers use to auto-provision users into SaaS apps. It's a Phase 3 conversation — by the time CLI is selling at the volume where SCIM matters, most of the rest will already be in place.
- **No Workday Extend.** That's a Phase 4 conversation — building a native Workday app that runs inside the customer's tenant. Powerful, but it's effectively a second product. Defer until there's a compelling reason.
- **No customer-facing audit log UI in Phase 2.** Database tables exist (`audit_events`); a UI on top of them comes in Phase 3 when SOC 2 audit prep happens.

## Open architecture questions

- [ASSUMPTION] Whether to use Vercel Postgres, Neon, or Supabase. All three work; Neon's branching is nice for staging environments, Supabase comes with auth helpers, Vercel Postgres has zero-config wiring. **Recommend Neon** for the branching and pricing, but the team should make the call.
- [ASSUMPTION] Whether to introduce a separate service for the Workday integration (Render/Fly.io) instead of extending Vercel proxy. Vercel's 10-second function timeout is a real constraint for long-running Workday calls. **Recommend Vercel for now, with all long work in Inngest workers** so the function-timeout limit doesn't matter. If that breaks, move to Fly.io for the worker tier specifically.
- Whether CLI should host the database itself or use a customer-controlled database (e.g. CMK encryption keys held by the customer). BlackRock-class customers may demand this. Defer to `OPEN_QUESTIONS.md`.
