# CLI Dashboards — Ground-Up Rewrite Brief (for Claude Code)

## ⚙️ OPERATING MODE: FULLY AUTONOMOUS — read before everything

This engagement runs **unattended** in a `tmux` session; the operator is logged out and **cannot answer prompts**. Therefore:

- **Do NOT pause to ask for sign-off or confirmation anywhere.** The instructions in §0, §7.1, and §7.2 that say "stop and tell me," "confirm it with me," or "get sign-off" are **overridden**: instead of stopping, **write your output to a file and keep working.**
  - §0 model fallback: pick the most capable model actually available to you, in order Fable 5 → Opus 4.8 → (only if neither is selectable) the best remaining model. **Never stop** over model choice. Record what you selected and why in `PROGRESS.md`.
  - §7.1 feature-parity checklist → write it to `PARITY_CHECKLIST.md` and proceed.
  - §7.2 module structure & shared-component set → write it to `ARCHITECTURE.md` and proceed.
- **Maintain a running `PROGRESS.md`** at the repo root: append a timestamped entry at the start of each major step and when each acceptance-criterion item is met. This is how the operator catches up after reattaching.
- **Stop ONLY for a genuine hard blocker** you cannot safely resolve alone (e.g. a required input that does not exist, an irreversible/destructive action, or a credential you lack). When that happens, write the situation and the options to **`NEEDS-INPUT.md`** at the repo root, commit it, and continue with any *other* independent work that is still unblocked. Do not idle waiting.
- **Commit frequently** (small, reviewable commits) so progress is durable and visible. Push to `origin/AllRepo` periodically. Git credentials are already configured.
- Keep going until the §8 acceptance criteria are met or you are genuinely blocked on all fronts.

### Repo context (already verified by the operator)
- The **v1.24L source to read as your spec** is extracted at `_v1.24L_source/cli-dashboard-v1.24L/` — real `src/App.jsx` (10,374 lines), `src/connectors/` (13 connectors + registry), `cli-proxy-server/api/`, `tests/`, configs. Read it; do not copy it. (Also present as `CLIDashboards_v1.24L.zip`.)
- The current repo root otherwise holds only the **deployed bundle** (`assets/index-*.js`, `index.html`, `data/spgi-data.json`). Build the clean replacement into a proper `src/` + proxy structure per §4.
- Add `_v1.24L_source/` and `CLIDashboards_v1.24L.zip` to `.gitignore` — they are reference material, not part of the new build, and must not bloat the new bundle.
- **This GitHub repo is PUBLIC.** Treat §3/§9 (no secrets in client/bundle/history) as hard requirements with real exposure consequences.
- The old `.env` files contain only the placeholder `your_anthropic_api_key_here` (no real key) — but do not reintroduce any `VITE_`-prefixed secret per §3.5.

---

## 📲 MILESTONE NOTIFICATIONS — required

The operator is away. At each progress milestone below, run the notify helper so they get a phone push. Fire-and-forget; never let a failed notification block work.

```
/root/cli-notify.sh "<title>" "<message>" <priority> "<tags>"
```

Send a notification when each of these is reached (once each, in order):
- **25%** — shared component primitives (§4.1) + data layer + connector base/registry are built and the app boots.
  `/root/cli-notify.sh "CLI Dashboards — 25%" "Primitives + data + connector layer done; app boots." default "one"`
- **50%** — roughly half of the ~23 dashboards reimplemented with parity, tests green.
  `/root/cli-notify.sh "CLI Dashboards — 50%" "~half of 23 dashboards rebuilt with parity, tests green." default "two"`
- **75%** — all dashboards + AI mentor + proxy + server auth + rate limiting wired.
  `/root/cli-notify.sh "CLI Dashboards — 75%" "All dashboards + mentor + proxy + server auth done." default "three"`
- **100%** — all §8 acceptance criteria met, tests green, committed and pushed.
  `/root/cli-notify.sh "CLI Dashboards — 100% ✅" "Done: all acceptance criteria met, pushed to origin/AllRepo." high "white_check_mark,tada"`
- **BLOCKED** — if you write a `NEEDS-INPUT.md` and cannot make further progress:
  `/root/cli-notify.sh "CLI Dashboards — BLOCKED" "Need operator input — see NEEDS-INPUT.md" urgent "warning"`

Also append each milestone to `PROGRESS.md` with a timestamp.

---

## 0. Model directive — read first

Use the most capable model available to you for this entire engagement.

- Run `claude update` to ensure you are on the latest version.
- Set the model to **Claude Fable 5** if it is available: run `/model` and select Fable 5 (requires Claude Code v2.1.170+, and it is unavailable under zero‑data‑retention). Confirm with `/status`.
- If Fable 5 is unavailable, use **Claude Opus 4.8** (`/model opus`), the next most capable model.
- Do **not** silently fall back to a smaller model. If you cannot select Fable 5 or Opus, stop and tell me before proceeding.
- This is an architecture + security task that rewards deep investigation and self‑verification; keep effort high. Hold the full plan in context and work in reviewable steps.

