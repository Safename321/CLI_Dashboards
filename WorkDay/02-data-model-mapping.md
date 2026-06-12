# 02 — Data Model Mapping

## TL;DR

CLI has no database schema today. The data structures that need persisting are currently JavaScript object literals in `App.jsx` and a single static JSON file (`public/data/spgi-data.json`). This document proposes the schema, maps every CLI entity to a corresponding Workday object (or marks it `[INTERNAL]` if it has no Workday home), and itemizes the **customer's pre-deployment checklist** — every Workday-side configuration the customer has to do before integration goes live.

The single most important design decision in this document is the **identity strategy**: every CLI worker record is keyed by the immutable **Workday ID (WID)** of the corresponding Worker object. Not email, not employee number. That decision drives everything else.

## Proposed CLI database schema

The schema below is the minimum needed to support inbound sync, candidate-to-role matching, and writeback. It's intentionally narrow — designed for behavioral assessment, not for being a second HRIS.

```
┌─────────────────────────────────────────────────────────────────────────┐
│ customers                                                               │
│ ─ id (uuid, pk)                                                         │
│ ─ name (text)                          ← e.g. "BlackRock"               │
│ ─ workday_tenant_url (text)            ← e.g. "https://wd5-impl.work…"  │
│ ─ workday_isu_username (text)                                           │
│ ─ workday_isu_password_encrypted (bytea)                                │
│ ─ encryption_iv (bytea)                                                 │
│ ─ saml_idp_metadata_url (text, nullable)                                │
│ ─ created_at, updated_at                                                │
└─────────────────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ organizations                                                           │
│ ─ id (uuid, pk)                                                         │
│ ─ customer_id (uuid, fk)                                                │
│ ─ workday_id (text, indexed, unique within customer)                    │
│ ─ name (text)                          ← "iShares", "Aladdin"           │
│ ─ parent_workday_id (text, nullable)   ← supports BlackRock hierarchy   │
│ ─ org_type (text)                      ← "Company", "Cost_Center", etc │
│ ─ last_synced_at                                                        │
└─────────────────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ workers                                                                 │
│ ─ id (uuid, pk)                                                         │
│ ─ customer_id (uuid, fk)                                                │
│ ─ workday_id (text, indexed, unique within customer)  ← CANONICAL KEY   │
│ ─ workday_employee_id (text)           ← also stored, NOT canonical     │
│ ─ email (text, nullable)               ← may change; not for matching  │
│ ─ legal_name (text)                                                     │
│ ─ preferred_name (text, nullable)                                       │
│ ─ primary_position_workday_id (text)                                    │
│ ─ primary_organization_id (uuid, fk → organizations)                    │
│ ─ manager_workday_id (text, nullable)                                   │
│ ─ status (enum: active, inactive, terminated, on_leave)                 │
│ ─ hire_date (date, nullable)                                            │
│ ─ termination_date (date, nullable)                                     │
│ ─ last_synced_at                                                        │
└─────────────────────────────────────────────────────────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ scores                                                                  │
│ ─ id (uuid, pk)                                                         │
│ ─ worker_id (uuid, fk)                                                  │
│ ─ instrument (enum: ASI, A_ASI, OASI, A_OASI, ASSET, ASSET_T,           │
│                     ASSET_P, ASI_360, A_ASI_360)                        │
│ ─ assessment_date (date)                                                │
│ ─ intrinsic, competitive, power (numeric)        ← Direct set            │
│ ─ personal, social, entrusting (numeric)         ← Instrumental set      │
│ ─ collaborative, contributory, vicarious (numeric) ← Relational set      │
│ ─ source (enum: self_report, rater_360, calculated)                     │
│ ─ writeback_status (enum: pending, completed, failed, skipped)          │
│ ─ writeback_error (text, nullable)                                      │
│ ─ writeback_attempted_at, writeback_completed_at                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ positions   (the role/job, distinct from the person who fills it)       │
│ ─ id (uuid, pk)                                                         │
│ ─ customer_id (uuid, fk)                                                │
│ ─ workday_id (text, indexed)                                            │
│ ─ title (text)                                                          │
│ ─ description (text)                                                    │
│ ─ organization_id (uuid, fk)                                            │
│ ─ filled_by_worker_id (uuid, fk, nullable)                              │
│ ─ status (enum: filled, vacant, frozen)                                 │
│ ─ last_synced_at                                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ requisitions   (open positions being recruited for)                     │
│ ─ id (uuid, pk)                                                         │
│ ─ customer_id (uuid, fk)                                                │
│ ─ workday_id (text, indexed)                                            │
│ ─ position_id (uuid, fk, nullable — some reqs are headcount-only)       │
│ ─ title (text)                                                          │
│ ─ status (enum: open, on_hold, closed, filled, cancelled)               │
│ ─ posted_date, target_fill_date                                         │
│ ─ asset_score_id (uuid, fk → asset_scores, nullable)                    │
│ ─ last_synced_at                                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ asset_scores   (the 9-style behavioral profile for a ROLE, not person)  │
│ ─ id (uuid, pk)                                                         │
│ ─ requisition_id (uuid, fk, nullable)                                   │
│ ─ position_id (uuid, fk, nullable)                                      │
│ ─ source (enum: jd_inference, sme_rated, calibrated)                    │
│ ─ intrinsic, competitive, power, personal, social, entrusting,         │
│   collaborative, contributory, vicarious (numeric)                      │
│ ─ created_at                                                            │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ candidates   (people in the running for a specific req)                 │
│ ─ id (uuid, pk)                                                         │
│ ─ requisition_id (uuid, fk)                                             │
│ ─ workday_id (text, indexed)        ← Workday Candidate or Worker WID   │
│ ─ worker_id (uuid, fk, nullable)    ← if internal candidate             │
│ ─ name, email                                                           │
│ ─ asi_score_id (uuid, fk → scores, nullable)                            │
│ ─ r_squared_fit (numeric, nullable)  ← computed candidate↔asset match   │
│ ─ status (enum: applied, screening, interviewing, offered, hired,       │
│           rejected, withdrew)                                           │
│ ─ last_synced_at                                                        │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ sync_runs   (audit trail for every inbound/outbound sync)               │
│ ─ id (uuid, pk)                                                         │
│ ─ customer_id (uuid, fk)                                                │
│ ─ direction (enum: inbound, outbound)                                   │
│ ─ entity (enum: workers, positions, requisitions, scores, ...)          │
│ ─ status (enum: running, succeeded, failed, partial)                    │
│ ─ records_processed, records_failed (int)                               │
│ ─ started_at, finished_at                                               │
│ ─ error_summary (text, nullable)                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## CLI ↔ Workday object mapping

### `customers` table

Single-source-of-truth for which Workday tenant this customer uses. No direct Workday object — this is CLI metadata only.

### `organizations` table → Workday `Organization`

| CLI field | Workday source |
|---|---|
| `workday_id` | `Organization_Reference / Workday_ID` (WID) |
| `name` | `Organization_Data / Organization_Name` |
| `parent_workday_id` | `Organization_Subtype_Reference / Parent_Organization_Reference / Workday_ID` |
| `org_type` | `Organization_Subtype_Reference / Descriptor` (e.g. "Company", "Cost_Center", "Region", "Supervisory_Org") |

**Workday endpoint:** `Get_Organizations` (WWS, SOAP). REST equivalent is partial — `/organizations` exists but doesn't return the full hierarchy.

### `workers` table → Workday `Worker`

| CLI field | Workday source |
|---|---|
| `workday_id` | `Worker_Reference / Workday_ID` (WID) — **canonical key** |
| `workday_employee_id` | `Worker_Data / Worker_ID` (employee number) — stored, not used for matching |
| `email` | `Worker_Data / Personal_Data / Contact_Data / Email_Address_Data / Email_Address` (work address) |
| `legal_name` | `Worker_Data / Personal_Data / Name_Data / Legal_Name_Data` |
| `preferred_name` | `Worker_Data / Personal_Data / Name_Data / Preferred_Name_Data` |
| `primary_position_workday_id` | `Worker_Data / Employment_Data / Position_Data / Position_Reference / Workday_ID` |
| `primary_organization_id` | resolved from `Worker_Data / Employment_Data / Position_Data / Position_Organizations_Data` |
| `manager_workday_id` | `Worker_Data / Employment_Data / Manager_Reference / Workday_ID` |
| `status` | derived from `Worker_Data / Employment_Data / Worker_Status_Data` |
| `hire_date` | `Worker_Data / Employment_Data / Worker_Status_Data / Hire_Date` |
| `termination_date` | `Worker_Data / Employment_Data / Worker_Status_Data / Termination_Date` |

**Workday endpoint:** `Get_Workers` (WWS, SOAP). REST equivalent (`/workers`) covers ~70% of the fields but loses some position and manager-chain detail.

### `positions` table → Workday `Position`

| CLI field | Workday source |
|---|---|
| `workday_id` | `Position_Reference / Workday_ID` |
| `title` | `Position_Data / Position_Title` |
| `description` | `Position_Data / Job_Description` (often empty in practice) |
| `organization_id` | resolved from `Position_Data / Position_Organizations_Data` |
| `filled_by_worker_id` | reverse lookup: which Worker has this Position as primary |
| `status` | `Position_Data / Availability_Date` + `Closed` flag |

**Workday endpoint:** `Get_Positions` (WWS). Often comes as a side-effect of `Get_Workers` (Position is embedded in Worker_Data).

### `requisitions` table → Workday `Job_Requisition`

| CLI field | Workday source |
|---|---|
| `workday_id` | `Job_Requisition_Reference / Workday_ID` |
| `position_id` | resolved from `Job_Requisition_Data / Position_Reference` |
| `title` | `Job_Requisition_Data / Recruiting_Instruction / Position_Title` |
| `status` | `Job_Requisition_Data / Status_Reference` |
| `posted_date` | `Job_Requisition_Data / Recruiting_Start_Date` |
| `target_fill_date` | `Job_Requisition_Data / Target_Hire_Date` |

**Workday endpoint:** `Get_Job_Requisitions` (WWS) or REST `/recruiting/jobRequisitions`.

### `candidates` table → Workday `Job_Application` / `Candidate`

| CLI field | Workday source |
|---|---|
| `workday_id` | `Candidate_Reference / Workday_ID` |
| `worker_id` | only populated for internal candidates (where Candidate is also a Worker) |
| `name` | `Candidate_Data / Personal_Information_Data / Name_Data` |
| `email` | `Candidate_Data / Contact_Information_Data / Email_Information_Data` |
| `status` | `Job_Application_Data / Job_Application_Status` |

**Workday endpoint:** `Get_Candidates` (WWS) or REST `/recruiting/candidates`. Note: candidate data has stricter privacy constraints in Workday than worker data; ISU permissions must include the candidate domain explicitly.

### `scores` table → Workday Worker custom fields (writeback only)

The `scores` table is CLI-native — there's no Workday object that natively holds an ASI score. What the customer creates on their side is a set of **custom fields on the Worker object** that we write to.

**Customer pre-deployment checklist — required custom fields on `Worker`:**

| CLI custom field name | Workday type | Purpose |
|---|---|---|
| `CLI_ASI_Intrinsic` | Numeric (1 decimal) | Direct-set Intrinsic score |
| `CLI_ASI_Competitive` | Numeric (1 decimal) | Direct-set Competitive score |
| `CLI_ASI_Power` | Numeric (1 decimal) | Direct-set Power score |
| `CLI_ASI_Personal` | Numeric (1 decimal) | Instrumental-set Personal score |
| `CLI_ASI_Social` | Numeric (1 decimal) | Instrumental-set Social score |
| `CLI_ASI_Entrusting` | Numeric (1 decimal) | Instrumental-set Entrusting score |
| `CLI_ASI_Collaborative` | Numeric (1 decimal) | Relational-set Collaborative score |
| `CLI_ASI_Contributory` | Numeric (1 decimal) | Relational-set Contributory score |
| `CLI_ASI_Vicarious` | Numeric (1 decimal) | Relational-set Vicarious score |
| `CLI_ASI_Last_Assessed` | Date | Most recent ASI completion |
| `CLI_360_Available` | Boolean | Whether a 360 result exists |
| `CLI_Best_Fit_Role_ID` | Text | Workday WID of the best-fit role from ASSET matching |

**Customer pre-deployment checklist — required custom field on `Job_Requisition`:**

| CLI custom field name | Workday type | Purpose |
|---|---|---|
| `CLI_ASSET_Score_ID` | Text | Pointer to CLI's `asset_scores.id` UUID for this req |
| `CLI_Top_Candidate_WID` | Text | Workday WID of top-r²-fit candidate |
| `CLI_Top_Candidate_R2` | Numeric (3 decimals) | r² fit score for top candidate |

These are itemized in `CUSTOMER_ONBOARDING_CHECKLIST.md` (Phase 1 deliverable) so the customer's Workday admin has a concrete list of what to create.

## CLI-internal-only fields (no Workday home)

These exist only in CLI's database and are not synced to or from Workday. They're behavioral-assessment metadata that has no analogue in an HRIS.

- `discretionaryEffort`, `psychSafety`, `jobHappiness`, `teamHappiness`, `companyHappiness`, `lifeHappiness` (sentiment indices, currently in App.jsx, would migrate to a `worker_sentiment` table)
- `flightRisk`, `churnRate`, `nps` (currently org-level KPIs in spgi-data.json)
- `asset_scores.source = 'jd_inference'` (CLI-derived from job description text using Anthropic)
- `r_squared_fit` (CLI-computed, doesn't exist in Workday)
- Peace Pad overlays for management challenges (CLI-only behavioral output)
- All AI Mentor conversation history (CLI-only)

These fields are flagged `[INTERNAL]` in the schema and the writeback layer ignores them.

## Multi-entity / matrix-org handling (BlackRock case)

BlackRock has six known subsidiaries: iShares, Aladdin, HPS, GIP, ElmTree, Aperio. In Workday these are represented as sub-organizations under a parent BlackRock org. The hierarchy comes through naturally from the `Organization` mapping above — `parent_workday_id` chains form the tree.

CLI's data model treats BlackRock as a single `customer` row (one Workday tenant, one set of credentials). Each subsidiary is an `organization` row with `parent_workday_id` pointing up the chain. Every worker belongs to one primary organization, and the SPA's tenant-filtering logic can pivot the dashboard by subsidiary because the org tree is in the database.

**Workday detail to be aware of:** some companies model subsidiaries as separate Workday tenants (not sub-organizations within one tenant). If BlackRock does this — different tenants for iShares vs Aladdin — then we need one `customer` row per tenant, with a CLI-side "customer group" abstraction to roll them up. [ASSUMPTION] BlackRock uses one tenant with sub-orgs; this must be confirmed during the first sales conversation.

A row in `customers` can be linked via a nullable `customer_group_id` to support the multi-tenant case if it turns out to be needed:

```
customer_groups
─ id, name ("BlackRock"), created_at

