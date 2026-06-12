# 06 — Multi-HRIS Integration Plan (Workday + SAP SuccessFactors + ADP)

## Core Insight

```
[HRIS API / CSV] → [Adapter: auth + fetch + field mapping] → [Shared: validate + upsert] → [Postgres]
```

Only the adapter changes. Building all three at once saves ~40% vs building them sequentially.

---

## What's shared (build once, ~5–6 weeks)

| Component | Effort |
|---|---|
| Database schema (`workers`, `organizations`, `positions`, `customers`) | Already designed |
| Canonical worker type (TypeScript interface all adapters map into) | 0.5 wk |
| Validation layer | 0.5 wk |
| Upsert engine (`customer_id, external_id` → insert or update) | 1 wk |
| CSV import pipeline with column mapping UI | 1–1.5 wk |
| Admin UI: HRIS picker + import page + status page | 1.5 wk |
| Import audit log | 0.5 wk |

## Adapter interface

```typescript
interface HRISAdapter {
  id: string                           // 'workday' | 'sap' | 'adp'
  name: string
  testConnection(creds): Promise<{ok, error?}>
  fetchWorkers(creds, opts): Promise<CanonicalWorker[]>
  fetchOrganizations(creds, opts): Promise<CanonicalOrg[]>
  fetchPositions(creds, opts): Promise<CanonicalPosition[]>
  mapFields(raw): CanonicalWorker
}
```

## HRIS-specific adapters (2–3 weeks each)

### Side-by-side comparison

| | Workday | SAP SuccessFactors | ADP |
|---|---|---|---|
| **Protocol** | SOAP + REST hybrid | OData v2 | REST/JSON |
| **Auth** | ISU (username/password) | OAuth 2.0 + SAML assertion | OAuth 2.0 + mutual TLS |
| **Worker endpoint** | 1 call gets everything | 3–4 OData entities joined | 1 call gets everything |
| **Org hierarchy** | Single endpoint, parent refs | Multiple entity types, no unified tree | Flat list with parent codes |
| **Identity key** | WID (immutable) | userId (customer-set, risky) | associateOID (immutable) |
| **Biggest pain point** | SOAP/XML parsing | Entity joins + OData v2 limits | Mutual TLS cert management |
| **Market** | Enterprise (5,000+) | Enterprise (global, 10,000+) | Mid-market to enterprise (US-heavy) |

---

## Combined Track A totals

| Approach | Effort | Elapsed |
|---|---|---|
| All three HRIS, 1 engineer | 12–15 eng-weeks | 12–15 weeks |
| All three HRIS, 2–3 engineers | 12–15 eng-weeks | 7–9 weeks |
| vs. building each separately | ~18–24 eng-weeks | — |

**Savings: ~30–40%**

## Recommended sequence

1. Shared core + CSV import (~6 weeks) — works with any HRIS immediately
2. Workday adapter (+2–3 weeks) — design docs already exist
3. SAP + ADP adapters (+2–3 weeks each) — slot into proven interface
4. Defer all Track B until a partner agreement justifies it