## 1. Mission

Abandon the existing `CLI Dashboards v1.24L` codebase and build a clean replacement from scratch. The replacement must have **full feature parity** with v1.24L's dashboards and tools, but with compact, well‑factored code, no duplicated logic, no wasteful resource use, and every known security gap closed. Target a ~45–60% reduction in the size of the current 10,000‑line `App.jsx` by eliminating redundancy — not by dropping features.

Treat the old code as a **specification of behavior to reproduce**, not as code to copy. Read it to understand what each dashboard does, then reimplement cleanly.

## 2. What the product is

A React + Vite behavioral‑intelligence dashboard app (Connective Leadership Institute / "CLI"). It presents ~23 dashboards built on the CLI "Achieving Styles" framework (9 styles across three domains: Direct, Instrumental, Relational), plus an AI mentor, for a multi‑tenant demo (primary tenant: S&P Global / SPGI). A Vercel serverless proxy fetches external data (SEC EDGAR, FRED, BLS JOLTS, GDELT, Google News, AlphaVantage, USPTO) and forwards chat to the Anthropic API. A connector layer abstracts real vs. mock data sources per tenant.

Preserve all of: the ~23 dashboards, the AI mentor with its CLI framework system prompt, the per‑tenant connector registry with real+mock connectors, the OASI/ASI radar visualizations, report generation, and the two interactive tools currently embedded as standalone HTML ("Management Challenges" Peace Pad and "Fill Jobs").

## 3. Non‑negotiable security requirements (close every gap)

