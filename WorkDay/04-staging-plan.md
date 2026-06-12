# 04 — Phased Delivery Plan

> **Revised 2026-06-12** against CLI_Dashboards **v2.0.0** (see `00-RELEVANCE-AUDIT.md`).
> The v2.0.0 rewrite built a chunk of Phase 0 before this plan kicked off: Express
> service skeleton, server-side bcrypt+JWT auth/sessions, CORS allow-list, rate
> limiting, and the de-monolithing of `App.jsx`. Phase-0 remaining work is
> **~5–8 engineer-weeks**, down from the original 8–12.

## TL;DR

The most consequential decision in this plan is **including a Phase 1 CSV path that lets CLI close the first enterprise deal before committing to the full backend build**. The full Workday API integration (Phase 2) is real engineering work — 8 to 12 engineer-weeks on top of a **5 to 8 engineer-week Phase 0 foundation remainder** (originally 8–12; v2.0.0 already built the rest). A CSV intermediate step gets revenue moving in 4 weeks.

Estimates assume one full-time senior engineer with relevant experience. Less experience or part-time effort lengthens proportionally. **All estimates are ±50% — engineering estimates always are, and Workday-flavored ones especially.**

## Phase 0 — Foundation (pre-Workday)

**Trigger:** decision to pursue enterprise customers. Already decided.

**Estimate:** ~~8-12~~ → **5-8 engineer-weeks remaining** (revised 2026-06-12). The
v2.0.0 rewrite already delivered roughly 30–40% of this phase — marked ✅/🟡 below.

### Deliverables

| Deliverable | Status (v2.0.0) | Approx weeks remaining | Why it's needed |
|---|---|---|---|
| Stand up Postgres database (self-hosted on droplet, or Neon) with migration tooling (Drizzle or Prisma) | ❌ not built | 1 | No DB persistence today (data is file-based: `public/data/spgi-data.json` + `src/data/datasets/*`). Everything Workday-related needs to land in a DB. |
| Build out `cli-proxy-server/` into a real service with auth, sessions, and the database client | 🟡 **mostly done** — Express service, routers, bcrypt+JWT auth/sessions, CORS allow-list, rate limiting all exist; DB client missing | 0.5 | The proxy became the actual backend in v2.0.0. Only the DB client remains. |
| Replace the shared-password `LoginGate.jsx` with real per-user authentication (SAML SSO + email/password fallback) | 🟡 **half done** — `LoginGate.jsx` is gone; server-side email/password + JWT + per-tenant accounts exist. **SAML/OIDC SSO still missing.** | 1.5-2 | Procurement won't accept a shared password (solved). Customers will mandate SSO (open). |
| Migrate hardcoded data in `App.jsx` (achievingStyles, OASI, etc.) into the database with API endpoints to read it | 🟡 **partly addressed** — the 10k-line monolith is gone; data lives in JSON files read via `DataContext`. Still file-based, not DB-backed. | 1 | The SPA needs server-backed reads before there's anywhere to write Workday-synced data. |
| Job queue (BullMQ or pg-boss — was "Inngest" when Vercel was the target) | ❌ not built | 0.5 | Required for async Workday work in Phase 2. |
| Observability: Sentry + log drain to Axiom | ❌ not built | 0.5 | Required before going live with any paying customer. |
| Encryption-at-rest pattern for customer credentials (AES-256-GCM, env-var key) | ❌ not built (though `.env` hygiene for server secrets already exists) | 0.5-1 | Required before storing the first Workday ISU password. |
| Tests: integration tests for the new auth flow, database migrations CI | 🟡 partly — unit suites (vitest) + e2e (Playwright) exist and run; DB-migration CI doesn't (no DB) | 0.5 | Below the line you can't ship without; above the line is testing detail. |

### Success criteria

