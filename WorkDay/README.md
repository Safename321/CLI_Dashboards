# CLI ↔ Workday Integration Design

This directory holds the design documents that precede any Workday integration code for the CLI Dashboards product. They were produced from a fresh read of the v1.24L codebase and should be treated as the starting point for a future Claude Code (or human) implementation session.

**Last updated:** June 12, 2026 (relevance pass against v2.0.0; originally written June 9, 2026 from v1.24L)
**Source codebase:** originally `cli-dashboard-v1.24L`; revised against `CLI_Dashboards` v2.0.0 (branch `AllRepo`)

## What's here

| File | Purpose |
|---|---|
| `00-RELEVANCE-AUDIT.md` | **Read first.** What in these docs survived the v1.24L → v2.0.0 rewrite, item by item. |
| `01-architecture.md` | Where the integration lives, what runs it, how it's monitored, the two primary data flows. |
| `02-data-model-mapping.md` | The CLI ↔ Workday object mapping. The single most important document — read it before anything else. |
| `03-api-inventory.md` | Every Workday endpoint we need, SOAP vs REST, auth, rate limits, error handling. Phased by minimum-viable vs deeper integration. |
| `04-staging-plan.md` | Phase 0 through Phase 4, with engineer-week estimates and the open-questions section. |
| `CODEBASE_FILES_READ.md` | The actual files inspected to produce these docs. For future revisions. |
| `OPEN_QUESTIONS.md` | What we couldn't answer from the code alone and need a human (founder, prospect, Workday partner team) to confirm. |

## Reader's note

*(Rewritten 2026-06-12 — the original note described v1.24L, which no longer exists.)*

When these docs were first written, the product was a static React SPA with a thin Vercel-serverless proxy, no server-side persistence, no user accounts, and a shared client-side password. **The v2.0.0 ground-up rewrite changed that:** there is now a real Express backend (`cli-proxy-server/server.js`) on a DigitalOcean droplet, with server-side bcrypt + JWT authentication, per-tenant accounts, CORS allow-listing, and rate limiting. The SPA is served by the same Express app under the `/CLI_Dashboards/` base path.

What still does **not** exist: a database (data is file-based JSON), SAML/OIDC SSO, a job queue, per-customer encrypted credential storage, and observability. So **Phase 0 of the Workday integration is no longer "build the foundation from scratch" — roughly 30–40% of it is done** (see `00-RELEVANCE-AUDIT.md`). The remaining Phase-0 work — DB + migrations, SSO, credential encryption, queue, observability — still has to exist before a production Workday API call is made. The phased plan in `04-staging-plan.md` reflects the revised estimates.

A CSV/SFTP "Phase 1" path is included specifically because it lets CLI close the first enterprise deal **before** committing to the full backend build. That phasing decision is the most consequential one in the staging plan and is worth reading carefully.

## How to use these documents

1. Read this README, then `02-data-model-mapping.md`, then `04-staging-plan.md`. Those three are the strategy. The other two (`01-architecture.md`, `03-api-inventory.md`) are the implementation reference.
2. Resolve every item in `OPEN_QUESTIONS.md` before kicking off Phase 2 implementation. Phase 0 and Phase 1 can proceed with reasonable assumptions; Phase 2 cannot.
3. The next step after these documents is a Claude Code session that consumes them and produces actual implementation code. Keep these as the authoritative input.

Every `[ASSUMPTION]` tag in these documents marks a place where I inferred something the code didn't tell me definitively. Treat assumptions as questions, not as facts.
