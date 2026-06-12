# CLI ↔ Workday Integration Design

This directory holds the design documents that precede any Workday integration code for the CLI Dashboards product. They were produced from a fresh read of the v1.24L codebase and should be treated as the starting point for a future Claude Code (or human) implementation session.

**Last updated:** June 9, 2026 · 5:59 PM ET
**Source codebase:** `cli-dashboard-v1.24L` (package.json `1.24.12-L`)

## What's here

| File | Purpose |
|---|---|
| `01-architecture.md` | Where the integration lives, what runs it, how it's monitored, the two primary data flows. |
| `02-data-model-mapping.md` | The CLI ↔ Workday object mapping. The single most important document — read it before anything else. |
| `03-api-inventory.md` | Every Workday endpoint we need, SOAP vs REST, auth, rate limits, error handling. Phased by minimum-viable vs deeper integration. |
| `04-staging-plan.md` | Phase 0 through Phase 4, with engineer-week estimates and the open-questions section. |
| `CODEBASE_FILES_READ.md` | The actual files inspected to produce these docs. For future revisions. |
| `OPEN_QUESTIONS.md` | What we couldn't answer from the code alone and need a human (founder, prospect, Workday partner team) to confirm. |

## Reader's note

The brief for this work assumed CLI had a conventional backend (database, ORM, OAuth, background workers, observability stack). **It does not.** The product today is a static React SPA built with Vite, deployed to Vercel as static files, with a thin Vercel-serverless proxy (`cli-proxy.vercel.app`) for outbound calls to external APIs. There is no server-side persistence, no authenticated user accounts, no background-job infrastructure. Auth is a single shared password hashed client-side in `LoginGate.jsx`.

This is not a flaw — for a pre-revenue demo platform it's the right architecture. But it means **Phase 0 of any Workday integration is not "configure OAuth" — it is "build the foundation."** A real backend service, a real database, real per-user authentication, and a real secrets-management approach all have to exist before a single Workday API call gets made in production. The phased plan in `04-staging-plan.md` accounts for that.

A CSV/SFTP "Phase 1" path is included specifically because it lets CLI close the first enterprise deal **before** committing to the full backend build. That phasing decision is the most consequential one in the staging plan and is worth reading carefully.

## How to use these documents

1. Read this README, then `02-data-model-mapping.md`, then `04-staging-plan.md`. Those three are the strategy. The other two (`01-architecture.md`, `03-api-inventory.md`) are the implementation reference.
2. Resolve every item in `OPEN_QUESTIONS.md` before kicking off Phase 2 implementation. Phase 0 and Phase 1 can proceed with reasonable assumptions; Phase 2 cannot.
3. The next step after these documents is a Claude Code session that consumes them and produces actual implementation code. Keep these as the authoritative input.

Every `[ASSUMPTION]` tag in these documents marks a place where I inferred something the code didn't tell me definitively. Treat assumptions as questions, not as facts.
