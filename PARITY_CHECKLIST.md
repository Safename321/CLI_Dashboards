# Feature-Parity Checklist — v1.24L → clean rewrite

Authoritative source: the `renderDashboard` switch at `App.jsx:10263` plus the sidebar nav (`App.jsx:1786`, `:2566`). Each item must render with behavioral parity (expected content, charts, interactions) and be covered by a smoke test (§6). Checked when reimplemented + asserted in a test.

## Dashboards (25 components + 2 info views)

| # | View id | Component | Notes / key behavior to reproduce |
|---|---------|-----------|-----------------------------------|
| 1 | `overview` | OverviewDashboard | Landing summary; tenant-aware hero, headline metrics, nav into others |
| 2 | `ceo-advisory` | CEOAdvisoryDashboard | Exec summary, alerts, metric drill (`onMetricClick`), report gen |
| 3 | `board-packet` | BoardPacketDashboard | Board directors view; printable packet |
| 4 | `investor-relations` | InvestorRelationsDashboard | IR metrics off `yearData` |
| 5 | `early-warning` | EarlyWarningDashboard | Early-warning KPIs w/ alert thresholds, metric drill |
| 6 | `causal-analysis` | CausalAnalysisDashboard | Behavioral→outcome causal links (r1..r6 dataset) |
| 7 | `scenario-modeling` | ScenarioModelingDashboard | Interactive levers (mna/restruct/... sliders), $-impact calc |
| 8 | `employee-leading` | EmployeeLeadingDashboard | 7 sub-tabs: executive/retention/talent/managers/customers/culture/friction |
| 9 | `customer-health` | CustomerHealthDashboard | Customer health scores off connector/yearData |
| 10 | `investor-behavior` | InvestorBehaviorDashboard | Investor behavior signals |
| 11 | `individual-asi` | IndividualASIDashboard | Assign CLI Instruments; `preSelection` support |
| 12 | `org-oasi` | OrgOASIDashboard | OASI radar (9 styles × 3 domains), org-level |
| 13 | `aspirational-oasi` | AspirationalOASIDashboard | Aspirational vs situational OASI radar |
| 14 | `sentiment` | SentimentDashboard | Sentiment analysis, metric drill |
| 15 | `culture-change` | CultureChangeDashboard | Culture-change tracking off yearData |
| 16 | `merger` | MergerDashboard | Post-merger updates |
| 17 | `merger-integration` | PostMergerIntegrationDashboard | Post-merger integration playbook |
| 18 | `external` | ExternalDashboard | External view (news/markets/macro connectors) |
| 19 | `hiring` | HiringDashboard | Hiring & onboarding |
| 20 | `data-provenance` | DataProvenanceDashboard | Connector status + errors surfaced (§4.5) |
| 21 | `tenant-config` | TenantConfigDashboard | Registry enable/disable toggles, connector status |
| 22 | `meeting-prep` | MeetingPrepDashboard | Meeting / 1:1 prep |
| 23 | `about-cli` | AboutCLIDashboard | CLI framework reference (Achieving Styles, OASI) |
| 24 | `help` | HelpDashboard | Help & guide |
| 25 | `fill-jobs` | FillJobsDashboard | Interactive tool — currently standalone HTML. Rebuild native (§4.3b) |
| 26 | `mgmt-challenges` | MgmtChallengesDashboard | "Peace Pad" interactive tool — currently standalone HTML. Rebuild native (§4.3b) |
| 27 | `further-reading` | FurtherReadingView | Reference list (`renderFurtherReading`, App.jsx:2349) |

## Cross-cutting subsystems
- [ ] **AI Mentor** — CLI Achieving Styles system prompt (own asset, §4.1), chat UI, deep-link/navigate from responses (`renderCLAIMMessage`, App.jsx:9211); response handler filters content blocks by type (§5).
- [ ] **OASI/ASI radar** — 9 Achieving Styles (Vicarious, Contributory, Collaborative, Intrinsic, Competitive, Power, Entrusting, Social, Personal) across 3 clusters (Relational, Direct, Instrumental).
- [ ] **Report generation** — Achieving-Styles-lens reports (App.jsx:1184+ logic), no base64 blobs.
- [ ] **Connector layer** — BaseConnector (retry/backoff, stale fallback, localStorage), ConnectorRegistry (runAll, getLatestForDomain, derivePrCrisis), 11 domains real+mock.
- [ ] **Two interactive tools** — Fill Jobs + Management Challenges, rebuilt native (preferred) sharing design system; no external CDN/font at runtime.
- [ ] **Multi-tenant** — tenants zoetis / spgi / generic; tenant detection by email domain (now server-side at login).

## Data-correctness fixes (§5) to carry in
- [ ] BLS JOLTS: fetch ALL requested series (old code `slice(0,4)`).
- [ ] USPTO: current PatentsView Search API, verify live or mark mock-only.
- [ ] RSS (Google News): real XML parser, not regex.
- [ ] Mentor: filter Anthropic content blocks by type; handle empty/error responses.

## Security (§3) — definition of done
- [ ] Login works in all 4 serving contexts; no `crypto.subtle` in auth path.
- [ ] No client-side auth secrets / hashes / credential strings in bundle.
- [ ] Server-managed, configurable demo credentials (env/config, not client).
- [ ] Single entrypoint `src/main.jsx`.
- [ ] No `VITE_`-prefixed secrets; `.env.example` provided.
- [ ] `/api/chat` fails closed (401 without valid token).
- [ ] CORS allow-listed on chat + auth endpoints (no wildcard).
- [ ] Rate limiting on `/api/chat` (per-IP) and `/api/auth/login` (per-IP + backoff).
- [ ] No secrets in repo or git history.