1. **Login must work in every serving context, not only HTTPS or localhost.** The v1.24L gate hashed the password client-side with `window.crypto.subtle.digest`, which browsers disable in non‑secure contexts — meaning the gate breaks the moment the app is served over plain HTTP from any non‑localhost host (e.g., a dev Droplet's public IP). This is unacceptable. The replacement login must function identically across all four serving contexts: localhost over HTTP, localhost over HTTPS, public origin over HTTP, public origin over HTTPS. Concretely:
   - **Do not call `window.crypto.subtle.*`, `SubtleCrypto`, or any Web Crypto API on the client for authentication-related work.** All credential validation and cryptographic operations happen on the server.
   - **Do not depend on any browser-secure-context-only API in the login or session-restore path.** No `crypto.subtle`, no `navigator.credentials`, no service-worker-gated auth state.
   - **Client sends credentials to the server over `fetch`/POST; the server validates them and returns a signed session token** (JWT or signed httpOnly cookie). Token verification on subsequent requests is also server-side.
   - **On failure, surface a clear, non-technical message** ("Incorrect email or password"). Never leak internal error strings like "crypto.subtle unavailable" to the user.
2. **No client‑side auth secrets.** Do not ship password hashes, plaintext passwords, or comments revealing credentials in the bundle. Server stores hashed-and-salted credentials (bcrypt/argon2); the bundle contains no credential material. If a full backend is out of scope for an iteration, ship with auth **genuinely disabled** (no login screen at all) and clearly documented as a public demo build — never a decorative client gate that looks like security.
3. **Demo / tenant credentials are server-managed and configurable.** The set of recognized demo accounts (e.g., `admin@connectiveleadership.com`, `admin@snpglobal.com`, `admin@zoetis.com`) lives in a server-side config file or environment variable map, not in client code. Default credentials must be changeable without rebuilding the bundle. Document them in `README.md` for development use only; production deployments require operator-set credentials.
4. **One entrypoint only.** A single `src/main.jsx`. No second ungated entrypoint at the project root or anywhere else. Delete the old `main.jsx` if one exists.
5. **No `VITE_`‑prefixed secrets.** API keys live only in the proxy's server environment. Never reference an API key from client code. Provide a `.env.example` documenting this.
6. **Fail closed on the chat proxy.** The Anthropic‑backed `/api/chat` must return `401` when its auth token is missing or wrong — never proceed open. The client must send the token from the session established at login.
7. **Lock down CORS.** Reflect only an allow‑list of known origins; no wildcard on the chat or auth endpoints. Read‑only data endpoints may be broader only if explicitly documented.
8. **Rate limit** `/api/chat` (per‑IP) and `/api/auth/login` (per‑IP, with exponential backoff after failed attempts) to cap credit-burn, brute force, and abuse.
9. **No secrets in the repo or git history.**

## 4. Architecture & code‑quality requirements

1. **No monolith.** No single file over ~400 lines. Structure:
   - `src/data/` — data loader + static datasets as data files (not inline literals).
   - `src/components/` — shared primitives (MetricCard, BulletChart, StatusBadge, Charts, ReportModal, RecommendationPanel, tables).
   - `src/dashboards/` — one file per dashboard.
   - `src/mentor/` — AI mentor logic; the CLI system prompt lives in its own text/markdown asset, not inline in JS.
   - `src/connectors/` — connector base + registry + implementations.
   - `App.jsx` — shell only (routing/switch, sidebar, top‑level state).
2. **Deduplicate ruthlessly.** Build the repeated card/chart/table/badge patterns once and reuse. Make dashboards data‑driven where they differ only by content.
3. **No embedded base64 sub‑apps.** Do not embed HTML, PDF, or PNG as base64 string constants in JS. Either (a) keep the two interactive tools as clean static files under `public/` loaded by URL in an `iframe`, or (b) rebuild them as native React dashboards sharing the connector layer and design system — recommend (b) if time allows; state which you chose. Embedded documents must not pull external CDNs/fonts at runtime; vendor dependencies locally for offline use.
4. **Proper React state.** No mutable module‑global app state. Load data via React state/context; updates are immutable. Use `localStorage` only as an explicit, schema‑versioned cache, with the network as source of truth.
5. **No silent failures.** Every catch logs context; connector/data errors surface in the Data Provenance view.
6. **Performance.** Memoize derived data and expensive components; stabilize callbacks; co‑locate state so one view's change doesn't re‑render the app. Extracting the base64 blobs is also the biggest bundle‑size win.
7. **Styling.** Use Tailwind (already in the toolchain) with shared design tokens; reserve inline styles for genuinely dynamic values.
8. **Accessibility.** Real `<button>`/`<a>` elements, `aria-label`s on icon controls, `title` on iframes, working keyboard navigation.
9. **Single source of truth for version + business constants.** No `package.json` vs UI version mismatch. Tenant config, earnings dates, CIK/ticker, etc. live in config/data, not scattered literals.

## 5. Data‑correctness fixes to carry into the rewrite

- BLS JOLTS: fetch **all** requested series; do not silently drop any (the old code did `slice(0,4)`).
- USPTO: target the **current** PatentsView Search API, not the deprecated legacy endpoint; verify with a live call, else mark the connector mock‑only.
- RSS (Google News): parse with a real XML parser, not hand‑rolled regex.
- AI mentor: handle Anthropic responses by **filtering content blocks by type** and joining text blocks; never assume `content[0].text`. Handle empty/error responses with a user‑facing message.

## 6. Testing requirements

- Keep meaningful end‑to‑end tests (Playwright) but with **real assertions** per dashboard (expected content rendered, no console errors) — not just timed dwell loops.
- Add a smoke test that every dashboard in the routing switch mounts without throwing.
- Unit tests for: connector retry/stale‑fallback, registry `runAll`/crisis derivation, the RSS parser, and the mentor response handler.

## 7. Working method

1. Start by reading the old codebase and any provided review document to inventory exact dashboard behavior. Produce a short feature‑parity checklist and confirm it with me before building.
2. Propose the file/module structure and the shared‑component set; get sign‑off.
3. Build incrementally — shared primitives → data layer → dashboards → mentor → shell — keeping the app runnable and tests green at each step.
4. Implement the proxy + server auth + rate limiting and wire the client to it.
5. Verify your own work: run tests, check the bundle has no base64 document blobs, grep for any `VITE_`‑prefixed secrets or hardcoded credentials, and confirm no file exceeds the size budget.

## 8. Acceptance criteria (definition of done)

- Feature parity with v1.24L across all dashboards, the mentor, connectors, and the two interactive tools.
- No file > ~400 lines; the App‑equivalent React code is roughly 4,000–5,500 lines total; no duplicated card/chart/table logic.
- All Section 3 security items satisfied; chat proxy fails closed; CORS allow‑listed; rate limiting in place; no secrets in client/bundle/history.
- **Login works under all four serving contexts** — verified manually by signing in successfully when the app is served via (a) `http://localhost:PORT`, (b) `https://localhost:PORT`, (c) `http://PUBLIC_IP_OR_DOMAIN`, and (d) `https://PUBLIC_DOMAIN`. No browser-console errors mentioning `crypto.subtle`, `SubtleCrypto`, or `secure context` appear in any context. A static grep of the built bundle for `crypto.subtle` returns zero hits in auth-related code paths.
- The bundle contains no plaintext passwords, no password hashes, and no credential strings; `grep -ri "CLI2026" dist/` (or any prior known credential) returns nothing.
- No base64‑embedded HTML/PDF/PNG in JS; no runtime external CDN/font dependencies in embedded tools.
- All Section 5 data bugs fixed; all Section 6 tests present and green.
- Single source of truth for version and tenant/business config.
