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
| 9c | **Deploy to Droplet** | SSH: `git pull && npm install && APP_BASE=/CLI_Dashboards/ npx vite build` then restart server |
| 9d | **Deploy to GitHub Pages** | Builds with `--base /CLI_Dashboards/`, pushes `dist/` to `gh-pages` branch |
| 10 | **Notify** | Sends to ntfy.sh → appears on status page with chime |

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
| Database | Neon Postgres (us-east-1) |
| Notifications | ntfy.sh topic `clidash-3dd4654f0f939b8cc5` |

## Deployment Target Details

### Vercel (two projects)

Both Vercel projects (`cli-dashboards` and `cli-dashboards-v2.0.0n`) serve the app at the origin root (`base=/`). deploy.sh switches between them using `vercel link`.

**Required environment variables (set in Vercel Dashboard → Project Settings → Environment Variables):**

| Variable | Value |
|----------|-------|
| `CORS_ALLOWED_ORIGINS` | `https://cli-dashboards-gamma.vercel.app,https://cli-dashboards-v200n.vercel.app,http://localhost:5173` |
| `JWT_SECRET` | A 64-char hex string (generate: `openssl rand -hex 32`) |
| `JWT_TTL` | `12h` |
| `CLI_ACCOUNTS` | `email:bcryptHash,email:bcryptHash,...` (see Credentials section) |

**Why CORS matters:** Vercel serverless functions receive requests where the `Origin` header doesn't match the `Host` header, so the server's `isSameOrigin()` check fails. Without the origin in `CORS_ALLOWED_ORIGINS`, login returns 403.

### DigitalOcean Droplet

The droplet runs Express directly on port 8000 with `APP_BASE=/CLI_Dashboards/`.

**Connection:** SSH via `~/.ssh/id_cli` key as `root@161.35.118.231`.

**Server process:** `node cli-proxy-server/server.js` — runs as a bare process (no PM2/systemd), logs to `/root/cli-dash-webserver.log`.

**Deployment steps (automated by deploy.sh):**
1. `git pull origin AllRepo`
2. `npm install` (full deps, NOT `--production` — vite is needed for build)
3. `APP_BASE=/CLI_Dashboards/ npx vite build`
4. Kill old server process, start new one

**Environment:** `.env` at `/root/CLI_Dashboards/.env` with `PORT=8000`, `APP_BASE=/CLI_Dashboards/`, and all auth/API keys.

### GitHub Pages

GitHub Pages serves static files only — **no backend API**. The app detects the missing server and enters demo mode automatically (no login screen, S&P Global sample data).

**How it works:** `AuthContext.jsx` catches the failed fetch to `/api/auth/config` and sets `authDisabled: true`, bypassing the login screen.

**Build:** Requires `--base /CLI_Dashboards/` because GitHub Pages serves from `https://safename321.github.io/CLI_Dashboards/` — the repo name becomes the path prefix.

**Pages config:** Source branch is `gh-pages`, path `/`. Set in GitHub repo Settings → Pages.

## Version Scheme

`v2.0.0` + build letter (a, b, c, ..., z). The letter increments automatically on each deploy.

**Version appears in 8 places** (all cascade from `package.json`):
1. `package.json` → `version` + `buildLetter` (source of truth)
2. `src/config/version.js` → reads package.json at build time
3. `cli-proxy-server/server.js` → reads package.json at runtime (`/api/health`)
4. `deploy.sh` → reads + bumps buildLetter
5. `public/deploy-log.json` → appended by deploy.sh
6. `public/status.html` → displays deploy-log.json + live NTFY feed
7. `src/reports/shared.js` → imports from version.js (report footers)
8. `LoginScreen.jsx` + `Sidebar.jsx` → import `APP_VERSION_LABEL`

## Login Credentials

Three demo accounts, all using password `CLI2026!`:

| Email | Tenant | Notes |
|-------|--------|-------|
| `admin@connectiveleadership.com` | generic | White-label demo |
| `admin@snpglobal.com` | spgi | S&P Global branding, has live data |
| `admin@zoetis.com` | zoetis | Zoetis branding, empty state |

**Generate a bcrypt hash:** `node cli-proxy-server/config/hash-password.js 'YourPassword'`

**CLI_ACCOUNTS format:** `email1:bcryptHash1,email2:bcryptHash2,email3:bcryptHash3`

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
