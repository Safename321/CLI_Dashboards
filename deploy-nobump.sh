#!/usr/bin/env bash
# deploy-nobump.sh — deploy the CURRENT version (no buildLetter bump, no commit).
# Use to ship the already-committed 2.0.0p to Vercel + Droplet.
# (GitHub Pages was deployed separately; re-add the 9c block if you want it here too.)
# Usage: ./deploy-nobump.sh
set -e
cd "$(dirname "$0")"

NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"
DROPLET_HOST="161.35.118.231"
DROPLET_PATH="/root/CLI_Dashboards"
SSH_KEY="$HOME/.ssh/id_cli"
VERCEL_URL="https://cli-dashboards-gamma.vercel.app"

VERSION=$(node -p "'v'+require('./package.json').version+require('./package.json').buildLetter")
echo "Deploying $VERSION (no bump)"

# 1. Build (default .env.production -> Laravel API, auth enabled)
echo "Building..."
npx vite build

# 2a. Vercel (both projects) — requires: npm i -g vercel && vercel login
echo "Deploying to Vercel (gamma)..."
vercel link --yes --project cli-dashboards
vercel --prod --yes --force
echo "Deploying to Vercel (v200n)..."
vercel link --yes --project cli-dashboards-v2.0.0n
vercel --prod --yes --force

# 2b. Droplet — git pull AllRepo (already at $VERSION) + rebuild + restart
echo "Deploying to droplet ${DROPLET_HOST}..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "cd ${DROPLET_PATH} && git pull origin AllRepo && npm install && APP_BASE=/CLI_Dashboards/ npx vite build"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "kill \$(ps aux | grep 'node cli-proxy-server/server.js' | grep -v grep | awk '{print \$2}') 2>/dev/null || true; sleep 1; cd ${DROPLET_PATH} && nohup node cli-proxy-server/server.js > /root/cli-dash-webserver.log 2>&1 &"
echo "Droplet deployed."

# 3. Notify
curl -s -X POST "$NTFY_TOPIC" -H "Title: Deployed $VERSION" -H "Tags: rocket" \
  -d "Version: $VERSION (Laravel-wired)
Vercel:  ${VERCEL_URL}
Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/" > /dev/null || true

echo "Done! $VERSION on Vercel + Droplet."
