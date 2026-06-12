# Workday Integration — Live Progress

The autonomous session updates the two machine-readable markers below as it works.
The ntfy notifier reads them and includes them in every notification.

<!-- machine-readable: keep these two lines exactly, update the values -->
PERCENT: 85
ETA: 2026-06-12 04:00 UTC

## Current step
Implementation done and green (51/51 unit tests, vite build, live smoke test under /CLI_Dashboards/). Committing + pushing, then final summary.

## Plan (checklist the % tracks against)
- [x] 1. Patch design docs to v2.0.0 reality (Express/droplet, JWT, routes/, no LoginGate) per 00-RELEVANCE-AUDIT.md
- [x] 2. Add `/api/workday` Express endpoint (JWT-protected) on cli-proxy-server — stop the 404 the WorkdayConnector hits
- [x] 3. Phase-1 CSV ingestion path: lib/csv + a workers-CSV upload/parse/validate → normalized worker shape
- [x] 4. Wire WorkdayConnector to the real endpoint; staged/mock data behind it until creds exist
- [x] 5. Unit/e2e tests for the new route + CSV pipeline; build green
- [x] 6. Update WorkDay/04-staging-plan.md Phase-0 estimates (foundation partly done) + OPEN_QUESTIONS #18
- [ ] 7. Commit + push to origin/AllRepo; final summary

## Log
- 2026-06-12 03:18 UTC — Kickoff. Read WORKDAY_IMPL_BRIEF, 00-RELEVANCE-AUDIT, all WorkDay/ docs, and the v2.0.0 server + connector code. Plan: doc patches → /api/workday route + CSV lib → connector wiring → tests → push.
- 2026-06-12 03:22 UTC — Items 1+6 done. Rewrote 01-architecture.md to Express/droplet/JWT reality (routes/workday.js + lib/ tree, BullMQ/pg-boss over Inngest); 04-staging-plan.md Phase-0 now 5–8 wks remaining with per-deliverable status; CODEBASE_FILES_READ.md got a stale banner + v2.0.0 equivalents table; OPEN_QUESTIONS #18 answered (docs live in WorkDay/), assumptions table annotated; README reader's note rewritten. Committed + pushed (0e3a3d4).
- 2026-06-12 03:28 UTC — Items 2–5 done. New: cli-proxy-server/lib/workersCsv.js (RFC-4180 parse + schema validation → normalized worker shape, WID-keyed), lib/workdayStore.js (in-memory per-tenant store, staged fallback labelled source:'staged', HRIS summary derivation), routes/workday.js (JWT-gated GET /, /workers, /status + POST /workers/csv) mounted in server.js. WorkdayConnector reworked: session JWT via getAuthToken, staged/CSV pass-through, customer-creds (requiresOAuth) gate; registered in buildRegistry when a session exists (RegistryContext supplies a token ref). 25 new unit tests (workers-csv, workday-route incl. fails-closed auth + tenant isolation, workday-connector); npm test 51/51, vite build green, live smoke under /CLI_Dashboards/ (health 2.0.0e, /api/workday 401 w/o JWT). buildLetter d→e.
