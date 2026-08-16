# Publishing Process

## Quick Start

From the project root:

```bash
./deploy.sh "description of what you changed"
```

That's it. One command deploys to all 3 targets, creates a GitHub release, and sends a notification.

## What deploy.sh Does

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Run tests** | `vitest run` — all tests must pass or deploy aborts |
| 2 | **Build** | `vite build` — compiles the React SPA to `dist/` |
| 3 | **Bump version** | Increments `buildLetter` in `package.json` (e.g. `n` → `o`) |
| 4 | **Log deployer info** | Captures git username, public IP, timestamp |
| 5 | **Update deploy log** | Appends to `public/deploy-log.json` (feeds the status page) |
| 6 | **Commit & push** | Commits all changes to `AllRepo` branch on GitHub |
| 7 | **Create zip** | `git archive` creates `cli-dashboards-vX.X.Xx.zip` |
| 8 | **GitHub release** | Creates a tagged release and uploads the zip as an asset |
| 9a | **Deploy to Vercel (gamma)** | `vercel link --project cli-dashboards && vercel --prod --yes --force` |
| 9b | **Deploy to Vercel (v200n)** | `vercel link --project cli-dashboards-v2.0.0n && vercel --prod --yes --force` |
| 9c | **Deploy to Droplet** | SSH: `git pull && npm install && APP_BASE=/CLI_Dashboards/ npx vite build`, then `systemctl restart cli-dash.service` |
| 9d | **Deploy to GitHub Pages** | Builds with `--base /CLI_Dashboards/`, copies `404.html` for SPA routing, pushes to `gh-pages` branch |
| 10 | **Notify (guaranteed)** | ntfy.sh → status page with chime. Sent by an EXIT trap, so it fires on **every** run — success or failure |

## Notifications are guaranteed (EXIT trap)

The ntfy notification is no longer a final script step that can be skipped — it
is sent from a bash `EXIT` trap (`on_exit`) in both `deploy.sh` and
`deploy-nobump.sh`, so **every run notifies, automatically**:

- **Success** → `Deployed vX.Y.Zl` (rocket tag) with version, message, deployer, and
  all four host targets: Vercel gamma, Vercel v200n, the DigitalOcean droplet, and
  GitHub Pages.
- **Failure/abort** (any `set -e` exit, Ctrl-C, crash) → `Deploy FAILED …`
  (rotating_light tag) naming the **step** that died (`tests`, `build`,
  `commit-push`, `github-release`, `vercel`, `droplet`, `gh-pages`, …) and the
  exit code, plus a reminder that targets may be partially deployed.
- **SIGPIPE is ignored** (`trap '' PIPE`), so piping the script's output through
  `head`/`less` can no longer kill the run and eat the notification (this lost
  the v2.0.1b notification on 2026-07-12).

Do not re-add a bare `curl` notify at the end of the scripts — the trap owns it
(a duplicate would double-notify). The `notify()` helper uses `--max-time 15`
and never fails the script even if ntfy.sh is unreachable.

## Where Things Live

| What | Where |
|------|-------|
| Vercel (primary) | https://cli-dashboards-gamma.vercel.app |
| Vercel (secondary) | https://cli-dashboards-v200n.vercel.app |
| Droplet (reference) | http://161.35.118.231:8000/CLI_Dashboards/ |
| GitHub Pages (demo, no auth) | https://safename321.github.io/CLI_Dashboards/ |
| Status page | https://cli-dashboards-gamma.vercel.app/status.html |
| GitHub repo | https://github.com/Safename321/CLI_Dashboards (branch: `AllRepo`) |
| GitHub releases | https://github.com/Safename321/CLI_Dashboards/releases |
| Backend API | Laravel on HostUp — `app.cardinalfund.com` (the Express/Neon proxy was excised in E2, 2026-07-12) |
| Notifications | ntfy.sh topic `clidash-3dd4654f0f939b8cc5` (guaranteed via EXIT trap — see above) |

## Deployment Target Details

### Vercel (two projects)

Both Vercel projects (`cli-dashboards` and `cli-dashboards-v2.0.0n`) serve the
**static build** at the origin root (`base=/`). deploy.sh switches between them
using `vercel link` when the Vercel CLI is authenticated; otherwise the push to
`AllRepo` still auto-deploys gamma via Vercel's Git integration.

