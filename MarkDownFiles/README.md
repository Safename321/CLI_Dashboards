# CLI Dashboards v2 – Complete Documentation

## Project Overview

CLI Dashboards v2 is a behavioral-intelligence dashboard platform built for the Connective Leadership Institute. It represents a clean ground-up rewrite of cli-dashboard v1.24L with full feature parity: ~25 dashboards on the CLI Achieving Styles framework, an AI mentor, a per-tenant connector layer (real + mock data sources), report generation, and two interactive tools (Fill Jobs, Management Challenges) rebuilt as native React.

## Technical Stack

**Frontend Architecture:**
- React 18 with Vite as the build tool
- Tailwind CSS for styling
- Recharts for data visualization
- Component structure organized into dashboards, shared primitives, AI mentor module, and connectors

**Backend Structure:**
- Express-based proxy server handling authentication, chat endpoints, and data proxies
- When the `dist/` directory exists, serves the built client as well
- Deployment-ready: route handlers function as Vercel serverless functions

## Security Implementation

The system employs server-side credential validation exclusively. The client sends email/password over fetch POST and receives a signed JWT. No Web Crypto / crypto.subtle anywhere in the auth path, so login works identically over HTTP and HTTPS, on localhost and public origins.

Key protections include:
- No sensitive credentials in client bundles
- Account management through environment variables
- Rate limiting on authentication and chat endpoints
- CORS allow-listing (no wildcards)
- Graceful failures for unauthorized access

## Development Workflow

```bash
npm install
cp .env.example .env
npm run server      # :8787
npm run dev         # :5173 with API proxying
npm test            # Vitest unit tests
npm run test:e2e    # Playwright integration tests
npm run build       # Production bundle
```

## Deployment Flexibility

The application supports subpath hosting through the `APP_BASE` environment variable, enabling deployment scenarios like `https://host/CLI_Dashboards/`. The build process embeds this base into the bundle, ensuring consistency between client and server.

Authentication verification confirms functionality across localhost (HTTP/HTTPS), public IP addresses, and production domains without reliance on secure-context-only APIs.

## Deployment Targets

The app deploys to 3 targets via a single `./deploy.sh` command:

| Target | URL | Auth | Purpose |
|--------|-----|------|---------|
| **Vercel (gamma)** | https://cli-dashboards-gamma.vercel.app | Full login | Primary production |
| **Vercel (v200n)** | https://cli-dashboards-v200n.vercel.app | Full login | Secondary production |
| **DO Droplet** | http://161.35.118.231:8000/CLI_Dashboards/ | Full login | Known-good reference for debugging |
| **GitHub Pages** | https://safename321.github.io/CLI_Dashboards/ | Demo mode (no login) | Public demo, auto-enters with S&P Global data |

### Key deployment notes

- **Vercel** requires `CORS_ALLOWED_ORIGINS` env var including the Vercel domain, or login returns 403
- **Droplet** requires `APP_BASE=/CLI_Dashboards/` and `PORT=8000` in `.env`, and `npm install` (full, not `--production`) so vite is available for builds
- **GitHub Pages** requires building with `--base /CLI_Dashboards/` (the repo name becomes the URL prefix). Auth is auto-disabled because `AuthContext.jsx` catches the failed `/api/auth/config` fetch and enters demo mode
- **SSH access** to droplet uses `~/.ssh/id_cli` key as `root@161.35.118.231`

### Notifications

Deploy notifications go to ntfy.sh and appear on the live status page:
- **Status page:** https://cli-dashboards-gamma.vercel.app/status.html
- **Send manually:** `curl -d "message" https://ntfy.sh/clidash-3dd4654f0f939b8cc5`

## Tenant System

Currently presentation-only (branding, not data isolation). See `MarkDownFiles/07-per-tenant-isolation.md` for the production isolation plan.

| Email domain | Tenant | Branding |
|-------------|--------|----------|
| `@zoetis.com` | zoetis | Zoetis, orange accent, empty state |
| `@snpglobal.com` | spgi | S&P Global, red accent, live data |
| Other | generic | CLI Demo, red accent, live data |
