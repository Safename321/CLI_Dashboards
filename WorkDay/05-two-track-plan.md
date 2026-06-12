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

| Deliverable | Weeks | Notes |
|---|---|---|
| Postgres database (Neon) with migration tooling | 1 | Same as original Phase 0 |
| Migrate hardcoded data in App.jsx into DB-backed API endpoints | 1–2 | Same as original Phase 0 |
| Per-user auth (SSO + email/password fallback) | 1–2 | Procurement won't accept shared password |
| **NOT included:** job queue, observability stack, credential encryption, writeback infrastructure | — | Deferred to Track B |

### Phase A1 — CSV Import (1–2 engineer-weeks)

| Deliverable | Weeks |
|---|---|
| Admin UI: "Upload Workers CSV" page with drag-and-drop | 0.5 |
| CSV parser + schema validator (flexible column mapping) | 0.5 |
| Worker upsert pipeline: CSV → parse → validate → upsert | 0.5 |
| Org/position import from CSV (optional second upload) | 0.5 |

### Phase A2 — One-Click Workday Import (2–3 engineer-weeks, optional)

| Deliverable | Weeks |
|---|---|
| "Connect Workday" page: enter tenant URL + ISU credentials | 0.5 |
| Workday SOAP client (Get_Workers, Get_Organizations, Get_Positions) | 1 |
| One-time import job | 0.5 |
| Import summary page | 0.5 |

### Track A total: 6–10 engineer-weeks

### What Track A excludes

Nightly sync, score writeback, Workday custom fields, job queue, sync audit table, webhook endpoint, candidate/requisition import, SFTP, observability stack — all deferred to Track B.

---

## Track B: Deep Integration (post-partner agreement)

### Trigger

A signed development partner agreement.

### What Track B adds on top of Track A

| Phase | What | Weeks |
|---|---|---|
| B0 — Infrastructure upgrade | Job queue, observability, credential encryption | 3–4 |
| B1 — Scheduled inbound sync | Nightly cron, delta sync, sync status dashboard | 2–3 |
| B2 — Score writeback | Outbound pipeline, writeback tracking, custom fields | 3–4 |
| B3 — Full recruiting pipeline | Candidate import, requisition sync, ASSET matching | 2–3 |
| B4 — Marketplace readiness | SOC 2, Workday Partner Program, audit log UI | 4–8 + months |
| B5 — Workday Extend (optional) | Native in-tenant app | 12+ |

### Track B total: 24–34+ engineer-weeks (on top of Track A)

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

1. **Now:** Start Phase A0 + A1 (foundation + CSV import).
2. **Parallel (if customer wants API import):** Build Phase A2.
3. **After partner agreement signed:** Begin Track B incrementally.
4. **Do not start Track B without:** (a) a signed agreement, (b) a designated full-time engineer, (c) answers to at least questions #1, #5, #6, #11 from OPEN_QUESTIONS.md.

## HRIS-agnostic bonus of Track A

CSV import works with **any HRIS** — BambooHR, Rippling, UKG, SAP SuccessFactors, or a plain spreadsheet.