No serverless env vars are needed anymore — the `/api` serverless route and its
`CORS_ALLOWED_ORIGINS`/`JWT_SECRET`/`CLI_ACCOUNTS` config went with the Express
proxy (E2). Auth and data calls go straight to the Laravel backend.

### DigitalOcean Droplet

The droplet serves the **static build** on port 8000 (the Express proxy was
excised in E2 — the SPA has no client-side routing, so a plain static server
suffices; connectors call the authed Laravel `/data` proxy on
`app.cardinalfund.com`).

**Connection:** SSH via `~/.ssh/id_cli` key as `root@161.35.118.231`.

**Server process:** systemd unit `cli-dash.service` — `python3 -m http.server
8000 --directory /root/www`, `Restart=always`, enabled at boot. `dist/` is
symlinked at `/root/www/CLI_Dashboards`. Do NOT run it via bare
nohup/setsid-over-ssh — that flapped (2026-07-12 outage).

**Deployment steps (automated by deploy.sh):**
1. `git pull origin AllRepo`
2. `npm install` (full deps, NOT `--production` — vite is needed for build)
3. `APP_BASE=/CLI_Dashboards/ npx vite build`
4. `ln -sfn /root/CLI_Dashboards/dist /root/www/CLI_Dashboards`
5. `systemctl restart cli-dash.service` (script verifies `is-active` afterwards)

### GitHub Pages

GitHub Pages serves static files only — **no backend API**. The app detects the missing server and enters demo mode automatically (no login screen, S&P Global sample data).

**How it works:** `AuthContext.jsx` catches the failed fetch to `/api/auth/config` and sets `authDisabled: true`, bypassing the login screen.

**Build:** Requires `--base /CLI_Dashboards/` because GitHub Pages serves from `https://safename321.github.io/CLI_Dashboards/` — the repo name becomes the path prefix.

**SPA routing:** A copy of `index.html` is deployed as `404.html` so that GitHub Pages serves the app shell for all routes (client-side routing).

**Pages config:** Source branch is `gh-pages`, path `/`. Set in GitHub repo Settings → Pages.

**MSYS/Git Bash note:** On Windows (MSYS), vite's `--base` and `--outDir` flags get mangled by automatic path conversion. deploy.sh uses `MSYS_NO_PATHCONV=1` and a relative `outDir` to work around this.

## Version Scheme

`v2.0.0` + build letter (a, b, c, ..., z). The letter increments automatically on each deploy.

**Version appears in 8 places** (all cascade from `package.json`):
1. `package.json` → `version` + `buildLetter` (source of truth)
2. `src/config/version.js` → reads package.json at build time
3. `deploy.sh` → reads + bumps buildLetter (rolls patch+1, letter→`a` when the letter hits `z`)
5. `public/deploy-log.json` → appended by deploy.sh
6. `public/status.html` → displays deploy-log.json + live NTFY feed
7. `src/reports/shared.js` → imports from version.js (report footers)
8. `LoginScreen.jsx` + `Sidebar.jsx` → import `APP_VERSION_LABEL`

## Login Credentials

Auth is handled by the Laravel backend (`app.cardinalfund.com`): the SPA posts
to `/api/auth/login`, which validates against the `dashboard_users` table and
issues a JWT. Accounts are managed in the SuperAdmin console (or via
`php artisan` on HostUp) — the old Express `CLI_ACCOUNTS` env-var scheme is gone
(excised in E2). GitHub Pages has no backend, so it auto-enters demo mode with
no login screen.

## Prerequisites

- **Node.js** 20+
- **Vercel CLI** (`npm i -g vercel`, then `vercel login`)
- **Git** with push access to the repo
- **SSH key** at `~/.ssh/id_cli` authorized on the droplet
- **curl** (for notifications)

## Send a message to the status page

```bash
curl -d "your message" https://ntfy.sh/clidash-3dd4654f0f939b8cc5
```

With a title:

```bash
curl -H "Title: Build complete" -d "All tests passed" https://ntfy.sh/clidash-3dd4654f0f939b8cc5
```