- A new customer can sign up with SSO and reach the dashboard. *(email/password works today; SSO open)*
- Their dashboard reads its data from Postgres-backed APIs, not from the bundled `spgi-data.json` or hardcoded objects.
- An admin can paste a Workday ISU username + password into a settings page, and CLI stores them encrypted.
- A background job triggered manually can run async work without timing out. *(The droplet's long-running Express process has no serverless timeout, but queued execution + retries still need the job queue.)*

### What this phase deliberately doesn't include

- Any Workday API calls. The point of Phase 0 is the foundation; Workday is Phase 1+.
- SOC 2 audit prep. That's Phase 3.
- Pen test. Phase 2 deliverable.
- Production-grade rate limiting, multi-region deployment, complex caching. Add when needed.

### Trigger to move to Phase 1

Phase 0 deliverables are complete and the team is comfortable that a real customer could be onboarded onto the new stack. Plus: **at least one enterprise prospect with a verbal commitment to start a paid pilot.** Don't build Phase 1 without a destination.

## Phase 1 — Minimum viable integration (CSV/SFTP)

**Trigger:** first enterprise prospect ready to begin a paid pilot, and Phase 0 deliverables are stable.

**Estimate:** 3-5 engineer-weeks.

> **2026-06-12:** the first slice of this phase landed ahead of schedule — a
> JWT-protected `/api/workday` route, a CSV parser/validator
> (`cli-proxy-server/lib/workersCsv.js`), and an authenticated CSV upload endpoint
> (`POST /api/workday/workers/csv`) now exist on the v2.0.0 Express server. The
> upload endpoint stands in for the SFTP pickup until a customer actually requires
> SFTP; rows land in an in-memory store until the Phase-0 Postgres work completes.

### Why CSV/SFTP first

The brief asks for the simplest path that closes the first deal. CSV/SFTP is genuinely simpler than the Workday API and works in **every** customer's environment with no procurement-side configuration beyond "designate an SFTP user and a folder." For pilots, demos, and the first 1-2 paid customers, CSV/SFTP is faster to ship and faster for the customer to approve.

This is not a permanent solution. It's a 4-week bridge to keep the sales conversation moving while Phase 2 (real API) is built in parallel.

### Deliverables

| Deliverable | Approx weeks |
|---|---|
| SFTP client lib (`lib/sftp.js`) for inbound file pickup and outbound file drop | 0.5 |
| CSV parser + schema validator for incoming worker files | 0.5 |
| Customer onboarding doc: "Here are the columns we expect, here's the SFTP server we'll give you credentials for, here's the cadence" | 0.5 |
| Worker upsert pipeline: SFTP file → parse → upsert into `workers` table → emit completion event | 1 |
| Score CSV outbound: query `scores` table → write CSV → drop to SFTP folder the customer pulls from | 0.5 |
| Admin UI page: "Upload workers CSV" (alternative to SFTP for small customers) | 0.5 |
| Tests + documentation | 1 |

### Success criteria

- First customer onboarded: drops a 5,000-row workers.csv onto the SFTP server, CLI ingests it, dashboard shows all 5,000 workers within an hour.
- After CLI assessments complete, CLI generates a scores.csv that the customer pulls into Workday via their own Workday Studio integration or manual upload.
- Pilot revenue starts.

### Trigger to move to Phase 2

Two signals together:

1. **Customer #1 is live on CSV/SFTP and the pilot is going well** (data flowing in both directions, customer hasn't asked for an immediate refund, dashboard is providing value).
2. **Customer #2 or #3 has signed and explicitly mentioned that procurement will not approve CSV as the long-term integration mechanism.** This is the trigger that says "we have demand for real-API, not just demand."

If only signal 1 is true, you can stretch Phase 1 across more customers. If only signal 2 is true, build Phase 2 but don't expect demand until signal 1 catches up.

## Phase 2 — Production API integration (WWS + REST)

**Trigger:** both Phase 1 signals above.

**Estimate:** 8-12 engineer-weeks. This is where most of the integration's complexity lives.

### Deliverables

| Deliverable | Approx weeks |
|---|---|
| Workday SOAP client (`lib/workday/soap.js`) — handle SOAP envelope, WS-Security headers, fault parsing, paging | 2 |
| Workday REST client (`lib/workday/rest.js`) — basic auth, paging, retry logic | 1 |
| Shared client interface (`lib/workday/index.js`) — abstract over SOAP/REST so callers don't care which surface is used | 0.5 |
| Inbound sync jobs (Inngest): `syncWorkers`, `syncOrgs`, `syncRequisitions`, `syncCandidates` | 2 |
| Outbound writeback jobs: `writebackScore`, `writebackBulk` | 1 |
| Field mappers (`lib/workday/mappers.js`) — Workday object → CLI shape and back | 1 |
| Admin UI: customer-facing settings page for "Connect Workday" (tenant URL, ISU username, password) | 1 |
| Admin UI: sync status dashboard ("last sync was 3 hours ago, 5,000 workers updated, 0 failures") | 1 |
| Per-customer audit log: every Workday call recorded with status, latency, error if any | 0.5 |
| Customer onboarding doc revisions: now includes ISU setup walkthrough, custom-field creation checklist, ISSG permission list | 0.5 |
| End-to-end test: a Workday test tenant we control runs the full sync + writeback flow on every deploy | 1 |
| Pen test (external vendor) | 1 calendar week (not eng-weeks) |

### Success criteria

- A net-new customer can self-serve onboard onto API-based integration: enter Workday tenant URL, paste ISU credentials, click "Test Connection," then "Run First Sync."
- First sync completes for a 10,000-worker tenant in under 2 hours.
- Score writebacks complete in under 30 seconds per worker on average.
- Sentry shows zero unhandled exceptions across a 1-week production window.
- Pen-test findings are all remediated.

### What this phase deliberately doesn't include

- Workday Marketplace listing. That's Phase 3.
- Workday Extend (native app). Phase 4 only if ever.
- Real-time Workday → CLI event push. Some customers will ask; defer to "next quarter" answer.

### Trigger to move to Phase 3

A customer (or prospect) explicitly asks "are you listed on Workday Marketplace?" or "what's your Workday partnership status?" This signal usually comes from BlackRock-tier customers whose procurement requires it.

## Phase 3 — Workday Marketplace readiness

**Trigger:** at least one customer or prospect requires Marketplace listing as procurement gate.

**Estimate:** 4-8 engineer-weeks of CLI engineering effort. **Plus 2-4 calendar months for the Workday partner-program application process itself**, which is not engineering effort but real elapsed time.

### Deliverables

| Deliverable | Effort |
|---|---|
| Workday Partner Program application | Application work: ~1 week. Workday's review: 1-3 months wall-clock. |
| SOC 2 Type I report (or evidence of Type II in progress) | Audit prep ~4 weeks; auditor engagement: ~$15-25K + 1-2 months. **Required by Workday.** |
| Customer-facing audit log UI (logs from Phase 2 surfaced in the customer's admin view) | 1 week |
| Documentation: customer-facing integration guide, security FAQ, data-handling policy doc | 1 week |
| Security review responses: Workday's security questionnaire takes a meaningful amount of time to answer thoroughly | 2 weeks elapsed |
| Marketing collateral aligned to Workday partner branding | not engineering |
| Listing creation: integration page on Workday Marketplace, screenshots, descriptions, support contact info | 0.5 weeks |

### Success criteria

- Listed on Workday Marketplace under "Talent Management" or "HCM Extensions."
- SOC 2 Type I report in hand (Type II by Phase 4).
- Customer-facing security FAQ live on cli.com.
- Sales team has a one-pager for "Why CLI is Workday-certified."

### What this phase enables

Procurement teams that previously couldn't approve CLI now can. The Marketplace listing is the procurement-defensible proof that Workday has vetted the integration. This unlocks the largest tier of customers — the ones with the most rigorous vendor-onboarding processes.

## Phase 4 — Workday Extend (native app, optional)

**Trigger:** explicit customer demand for a native Workday-tenant-resident app, OR strategic decision that the embed-in-Workday experience is core to CLI's product story.

**Estimate:** 12+ engineer-weeks. This is essentially building a second product.

### What Extend gives you

A CLI app that runs **inside** the customer's Workday tenant. Users access CLI without leaving Workday. Data never has to traverse a network boundary because it's already in the tenant. Customer security teams love this (no third-party data egress); customer end-users love it (single workflow).

### What Extend costs

- Workday Extend Developer Subscription (~$$$ — quoted per customer).
- Workday's proprietary low-code framework (Workday Cloud Platform XSO definitions, AMP UI components).
- A second codebase entirely — Extend apps don't run on Vercel; they run on Workday.
- Loss of CLI's design system; you adopt Workday's UI primitives.
- Each customer's Extend deployment is a separate per-tenant rollout.

### Why Phase 4 and not Phase 1

Several reasons stacked:

1. The brief explicitly said not to recommend Extend in Phase 1 or 2. Agreed.
2. Extend requires a separate paid relationship with Workday before you can build at all.
3. The economics only work when CLI has 10+ enterprise customers; building Extend for 1 is a loss.
4. The Phase 2 web SPA integration is sufficient for the majority of customer use cases. Extend is a "premium experience" not a "table stakes" feature.

### Trigger to even consider Phase 4

A customer offers to fund the Extend build (i.e., pays for it directly), OR CLI's strategic plan requires the embedded-in-Workday experience for competitive positioning.

## Cross-phase commitments

These run alongside, not in any single phase:

- **SOC 2 Type II audit (Phase 3 dependency):** start the 12-month observation window as soon as Phase 0 ships. The first Type I (point-in-time) report is ready ~3 months after engagement; Type II (over time) report is ~12 months after start.
- **GDPR / data residency:** if any customer is EU-based, the database has to be either in EU region or have an EU sub-processor. Neon and Vercel both support EU-region deployments. Plan for this in Phase 2.
- **Penetration test cadence:** annual at minimum, after Phase 2 launches.
- **Workday version tracking:** Workday releases 2x a year (R1, R2). Each release potentially deprecates an API field. CLI must subscribe to Workday's release notes and budget ~1 week per release for compatibility patching.

## Open questions

These are the things that aren't answerable from the codebase alone and that someone — founder, prospect, Workday partner team — needs to confirm before the documents become actionable.

### Strategic

1. **Is there a specific named first customer?** The CSV/SFTP intermediate vs. straight-to-API decision changes if the first customer is BlackRock (will require API + Marketplace) vs. a smaller tier-2 enterprise (CSV is fine).
2. **What's the budget for the SOC 2 audit and the Workday partner program?** SOC 2 Type I auditor engagements run $15-25K; Type II adds $20-40K on top. Workday partner program fees are not public but exist.
3. **Is Workday Extend in the long-term roadmap or not?** Affects how much architecture-future-proofing to do now.

### Technical / customer-side

4. **What Workday version does the first customer run?** Affects API endpoint availability.
5. **Does the first customer model subsidiaries as one tenant with sub-orgs (BlackRock-style assumption above) or as separate tenants?** Affects whether the `customer_groups` table is needed in Phase 1 or can wait.
6. **Does the first customer use Workday's recruiting module, or a separate ATS (Greenhouse, Lever, etc.)?** If separate ATS, candidate sync is its own integration entirely, not a Workday concern.
7. **Does the customer have Workday Studio resources available to build a "push to CLI" Studio integration on their side?** Some customers prefer to push data out of Workday to us rather than have us pull. Changes the API surface.

### CLI-side

8. **Who is the engineer who will own this work?** Workday integrations are full-time effort, not a side project. Hiring or contracting must be scoped before Phase 1 starts.
9. **What's CLI's secrets-management strategy long term?** Encrypted column + env-var key works for Phase 1; large customers will eventually want HashiCorp Vault, AWS KMS, or customer-managed keys.
10. **What's the database backup/recovery RPO/RTO commitment to customers?** Procurement asks this; CLI needs an answer before the first signed contract.

### Workday partnership

11. **Has CLI talked to a Workday partnership team yet?** The earlier the better — the Marketplace application takes months, and getting in their queue ahead of build completion is free leverage.
12. **Is CLI willing to do a Workday Customer Co-Innovation (CCI) project?** This is a non-Marketplace path where a customer (like BlackRock) sponsors CLI's integration jointly with Workday. Can compress the timeline significantly.

## Honest assumptions in this plan

- All estimates assume **one senior full-stack engineer with Workday integration experience.** Without that experience, double the estimates and budget for 2-3 weeks of ramp-up. Workday integrations have specific gotchas (SOAP envelopes, WS-Security, fault parsing, ISU permission scoping) that take time to learn.
- All estimates assume **no parallel feature work** in CLI Dashboards during the integration sprint. If the team is also shipping new dashboard features, multiply by 1.5x.
- Customer-side delays are not in the estimates. "Customer's Workday admin needs to create custom fields" can take 2 weeks of calendar time even if it's 30 minutes of work.
- The 1-3 month Workday Marketplace review is wall-clock and unavoidable. Start it as early as possible.
