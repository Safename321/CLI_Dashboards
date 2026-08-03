# 05 — Two-Track Delivery Plan

## Overview

Two independent tracks that share Phase 0 (foundation) but diverge on integration depth.

| | Track A: Import & Go | Track B: Deep Integration |
|---|---|---|
| **Model** | One-time (or on-demand) data import; CLI operates independently | Bidirectional sync, writeback, continuous coupling |
| **Trigger** | Now | After a signed development partner agreement |
| **Dependency on Workday at runtime** | None after import | Ongoing |
| **Scope** | Inbound-only, no writeback, no scheduled sync | Full scope from original design docs (01–04) |

---

## Track A: Import & Go (near-term)

### Philosophy

Pull worker/org/role data from Workday **once** (or on-demand when the customer clicks "Import"). After that, CLI is a standalone product. No nightly sync, no writeback, no Workday credentials stored long-term.

### Phase A0 — Minimal Foundation (3–5 engineer-weeks)

A stripped-down version of the original Phase 0. Only build what's needed to receive and store imported data.

| Deliverable | Weeks | Notes |
|---|---|---|
| Postgres database (Neon) with migration tooling | 1 | Same as original Phase 0 |
| Migrate hardcoded data in App.jsx into DB-backed API endpoints | 1–2 | Same as original Phase 0 |
| Per-user auth (SSO + email/password fallback) | 1–2 | Same — procurement won't accept shared password |
| **NOT included:** job queue, observability stack, credential encryption, writeback infrastructure | — | Deferred to Track B |

**Success criteria:** a customer can log in via SSO, see their dashboard backed by Postgres, and the system has no dependency on Workday.

### Phase A1 — CSV Import (1–2 engineer-weeks)

The simplest possible integration: the customer exports data from Workday (or any HRIS) and uploads it.

| Deliverable | Weeks | Notes |
|---|---|---|
| Admin UI: "Upload Workers CSV" page with drag-and-drop | 0.5 | |
| CSV parser + schema validator (flexible column mapping) | 0.5 | Accept Workday exports, BambooHR exports, generic CSV |
| Worker upsert pipeline: CSV → parse → validate → upsert into `workers` table | 0.5 | Key on email or employee ID (customer's choice) |
| Org/position import from CSV (optional second upload) | 0.5 | |

**Success criteria:** customer exports a Workday report to CSV, uploads it, dashboard populates within minutes. No Workday API credentials needed. No Workday dependency thereafter.

### Phase A2 — One-Click Workday Import (2–3 engineer-weeks, optional)

For customers who want a cleaner import than CSV but still no ongoing sync.

| Deliverable | Weeks | Notes |
|---|---|---|
| "Connect Workday" page: enter tenant URL + ISU credentials | 0.5 | Credentials used for import only, then discarded or optionally retained |
| Workday SOAP client (Get_Workers, Get_Organizations, Get_Positions) | 1 | Read-only, no writeback |
| One-time import job: pull all workers + orgs + positions in one batch | 0.5 | Runs once, shows progress bar, done |
| Import summary page: "Imported 5,247 workers, 312 positions, 24 orgs" | 0.5 | |
| **NOT included:** scheduled sync, writeback, delta sync, candidate/requisition import | — | Track B only |

**Success criteria:** customer enters Workday credentials, clicks "Import Now," waits 10–30 minutes, dashboard is fully populated. Credentials can be deleted afterward. CLI operates independently from that point forward.

### Track A total: 6–10 engineer-weeks

**What the customer gets:** a working CLI dashboard populated with their real Workday data, operating independently, with no ongoing Workday dependency. Data can be refreshed on-demand by re-importing (CSV or API).

### What Track A deliberately excludes

| Excluded | Why |
|---|---|
| Nightly/scheduled sync | Contradicts autonomy |
| Score writeback to Workday | Contradicts autonomy |
| Workday custom field setup | Only needed for writeback |
| Job queue (Inngest) | One-time import doesn't need async infrastructure |
| sync_runs audit table | No ongoing sync to audit |
| writeback_status columns on scores | No writeback |
| Webhook endpoint | No ongoing coupling |
| Candidate/requisition import | Not needed for core dashboard (add if customer asks) |
| SFTP infrastructure | CSV upload is simpler |
| Observability stack (Sentry/Axiom) | Can add later; not critical for import-only |

---

## Track B: Deep Integration (post-partner agreement)

### Trigger

A signed development partner agreement (e.g., Workday Co-Innovation, or a paying customer who contractually requires bidirectional sync and Marketplace listing).

### What Track B adds on top of Track A

Track B assumes Track A is already live. It extends, not replaces.

| Phase | What | Weeks | From original docs |
|---|---|---|---|
| B0 — Infrastructure upgrade | Job queue (Inngest), observability (Sentry + Axiom), credential encryption (AES-256-GCM) | 3–4 | Original Phase 0 remainders |
| B1 — Scheduled inbound sync | Nightly cron, delta sync, sync status dashboard, sync_runs audit table | 2–3 | Original Phase 2 partial |
| B2 — Score writeback | Outbound pipeline, writeback status tracking, customer custom-field setup checklist | 3–4 | Original Phase 2 partial |
| B3 — Full recruiting pipeline | Candidate import, requisition sync, ASSET role-fit matching against live reqs | 2–3 | Original Phase 2 partial |
| B4 — Marketplace readiness | SOC 2, Workday Partner Program application, audit log UI, security docs | 4–8 + months | Original Phase 3 |
| B5 — Workday Extend (optional) | Native in-tenant app | 12+ | Original Phase 4 |

### Track B total: 24–34+ engineer-weeks (on top of Track A)

### Open questions that block Track B (not Track A)

All 19 items in `OPEN_QUESTIONS.md` are Track B concerns. Track A can proceed with zero open questions resolved — it just needs a customer with Workday data to import.

---

## Decision framework

```
                         Do you have a partner agreement?
                                    │
                         No ────────┴──────── Yes
                         │                      │
                    Track A                Track A + B
                  (import & go)        (import now, deep later)
                         │                      │
              ┌──────────┴──────────┐           │
              │                     │           │
         Customer has          Customer has     │
         Workday API access?   CSV export?      │
              │                     │           │
         Phase A2              Phase A1         │
         (one-click import)    (CSV upload)     │
                                                │
                                    Activate Track B phases
                                    incrementally as needed
```

## Recommended sequencing

1. **Now:** Start Phase A0 + A1 (foundation + CSV import). Ship in 4–6 weeks.
2. **Parallel (if customer wants API import):** Build Phase A2. Adds 2–3 weeks.
3. **After partner agreement signed:** Begin Track B phases incrementally, starting with B0.
4. **Do not start Track B without:** (a) a signed agreement, (b) a designated full-time engineer, (c) answers to at least questions #1, #5, #6, #11 from OPEN_QUESTIONS.md.

---

## HRIS-agnostic bonus of Track A

Because Track A's CSV import doesn't require Workday-specific API code, it works with **any HRIS** — BambooHR, Rippling, UKG, SAP SuccessFactors, or a plain spreadsheet. This widens the addressable market immediately while Track B narrows to Workday-specific depth when the partnership justifies it.