customers
─ ... existing fields ...
─ customer_group_id (uuid, fk, nullable)
```

This is a 2-line schema change to add later, so don't add it pre-emptively. Wait until the first customer needs it.

## Identity strategy — why WID, not email

Three reasons CLI keys workers by Workday ID (WID) and not email:

1. **Email changes.** Marriages, name changes, domain consolidations, departures-and-returns. Email is for display and notifications, never for record-linking.
2. **Employee ID changes too.** Workday lets the customer set their own `Worker_ID` field. When companies migrate HRIS systems, those IDs often get rewritten. Workday's WID is generated by Workday itself and is immutable for the life of the Worker object.
3. **Subsidiary moves.** If a worker moves from iShares to Aladdin inside BlackRock, their WID is preserved (Workday tracks this as a transfer event, not a termination + rehire). Their email might change to a different subdomain. WID is the only stable handle.

When CLI receives a worker via inbound sync, the upsert key is `(customer_id, workday_id)`. If the WID matches an existing row, all other fields update. If no row matches, insert. Email collisions across different WIDs are tolerated.

For workers who switch tenants entirely (e.g. they leave BlackRock and join a different CLI customer), they get a new WID in the new tenant. CLI treats them as a new worker. The old assessment history stays attached to the old WID. We do not attempt cross-customer worker identity.

## Open data-model questions

- [ASSUMPTION] The `scores` table currently assumes one row per (worker, instrument, assessment_date) tuple. If a worker is reassessed multiple times in the same day (rare, but possible during training), do we keep all rows or replace? **Recommend keep all** with a `is_latest` flag the queries filter on.
- Whether to write back the cumulative ASI score (one snapshot per worker) or every historical assessment (multiple Workday writes). Recommend cumulative-latest only — Workday isn't a behavioral assessment history database, and writing every result clutters their Worker view.
- Whether the customer can opt out of writeback entirely (read-only CLI, no Workday write-back) — useful as a sales-conversation lever. Recommend yes: writeback is a per-customer config flag in `customers.writeback_enabled` (default true, can be disabled in admin UI).
- How long to retain candidate records after a hire decision is final. Workday has its own retention rules; CLI should respect the shorter of (CLI's retention policy, customer's stated retention policy). Default: 24 months from `requisitions.last_status_change`, then purge.
