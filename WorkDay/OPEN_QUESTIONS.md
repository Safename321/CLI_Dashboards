# Open Questions

The questions below couldn't be answered from the codebase alone. They need a human to confirm before the design documents become fully actionable.

Some questions block Phase 1 and must be answered before that phase kicks off. Others can wait until Phase 2 or 3. Each is tagged with the latest phase it can wait until.

## Strategic

### 1. Who is the named first customer? **[blocks Phase 1]**
The CSV/SFTP intermediate vs. straight-to-API choice depends entirely on this. A BlackRock-tier customer will require Marketplace listing and full API integration before signing — Phase 1 CSV/SFTP isn't enough. A tier-2 enterprise can pilot on CSV/SFTP and let CLI build Phase 2 in parallel. **Without this answer, the staging plan is hypothetical.**

### 2. What's the budget for SOC 2 + Workday partnership? **[blocks Phase 3]**
- SOC 2 Type I auditor: $15-25K, ~2 months.
- SOC 2 Type II auditor: add $20-40K, 12-month observation window.
- Workday Partner Program: fees not public, but exist; quote needed.
- Pen test (Phase 2 dependency): $10-25K depending on scope.

Total range: ~$50-110K before any revenue from Workday-gated customers.

### 3. Is Workday Extend on the long-term roadmap? **[non-blocking, but shapes Phase 2 architecture]**
If yes, Phase 2 architecture should anticipate Extend's data-model conventions for easier migration. If no, optimize Phase 2 for the web SPA experience without compromise.

### 4. Is CLI willing to do a Workday Co-Innovation engagement? **[non-blocking, but high leverage]**
A customer (BlackRock?) sponsors CLI's integration jointly with Workday. Compresses Phase 2 + Phase 3 timelines significantly. Worth exploring early with the partnership team.

## Customer-side technical

### 5. What Workday version does the first customer run? **[blocks Phase 2]**
Affects which endpoints and fields are available. Endpoints in `03-api-inventory.md` are stable across Workday 24R1+ but some REST endpoints don't exist on older versions.

### 6. One tenant with sub-orgs, or multiple tenants? **[blocks data-model finalization]**
The `02-data-model-mapping.md` schema assumes the BlackRock-as-one-tenant model. If the first customer uses one Workday tenant per subsidiary, we add a `customer_groups` table and adjust the auth flow. 2-line schema change but the discovery happens at first sales conversation.

### 7. Does the customer use Workday Recruiting, or a separate ATS? **[blocks Phase 2 candidate flow]**
If they use Greenhouse, Lever, or Eightfold instead, the candidate-sync flow is its own integration entirely, not Workday. The integration design above assumes Workday Recruiting throughout.

### 8. Does the customer have Workday Studio resources? **[non-blocking, alternative path]**
If yes, the customer can build a "push to CLI" Studio integration on their side. Inverts the direction of inbound sync — they push, we receive — and simplifies CLI's side significantly. Worth offering as an option.

### 9. What data fields are actually required for the first customer's use case? **[blocks Phase 2 scope]**
The full Worker mapping in `02-data-model-mapping.md` is comprehensive, but the first customer may only care about a subset. Optimize the first integration for what they actually need; expand the mapping based on customer #2's gaps.

### 10. Which Workday region is the customer in? **[blocks Phase 2 deployment]**
Affects API endpoint URL (`wd5-impl-services1.workday.com`, `wd102.myworkday.com`, etc.) and may affect data-residency requirements. Some EU customers' tenants are EU-hosted and CLI's database must also be EU-resident for compliance.

## CLI-side

### 11. Who owns this work? **[blocks Phase 0]**
Workday integrations are full-time effort. The team needs a designated engineer (employee or contractor) before Phase 0 starts. Without this, all estimates are meaningless.

### 12. What's the secrets-management long-term plan? **[blocks Phase 3 audit]**
Encrypted column + env-var key (proposed in `01-architecture.md`) is fine for Phase 1-2. Phase 3 audit will ask for a more robust answer: HashiCorp Vault Cloud, AWS Secrets Manager, Doppler, or customer-managed keys (CMK). Pick before audit prep.

### 13. What's the database backup/recovery SLA committed to customers? **[blocks first signed contract]**
Procurement will ask. CLI needs a defined RPO (recovery point objective) and RTO (recovery time objective) — e.g. "RPO ≤ 1 hour, RTO ≤ 4 hours." Vercel Postgres and Neon both support point-in-time recovery; the question is what CLI promises to deliver.

### 14. What's the multi-tenancy isolation strategy? **[blocks Phase 2 architecture]**
The schema in `02-data-model-mapping.md` uses `customer_id` foreign keys on every table. Sufficient for shared-database multi-tenancy, but some procurement teams (BlackRock-tier) will demand database-per-customer or schema-per-customer isolation. Decide which one is the default and which is a per-customer upgrade.

### 15. What's the encryption-at-rest story beyond customer credentials? **[blocks first signed contract]**
Vercel Postgres and Neon both encrypt at rest by default. Some procurement teams will ask whether CLI uses customer-managed keys (so the customer holds the encryption key, not the vendor). If yes, the architecture changes — every read becomes a key-fetch first.

## Workday-partnership

### 16. Has CLI engaged with the Workday partnership team yet? **[high-leverage, non-blocking]**
The Marketplace application takes 1-3 months wall-clock. Starting the conversation before code is built is free leverage — Workday's partner managers have meaningful influence on the application timeline.

### 17. Is CLI's product positioning compatible with Workday's partner taxonomy? **[blocks Marketplace listing]**
Workday categorizes Marketplace listings (Talent Management, HCM Extensions, Recruiting, Learning). The fit with CLI's "behavioral intelligence platform" positioning is probably "Talent Management" but needs confirmation. Affects how the listing markets the product.

## Documentation

### 18. Where do these design documents officially live? **[housekeeping]**
The brief asked for `/docs/workday/` but the current repo has no `/docs/` directory. Confirm the right home — could be:
- A new `/docs/workday/` in the existing dashboard repo
- A new dedicated docs repo
- A Notion/Confluence/internal wiki (and these files become the seed content)

### 19. Who owns these documents long-term? **[housekeeping]**
A design document is only useful if someone keeps it in sync with reality as decisions get made. Identify an owner per phase.

## Questions I would have asked before writing if there had been a chance

These are things I made reasonable assumptions about and proceeded. If any are wrong, the corresponding design choice should be revisited.

| Assumption | Where it lives | If wrong, change |
|---|---|---|
| Use Postgres (not MongoDB / DynamoDB / etc.) | Throughout | The data-model schema would need re-expression |
| Use ISU not OAuth as the default Workday auth | `03-api-inventory.md` | Auth flow + credential storage rewrites |
| Use Inngest for job queueing | `01-architecture.md` | Worker code structure rewrites |
| Use Vercel as the deployment platform throughout | All four docs | Hosting and CI/CD rewrites |
| Use WID as the worker identity key | `02-data-model-mapping.md` | Identity migration; impacts schema |
| CSV/SFTP as Phase 1 bridge | `04-staging-plan.md` | If skipped, Phase 1 effort merges into Phase 2 and timeline doubles |
| BlackRock uses one tenant with sub-orgs | `02-data-model-mapping.md` | Add `customer_groups` table; multi-customer accounting |

If any of these assumptions are explicitly wrong, please flag the corresponding section to revise before implementation begins.
