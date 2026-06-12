# 03 — Workday API Call Inventory

## TL;DR

Workday has two main API surfaces: **Workday Web Services (WWS, SOAP)** and **the Workday REST API**. Most production integrations use both because REST coverage is incomplete. CLI's integration follows the same pattern: REST where it suffices, WWS for the gaps. A third surface — **RaaS (Reports as a Service)** — is used for bulk reads where appropriate.

Auth is via an **Integration System User (ISU)** with a tightly scoped **Integration System Security Group (ISSG)**. OAuth client credentials exist but are less universally supported across Workday tenant configurations; ISU is the procurement-defensible default.

Phase 1 ships with 6 endpoints. Phase 2 adds 8 more. Every other Workday endpoint is out of scope.

## Auth flow in detail

### Why ISU not OAuth (for v1)

Workday's OAuth client-credentials flow is real, but every Workday customer's security team will provision an **ISU** because that's the model they're familiar with and it integrates with their existing security review process. OAuth is sometimes blocked by customer security policy for SaaS-to-Workday integrations. **Use ISU for Phase 1 and Phase 2; revisit OAuth if a specific customer mandates it.**

### What the customer provisions

The customer's Workday admin, before integration goes live:

1. **Create an Integration System User** (`ISU_CLI_Behavioral_Platform` or similar). This is a non-human Workday user.
2. **Create an Integration System Security Group** with permissions on exactly the domains CLI needs: `Worker Data: Public Worker Reports`, `Worker Data: Personal Data`, `Worker Data: Active and Terminated Workers`, `Job Requisition`, `Candidate Data`, `Organizations and Roles`, and write permission on the custom Worker fields defined in `02-data-model-mapping.md`.
3. **Assign the ISU to the ISSG.**
4. **Set the ISU password** (long random string; Workday doesn't support certificate-only auth for ISUs in most tenants).
5. **Enable WWS access** for the ISU. By default Workday's WWS is only enabled for certain user types; the security admin has to flip this for the ISU.
6. **Share the tenant URL and ISU credentials with CLI** through a secure channel (1Password share, Doppler, customer's preferred secret-sharing tool — never email).

This is itemized in the customer onboarding checklist that comes out of `02-data-model-mapping.md`.

### Where credentials live in CLI

`customers.workday_isu_username` (plaintext) and `customers.workday_isu_password_encrypted` (AES-256-GCM, key in env var). On every Workday call, the integration:

1. Loads the customer row by `customer_id`.
2. Decrypts the password using the env-var key.
3. Constructs the SOAP `WS-Security UsernameToken` header (for WWS) or the `Authorization: Basic` header (for REST endpoints that accept basic auth) or the OAuth bearer (if the customer specifically requested OAuth).
4. Issues the call.
5. **Never logs the credential.** Sentry breadcrumb scrubbers must be configured to strip `Authorization` and `password` from any captured request data.

### Token rotation

ISU passwords don't auto-rotate. CLI must support manual rotation: an admin in CLI's dashboard can paste a new ISU password, CLI re-encrypts and stores it, the old value is overwritten (not retained). Sync continues normally with the new credential. **Customer must rotate ISU credentials at least annually** per most enterprise security policies; CLI's admin UI surfaces "last credential update" as a visible warning when it's >365 days old.

## Endpoint inventory — Phase 1 (minimum viable, 6 endpoints)

These are the endpoints needed to close the first enterprise deal. The minimum is: read workers, read open reqs, write back assessment scores.

| Operation | Surface | Workday endpoint | Pattern | Notes |
|---|---|---|---|---|
| Read workers | **WWS / SOAP** | `Get_Workers` | Sync, paged 200/call | Paging via `Response_Filter / Page` and `Count`. Full org-wide read can take 30+ pages for a 10,000-worker customer. Run in a background job. |
| Read positions | **WWS / SOAP** | `Get_Positions` | Sync, paged 200/call | Often comes embedded in `Get_Workers`; separate call only needed for vacant positions. |
| Read open reqs | **REST** | `GET /recruiting/v1/jobRequisitions` | Sync, paged 50/call | REST is cleaner than the WWS `Get_Job_Requisitions` for this and works fine. Use REST. |
| Read organizations | **WWS / SOAP** | `Get_Organizations` | Sync, paged 200/call | Needed for the hierarchy. REST equivalent doesn't return parent-child relationships. |
| Write back ASI score | **WWS / SOAP** | `Put_Worker_Custom_ID` *or* `Update_Worker_Additional_Data` | Sync, one per worker | The exact operation depends on how the customer modeled the custom fields. Most use `Custom_Object_Data`. Async via job queue. |
| Touch "last assessed" | **WWS / SOAP** | Same as score write | Sync, one per worker | Combined with score write where possible to halve the call count. |

**Phase 1 read frequency:** nightly full sync (cron). Phase 1 deliberately does not do delta/incremental syncs; the full-sync simplicity is worth the runtime cost for the first deal.

**Phase 1 write-back frequency:** on-demand, one job per assessment completion event.

## Endpoint inventory — Phase 2 (production, +8 endpoints)

These are the endpoints needed once procurement has signed and we're integrating for real, not just demoing. They add depth that Phase 1 deliberately skipped.

| Operation | Surface | Workday endpoint | Pattern | Notes |
|---|---|---|---|---|
| Read candidates | **REST** | `GET /recruiting/v1/candidates` | Sync, paged 100/call | Per-req candidate pool. Required for ASSET role-fit on the candidate side. |
| Read job applications | **REST** | `GET /recruiting/v1/jobApplications` | Sync, paged 100/call | Links candidates to reqs with status. |
| Read performance ratings | **WWS / SOAP** | `Get_Performance_Reviews` | Sync, paged | For the CHRO dashboard's correlation analysis (high-ASI workers vs perf ratings). |
| Read worker history | **WWS / SOAP** | `Get_Worker_History` | Sync, on-demand | For tenure analysis and termination trend signals. |
| Delta sync (workers changed) | **WWS / SOAP** | `Get_Workers` with `Effective_Date` filter + `Updated_From_Date` | Sync, paged | Replaces nightly full-sync with incremental. Major perf win for large tenants. |
| Webhook receiver (worker created) | n/a | (CLI side) `POST /api/workday/webhook` | Async push | Workday triggers this via Workday Studio integration the customer configures. **Optional** in Phase 2 — most customers won't set it up. |
| Read job descriptions | **WWS / SOAP** | `Get_Job_Profiles` | Sync, paged | For ASSET-from-JD inference (the AI Mentor reads JDs and infers role styles). |
| Bulk score writeback | **WWS / SOAP** | `Put_Workers` (bulk) | Sync, batched 100/call | When CLI has 5,000 new scores to write (initial assessment campaign), the per-worker write-back of Phase 1 becomes too slow. Bulk variant exists but has stricter validation. |

## Paging strategy

Every paged Workday endpoint returns a `Total_Pages` and `Total_Results` in the response envelope. The integration:

1. Issues page 1 with `Count=200` (or REST equivalent, usually `limit=100`).
2. Reads `Total_Pages` from the response.
3. Enqueues a separate job for each remaining page. **Critical:** don't loop pages in a single function — Vercel's 10-second timeout will kill you on tenants with >1,000 workers. Each page is a separate job.
4. The job queue (Inngest) provides backpressure; rate limits don't blow up because we're not fanning out unbounded.

## Rate limit considerations

Workday rate limits are **per-tenant, not per-endpoint, and depend on the customer's subscription level.** Defaults are roughly:

- 30 concurrent integration requests per tenant
- 100 SOAP calls per minute per ISU
- 500 REST calls per minute per ISU

These are not guarantees — Workday reserves the right to throttle harder if they detect abuse. Practical implications:

- A nightly full-sync of 10,000 workers (50 pages × 200) at 100/min puts us at 30 minutes of sync time before scores writeback even starts. **Plan for sync windows of 1-2 hours per large customer.**
- The integration must respect `429 Too Many Requests` responses with exponential backoff. Default backoff: 1s, 2s, 4s, 8s, 16s, then dead-letter.
- **Multi-customer rate limits are not aggregated** at the CLI side. Each customer's ISU has its own rate-limit bucket inside their tenant. CLI does not need a global rate limiter; per-customer is sufficient.

[ASSUMPTION] Specific rate limits should be confirmed with the first customer's Workday admin during deployment. The numbers above are typical but not contractual.

## Error handling

Workday is a SOAP-first system in spirit, and SOAP faults are richer than HTTP status codes. The integration's error-handling layer parses both.

| Condition | HTTP/SOAP | What CLI does |
|---|---|---|
| Auth failure | `401 Unauthorized` or SOAP `wsse:InvalidSecurity` fault | Mark customer's credentials as invalid; alert admin via in-dashboard banner + email; **do not retry**. |
| Insufficient permissions | `403 Forbidden` or SOAP `Authentication_Validation_Error` | Same as 401, with a different alert message ("ISU is missing the X permission"). |
| Rate-limited | `429` or SOAP `Throttling_Error` | Exponential backoff with retry. After 5 attempts, dead-letter the job and alert. |
| Workday tenant down | `5xx` or no response | Retry with backoff. After 3 attempts in 5 minutes, mark the sync as `failed` and resume on next scheduled sync. |
| Malformed request from CLI side | SOAP `Validation_Error` | **This is our bug, not theirs.** Log to Sentry with full request context. Do not retry — retrying a malformed request is wasteful. Alert engineering. |
| Worker not found | SOAP `Worker_Reference_Error` | Mark the writeback row as `skipped` with reason "worker no longer exists in Workday." Continue processing the batch. |
| Custom field missing | SOAP `Custom_Field_Reference_Error` | This means the customer's pre-deployment checklist wasn't completed. Alert customer admin with a specific message ("you need to create the CLI_ASI_Intrinsic custom field on Worker"). Halt writeback for this customer until resolved. |
| Concurrent modification | SOAP `Concurrent_Update_Error` | Retry once with a fresh read. If still conflicting, defer to the next sync window. |

**Sentry-side:** every Workday error gets a tag `workday.endpoint = <name>` and `workday.fault_code = <code>`. This makes the error dashboard sortable by which endpoints fail and which customers are hitting which errors. Critical for the support process.

## What about RaaS (Reports as a Service)?

Workday RaaS lets a customer expose a Workday report as a JSON/XML URL that the integration can fetch directly. It's faster than `Get_Workers` for some use cases because the customer pre-defines the fields they care about and Workday returns just those.

**Phase 2 consideration:** offer RaaS as an alternative-path for the nightly full-sync. If the customer has built reports that already include the fields CLI needs, fetching the report is one HTTP call instead of paged SOAP. This is a per-customer choice and we should support both.

**Auth for RaaS:** the same ISU credentials. The report URL includes the tenant subdomain and is gated by ISU permissions.

## SOAP-vs-REST decision rationale

The brief explicitly cautioned against recommending SOAP-only or REST-only. Here's the honest answer:

- **Use REST** for recruiting endpoints (candidates, requisitions, applications). The REST API is well-designed in this domain and returns cleaner JSON than the equivalent WWS calls.
- **Use WWS (SOAP)** for everything else — workers, organizations, positions, performance, write-back. The REST API coverage of these domains is incomplete, and using REST means writing a fallback to WWS anyway when fields are missing. Just use WWS as the primary.
- **A single client library** abstracts both behind one interface — `workdayClient.getWorkers()` calls WWS under the hood, `workdayClient.getRequisitions()` calls REST under the hood, and the caller doesn't care. This is the right place for the SOAP/REST split: hidden in the library, not surfaced in business logic.

## Open API questions

- [ASSUMPTION] The exact Workday version each customer runs (24R1, 24R2, 25R1) affects which endpoints and fields are available. The endpoints listed here are stable across 24R1+. Versions older than 24R1 may not have all REST endpoints. **Confirm Workday version during sales conversation.**
- Whether to support Workday's Studio integration (the customer building their own integration in Workday Studio that calls CLI's APIs). This is a different architecture (Workday calls us, not us calling Workday) and has its own auth/payload conventions. Defer to `OPEN_QUESTIONS.md`.
- Whether to invest in SCIM 2.0 inbound provisioning (Workday → CLI auto-creates user accounts in CLI when a Workday Worker is created). Phase 3 conversation.
