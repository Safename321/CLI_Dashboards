# Publishing Process

## Quick Start

From the project root (`C:\tmp\CLI_Dashboards`):

```bash
./deploy.sh "description of what you changed"
```

That's it. One command does everything below.

## What deploy.sh Does

| Step | Action | Detail |
|------|--------|--------|
| 1 | **Run tests** | `vitest run` — all 51 tests must pass or deploy aborts |
| 2 | **Build** | `vite build` — compiles the React SPA to `dist/` |
| 3 | **Bump version** | Increments `buildLetter` in `package.json` (e.g. `l` → `m`) |
| 4 | **Log deployer info** | Captures git username, public IP, timestamp |
| 5 | **Update deploy log** | Appends to `public/deploy-log.json` (feeds the status page) |
| 6 | **Commit & push** | Commits all changes to `AllRepo` branch on GitHub |
| 7 | **Create zip** | `git archive` creates `cli-dashboards-vX.X.Xx.zip` |
| 8 | **GitHub release** | Creates a tagged release and uploads the zip as an asset |
| 9 | **Deploy to Vercel** | `vercel --prod` pushes to production |
| 10 | **Notify** | Sends to ntfy.sh → appears on status page with chime |

## Where Things Live

| What | Where |
|------|-------|
| Live app | https://cli-dashboards-gamma.vercel.app |
| Status page | https://cli-dashboards-gamma.vercel.app/status.html |
| GitHub repo | https://github.com/Safename321/CLI_Dashboards (branch: `AllRepo`) |
| GitHub releases | https://github.com/Safename321/CLI_Dashboards/releases |
| Database | Neon Postgres (us-east-1) |
| Notifications | ntfy.sh topic `clidash-3dd4654f0f939b8cc5` |

## Manual Steps (if not using deploy.sh)

### Edit → Preview → Deploy

1. **Edit** files in your editor
2. **Preview** locally: `npm run dev` (opens at `http://localhost:5173`)
3. **Deploy**: `./deploy.sh "what you changed"`

### Send a message to the status page

From any terminal, anywhere:

```bash
curl -d "your message" https://ntfy.sh/clidash-3dd4654f0f939b8cc5
```

With a title:

```bash
curl -H "Title: Build complete" -d "All tests passed" https://ntfy.sh/clidash-3dd4654f0f939b8cc5
```

### Login credentials

- Email: `admin@connectiveleadership.com`
- Password: `demo2026`

## Version Scheme

`v2.0.0` + build letter (a, b, c, ..., z). The letter increments automatically on each deploy. The version appears in the login screen footer, sidebar, and all generated reports.

## Prerequisites

The following must be installed and authenticated:

- **Node.js** 20+
- **Vercel CLI** (`npm i -g vercel`, then `vercel login`)
- **Git** with push access to the repo
- **curl** (for notifications)

Environment variables (set in `.env` for local, Vercel dashboard for production):

- `DATABASE_URL` — Neon Postgres connection string
- `JWT_SECRET` — signing key for session tokens
- `CLI_ACCOUNTS` — login credentials (email:bcryptHash)
