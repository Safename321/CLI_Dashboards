# 07 — Per-Tenant Data Isolation Plan

## Current State

Tenant routing works at the auth layer — email domain maps to tenant ID, embedded in the JWT. But data isolation is **presentation-only**: all tenants see the same data, same database rows, same external API results. The tenant system currently controls branding (company name, accent color, sidebar subtitle) and nothing else.

## What Needs to Change

### Priority 1 — Security (must-fix before production)

#### 1. Add `customer_id` to `scores` table

**File:** `cli-proxy-server/db/schema.js`

**Problem:** The `scores` table only has `worker_id` as a foreign key. To query scores for a tenant, you must join through `workers → customer_id`. A missing or incorrect join leaks scores across tenants.

**Fix:** Add `customer_id` column with a foreign key to `customers.id`. Update the migration:

```sql
ALTER TABLE scores ADD COLUMN customer_id UUID REFERENCES customers(id);
UPDATE scores SET customer_id = (SELECT customer_id FROM workers WHERE workers.id = scores.worker_id);
ALTER TABLE scores ALTER COLUMN customer_id SET NOT NULL;
CREATE INDEX idx_scores_customer ON scores(customer_id);
```

**Affected queries:** All score reads/writes in `cli-proxy-server/lib/importEngine.js` must filter by `customer_id`.

#### 2. Add tenant context to AI mentor chat endpoint

**File:** `cli-proxy-server/routes/chat.js`

**Problem:** The `/api/chat` endpoint accepts a system prompt and messages from the client, forwards to Anthropic, but never extracts `req.session.tenant`. The AI mentor doesn't know which tenant is asking and could leak cross-tenant knowledge if prompted.

**Fix:**
```javascript
router.post('/', chatLimiter, maybeAuth, async (req, res) => {
  const tenant = req.session?.tenant || 'default';
  const { system, messages, model, max_tokens } = req.body;
  // Prepend tenant context to system prompt
  const tenantSystem = `You are assisting the "${tenant}" tenant. Only reference data and context relevant to this tenant.\n\n${system}`;
  const result = await forwardToAnthropic({ apiKey, model, system: tenantSystem, messages, maxTokens });
  res.json({ text: result.text });
});
```

#### 3. Make frontend data files tenant-specific

**File:** `src/data/DataContext.jsx`

**Problem:** All tenants load the hardcoded `data/spgi-data.json`. Zoetis users see S&P Global data.

**Fix:** Change the fetch path to use the tenant ID:
```javascript
// Before:
fetch(assetUrl('data/spgi-data.json'))

// After:
fetch(assetUrl(`data/${tenant.id}-data.json`))
```

Then create per-tenant data files: `public/data/zoetis-data.json`, `public/data/generic-data.json`, etc. For tenants without data, serve an empty scaffold that triggers the `emptyState` banner.

### Priority 2 — Data Integrity

#### 4. Add unique constraints on external IDs

**File:** `cli-proxy-server/db/schema.js`

**Problem:** No unique constraint on `(customer_id, external_id)` for workers, positions, or organizations. Duplicate imports could create duplicate rows instead of upserting.

**Fix:**
```sql
ALTER TABLE workers ADD CONSTRAINT uq_workers_customer_external UNIQUE (customer_id, external_id);
ALTER TABLE positions ADD CONSTRAINT uq_positions_customer_external UNIQUE (customer_id, external_id);
ALTER TABLE organizations ADD CONSTRAINT uq_orgs_customer_external UNIQUE (customer_id, external_id);
```

#### 5. Rate limiting per tenant, not just per IP

**File:** `cli-proxy-server/middleware/rateLimit.js`

**Problem:** Rate limiting is per-IP only. A single IP serving multiple tenants (e.g., corporate proxy) could hit limits that affect all tenants behind it.

**Fix:** Use a composite key `(tenant, IP)` for rate limiting:
```javascript
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => `${req.session?.tenant || 'anon'}:${req.ip}`,
});
```

#### 6. Audit logging with tenant context

**Files:** `cli-proxy-server/routes/workday.js`, `cli-proxy-server/routes/import.js`

**Problem:** No audit trail for data mutations. If tenant A's data gets corrupted, there's no log to trace.

**Fix:** Add an `audit_log` table:
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  action TEXT NOT NULL,     -- 'import_workers', 'upload_csv', 'delete_worker'
  actor_email TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

Log every write operation with `tenant_id` extracted from the JWT.

### Priority 3 — UX Polish

#### 7. Tenant-specific sidebar state

**File:** `src/components/Sidebar.jsx`

**Problem:** Sidebar collapse state uses a single localStorage key (`cli_sidebar_collapsed_state_v1`) shared across all tenants on the same browser.

**Fix:** Include tenant ID in the key:
```javascript
const COLLAPSE_KEY = `cli_sidebar_collapsed_state_v1__${tenantId}`;
```

## Already Isolated (no changes needed)

| Component | Why it's safe |
|-----------|---------------|
| Auth/JWT | Tenant embedded in token at login |
| Workday routes | Filter by `tenantOf(req)` from JWT |
| Import engine | Filters by `customerId` in all DB queries |
| Connector cache (localStorage) | Keys include `tenantId` |
| In-memory workday store | Per-tenant `Map` keyed by tenant ID |
| External APIs (SEC, FRED, BLS, etc.) | Public data, identical for all tenants |
| HRIS adapters | Tenant scoped at route level, not adapter level |
| Session storage | Per-tab, re-validated via `/api/auth/me` |

## Implementation Order

| Phase | Items | Effort | Dependency |
|-------|-------|--------|------------|
| **Phase 1** (before first customer) | #1 scores table, #2 chat tenant, #3 data files | 2-3 days | Database migration |
| **Phase 2** (before multi-tenant) | #4 unique constraints, #5 rate limiting, #6 audit log | 1-2 days | Phase 1 |
| **Phase 3** (polish) | #7 sidebar state | 1 hour | None |

## Files Reference

| Area | File |
|------|------|
| Database schema | `cli-proxy-server/db/schema.js` |
| Database migrations | `cli-proxy-server/db/migrations/` |
| Auth middleware | `cli-proxy-server/middleware/auth.js` |
| Chat route | `cli-proxy-server/routes/chat.js` |
| Rate limiting | `cli-proxy-server/middleware/rateLimit.js` |
| Import engine | `cli-proxy-server/lib/importEngine.js` |
| Workday routes | `cli-proxy-server/routes/workday.js` |
| Frontend data loading | `src/data/DataContext.jsx` |
| Sidebar | `src/components/Sidebar.jsx` |
| Tenant config | `src/config/tenants.js` |
| Credential mapping | `cli-proxy-server/config/credentials.js` |
