# 06 — Multi-HRIS Integration Plan (Workday + SAP SuccessFactors + ADP)

## Core Insight

The import pipeline is the same shape for every HRIS:

```
[HRIS API / CSV] → [Adapter: auth + fetch + field mapping] → [Shared: validate + upsert] → [Postgres]
```

Only the adapter changes. The database schema, validation, upsert logic, admin UI, CSV import, and dashboard are 100% shared. Building all three at once saves ~40% vs building them sequentially, because the shared core is the majority of the work.

---

## What's shared (build once)

| Component | Description | Effort |
|---|---|---|
| Database schema | `workers`, `organizations`, `positions`, `customers` tables — identical regardless of HRIS source | Already designed |
| Canonical worker shape | A TypeScript/JS type that all adapters map into: `{ externalId, email, legalName, preferredName, position, org, manager, status, hireDate, ... }` | 0.5 wk |
| Validation layer | Schema validation on the canonical shape before DB upsert (reject malformed rows, log warnings for missing optional fields) | 0.5 wk |
| Upsert engine | `(customer_id, external_id)` → insert or update. Handles deduplication, conflict resolution, soft deletes for workers no longer in source | 1 wk |
| CSV import pipeline | Upload → parse → map columns to canonical shape → validate → upsert. Column mapping UI lets customer match their export columns to CLI fields | 1–1.5 wk |
| Admin UI: import page | "Choose your HRIS" → shows the right connection flow (CSV, or API credentials for Workday/SAP/ADP) | 1 wk |
| Admin UI: import status | "Imported 5,247 workers, 3 warnings, 0 errors" — same regardless of source | 0.5 wk |
| Import audit log | Which HRIS, when, how many records, any errors — shared table | 0.5 wk |
| **Shared total** | | **~5–6 wk** |

## What's HRIS-specific (one adapter each)

### Adapter interface

Every adapter implements the same contract:

```typescript
interface HRISAdapter {
  id: string                           // 'workday' | 'sap' | 'adp'
  name: string                         // Display name
  testConnection(creds): Promise<{ok, error?}>
  fetchWorkers(creds, opts): Promise<CanonicalWorker[]>
  fetchOrganizations(creds, opts): Promise<CanonicalOrg[]>
  fetchPositions(creds, opts): Promise<CanonicalPosition[]>
  mapFields(raw): CanonicalWorker      // HRIS-specific → canonical
}
```

### Workday adapter

| Aspect | Detail |
|---|---|
| **Auth** | ISU (username + password) → WS-Security header (SOAP) or Basic Auth (REST) |
| **Worker fetch** | `Get_Workers` (WWS/SOAP), paged 200/call |
| **Org fetch** | `Get_Organizations` (WWS/SOAP) — REST doesn't return hierarchy |
| **Position fetch** | `Get_Positions` (WWS/SOAP) or embedded in Get_Workers |
| **Identity key** | Workday ID (WID) — immutable |
| **Quirks** | SOAP envelope construction, WS-Security headers, XML parsing, paging via `Response_Filter`. Most complex adapter. |
| **Effort** | 2–3 wk |

### SAP SuccessFactors adapter

| Aspect | Detail |
|---|---|
| **Auth** | OAuth 2.0 with SAML bearer assertion (X.509 cert + API key), or Basic Auth on older tenants. OAuth is the modern default. |
| **Worker fetch** | OData v2: `GET /odata/v2/PerPersonal`, `PerEmail`, `EmpEmployment`, `EmpJob`. SuccessFactors splits worker data across multiple OData entities that must be joined client-side via `$expand` or sequential calls. |
| **Org fetch** | `GET /odata/v2/FOCompany`, `FODivision`, `FODepartment`, `FOBusinessUnit`. Each org type is a separate entity — no unified hierarchy endpoint. |
| **Position fetch** | `GET /odata/v2/Position` with `$expand=parentPosition` |
| **Identity key** | `userId` (string, set by customer — equivalent to employee ID, not guaranteed immutable). Some customers use `personIdExternal` instead. **Must confirm with customer which is stable.** |
| **Quirks** | OData v2 (not v4) — `$filter` syntax is limited, `$expand` depth is capped at 1 level, date-effective queries use `asOfDate` parameter. Pagination via `$top/$skip` (not cursor-based — can miss records on large sets). Some fields require `PerPersonal` + `PerEmail` join. API rate limit: typically 200 req/min per company, stricter than Workday. |
| **Effort** | 2–3 wk |

### ADP adapter

