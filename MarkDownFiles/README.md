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
