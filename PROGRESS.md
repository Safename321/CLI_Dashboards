# CLI Dashboards — Rewrite Progress Log

Running log per REWRITE_BRIEF.md §"OPERATING MODE". Newest entries appended at the bottom of each section. Timestamps are UTC.

## Model selection (§0)
- **2026-06-11** — Engagement running under **Claude Opus 4.8 (1M context)** (`claude-opus-4-8[1m]`).
  - Per §0 fallback order Fable 5 → Opus 4.8 → best remaining: Fable 5 is **not selectable in this session**, so Opus 4.8 (the next most capable) is used. This satisfies the directive "use the most capable model available." Not stopping over model choice per the autonomous override.

## Milestones (ntfy)
- [ ] 25% — primitives + data layer + connector base/registry; app boots
- [ ] 50% — ~half of dashboards reimplemented with parity, tests green
- [ ] 75% — all dashboards + mentor + proxy + server auth + rate limiting
- [ ] 100% — all §8 acceptance criteria met, pushed

## Log

### 2026-06-11 — Step 0: Discovery & planning
- Confirmed fresh start: no `src/`, no prior progress files in repo root.
- Read v1.24L spec: `App.jsx` (10,374 lines, monolith), `LoginGate.jsx`, full `src/connectors/` (BaseConnector, ConnectorRegistry, 11 domain connector files + index), `cli-proxy-server/api/` (chat, sec proxies), `tests/dashboards.spec.js`, configs.
- Inventoried the authoritative dashboard switch (`renderDashboard`, App.jsx:10263): 25 dashboard components + `overview`/`further-reading` views. Written to PARITY_CHECKLIST.md.
- Confirmed the four security gaps named in §3 are present in the source:
  - **§3.1/§3.2** `LoginGate.jsx`: client-side `crypto.subtle` SHA-256 gate with embedded `PASSWORD_HASH` constant + shared password baked into the bundle. Breaks on non-secure origins; ships a credential.
  - **§3.6** `chat.js`: when `CLI_PROXY_TOKEN` is unset the endpoint runs **open** (soft warning only) — must fail closed.
  - **§3.7** `chat.js`: `Access-Control-Allow-Origin: '*'` wildcard on the chat endpoint — must be allow-listed.
  - **§3.8** No rate limiting anywhere.
- Wrote ARCHITECTURE.md (target module layout + shared-component set) and this log.
- **Next:** scaffold the new Vite project (package.json, configs, entrypoint), then build shared primitives + data layer + connector base/registry toward the 25% milestone.