| Aspect | Detail |
|---|---|
| **Auth** | OAuth 2.0 client credentials (client ID + client secret + SSL client certificate). ADP requires mutual TLS — CLI must present a client cert on every API call. This is the most complex auth of the three. |
| **Worker fetch** | `GET /hr/v2/workers` (REST/JSON). Clean API, well-documented. Paginated via `$top/$skip` with a `Content-Type: application/json` response. |
| **Org fetch** | `GET /core/v1/organization-departments`. Flat list — hierarchy derived from `parentOrgCode`. |
| **Position fetch** | Embedded in worker response under `workAssignments[].positionTitle` — no separate positions endpoint in most ADP products. |
| **Identity key** | `associateOID` (ADP-assigned, immutable) — closest equivalent to Workday's WID. Best of the three for identity stability. |
| **Quirks** | Mutual TLS is the big one — need to generate and register a client certificate with ADP. ADP has multiple products (Workforce Now, Vantage, Next Gen) with **different API surfaces**. Workforce Now (mid-market) is the most common; Vantage (enterprise) has richer APIs but different endpoints. Must know which product the customer uses. Rate limits vary by product tier. |
| **Effort** | 2–3 wk |

---

## Side-by-side comparison

| | Workday | SAP SuccessFactors | ADP |
|---|---|---|---|
| **Protocol** | SOAP + REST hybrid | OData v2 (REST-ish) | REST/JSON |
| **Auth** | ISU (username/password) | OAuth 2.0 + SAML assertion | OAuth 2.0 + mutual TLS |
| **Data format** | XML (SOAP), JSON (REST) | JSON (OData) | JSON |
| **Pagination** | Page number in envelope | `$top/$skip` | `$top/$skip` |
| **Worker endpoint** | 1 call gets everything | 3–4 OData entities joined | 1 call gets everything |
| **Org hierarchy** | Single endpoint, parent refs | Multiple entity types, no unified tree | Flat list with parent codes |
| **Identity key** | WID (immutable) | userId (customer-set, risky) | associateOID (immutable) |
| **Biggest pain point** | SOAP/XML parsing | Entity joins + OData v2 limits | Mutual TLS cert management |
| **Market** | Enterprise (5,000+ employees) | Enterprise (global, 10,000+) | Mid-market to enterprise (US-heavy) |

---

## Combined Track A plan (all three HRIS at once)

### Phase A0 — Shared Foundation (4–6 weeks)

Same as the existing Phase A0, plus the shared adapter infrastructure:

| Deliverable | Weeks |
|---|---|
| Postgres + migrations | 1 |
| Per-user auth (SSO + password) | 1–2 |
| Migrate hardcoded data to DB | 1–2 |
| Canonical worker type + validation + upsert engine | 1 |
| Adapter interface definition | 0.5 |

### Phase A1 — CSV Import, HRIS-agnostic (1.5–2 weeks)

| Deliverable | Weeks |
|---|---|
| CSV upload UI with column mapping | 1 |
| CSV → canonical shape → validate → upsert | 0.5 |
| Import summary/status page | 0.5 |

This works for **all three** HRIS plus any other system that can export CSV.

### Phase A2 — API Adapters (5–7 weeks, parallelizable)

Build all three adapters in parallel if you have multiple engineers, or sequentially if one engineer.

| Deliverable | Weeks |
|---|---|
| Workday adapter (SOAP client, field mapper, paging) | 2–3 |
| SAP SuccessFactors adapter (OData client, entity joins, field mapper) | 2–3 |
| ADP adapter (OAuth + mTLS client, field mapper) | 2–3 |
| "Connect your HRIS" UI (pick provider → show right credential form) | 0.5 |
| Shared: one-time import job runner (calls adapter.fetchWorkers → upsert) | 0.5 |

**If parallelized across 2–3 engineers:** 3–4 weeks elapsed.
**If one engineer sequentially:** 7–9 weeks elapsed.

### Combined Track A total

| Approach | Effort | Elapsed |
|---|---|---|
| All three HRIS, 1 engineer | 12–15 eng-weeks | 12–15 weeks |
| All three HRIS, 2–3 engineers | 12–15 eng-weeks | 7–9 weeks |
| vs. building each HRIS separately | ~18–24 eng-weeks | — |

**Savings from building together: ~30–40%**, because the shared core (5–6 weeks) is built once instead of three times.

---

## What this means for Track B

If Track B (deep integration) is ever activated, each HRIS gets its own Track B roadmap because the deep features diverge:

- **Workday Track B:** SOAP writeback, Marketplace listing, possibly Extend
- **SAP Track B:** OData writeback, SAP BTP (Business Technology Platform) app, SAP Store listing
- **ADP Track B:** ADP Marketplace listing, webhook subscriptions for real-time events

There is less overlap in Track B than Track A. The writeback payloads, partner programs, and marketplace requirements are completely different per HRIS. **This is another reason to invest in Track A's shared core now** — it pays dividends regardless of which Track B you activate later.

---

## Recommended approach

1. **Build the shared core + CSV import first** (Phase A0 + A1, ~6 weeks). This works with all HRIS immediately.
2. **Build the Workday adapter first** (Phase A2, +2–3 weeks). It's the most requested and the design docs already exist.
3. **Add SAP and ADP adapters** (+2–3 weeks each). The adapter interface is proven by Workday; these slot in cleanly.
4. **Defer all Track B work** until a partner agreement justifies it — and when you do, pick the HRIS that the partner agreement covers.
