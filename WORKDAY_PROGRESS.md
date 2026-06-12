# Workday Integration — Live Progress

The autonomous session updates the two machine-readable markers below as it works.
The ntfy notifier reads them and includes them in every notification.

<!-- machine-readable: keep these two lines exactly, update the values -->
PERCENT: 0
ETA: estimating…

## Current step
Kickoff — reading WorkDay/ docs + 00-RELEVANCE-AUDIT.md, starting the doc fixes.

## Plan (checklist the % tracks against)
- [ ] 1. Patch design docs to v2.0.0 reality (Express/droplet, JWT, routes/, no LoginGate) per 00-RELEVANCE-AUDIT.md
- [ ] 2. Add `/api/workday` Express endpoint (JWT-protected) on cli-proxy-server — stop the 404 the WorkdayConnector hits
- [ ] 3. Phase-1 CSV ingestion path: lib/csv + a workers-CSV upload/parse/validate → normalized worker shape
- [ ] 4. Wire WorkdayConnector to the real endpoint; staged/mock data behind it until creds exist
- [ ] 5. Unit/e2e tests for the new route + CSV pipeline; build green
- [ ] 6. Update WorkDay/04-staging-plan.md Phase-0 estimates (foundation partly done) + OPEN_QUESTIONS #18
- [ ] 7. Commit + push to origin/AllRepo; final summary

## Log
- (autonomous session appends dated entries here)
