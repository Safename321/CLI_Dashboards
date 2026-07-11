#!/usr/bin/env bash
# deploy-nobump.sh — deploy the CURRENT version (no buildLetter bump, no commit).
# Use to re-deploy the already-committed version to all targets.
# Usage: ./deploy-nobump.sh
set -e
cd "$(dirname "$0")"

NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"
REPO="Safename321/CLI_Dashboards"
DROPLET_HOST="161.35.118.231"
DROPLET_PATH="/root/CLI_Dashboards"
SSH_KEY="$HOME/.ssh/id_cli"
VERCEL_URL="https://cli-dashboards-gamma.vercel.app"
VERCEL_URL2="https://cli-dashboards-v200n.vercel.app"
GHPAGES_URL="https://safename321.github.io/CLI_Dashboards"

VERSION=$(node -p "'v'+require('./package.json').version+require('./package.json').buildLetter")
echo "Deploying $VERSION (no bump)"

# 1. Build
echo "Building..."
npx vite build

# 2a. Vercel (both projects)
echo "Deploying to Vercel (gamma)..."
vercel link --yes --project cli-dashboards
vercel --prod --yes --force
echo "Deploying to Vercel (v200n)..."
vercel link --yes --project cli-dashboards-v2.0.0n
vercel --prod --yes --force

# 2b. Droplet — git pull + rebuild + restart
echo "Deploying to droplet ${DROPLET_HOST}..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "cd ${DROPLET_PATH} && git pull origin AllRepo && npm install && APP_BASE=/CLI_Dashboards/ npx vite build && rm -rf /root/www && mkdir -p /root/www && ln -sfn ${DROPLET_PATH}/dist /root/www/CLI_Dashboards"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "pkill -f 'cli-proxy-server' 2>/dev/null || true; pkill -f 'http.server 8000' 2>/dev/null || true; sleep 1; setsid python3 -m http.server 8000 --directory /root/www >/root/cli-dash-webserver.log 2>&1 </dev/null & disown 2>/dev/null || true; sleep 2; ss -tlnp | grep -q ':8000' && echo 'droplet: static server up' || echo 'droplet: WARNING :8000 not listening'"
echo "Droplet deployed."

# 2c. GitHub Pages
echo "Deploying to GitHub Pages..."
GHPAGES_DIR="ghpages-out"
rm -rf "$GHPAGES_DIR"
MSYS_NO_PATHCONV=1 npx vite build --base="/CLI_Dashboards/" --outDir="$GHPAGES_DIR" --emptyOutDir
cp "$GHPAGES_DIR/index.html" "$GHPAGES_DIR/404.html"
cd "$GHPAGES_DIR"
git init
git checkout -b gh-pages
git add -A
git commit -m "Deploy ${VERSION}"
git remote add origin "https://github.com/${REPO}.git"
git push -f origin gh-pages
cd -
rm -rf "$GHPAGES_DIR"
echo "GitHub Pages deployed."

# 3. Notify
curl -s -X POST "$NTFY_TOPIC" -H "Title: Deployed $VERSION" -H "Tags: rocket" \
  -d "Version: $VERSION (no-bump redeploy)
Vercel:  ${VERCEL_URL}
Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/
GitHub:  ${GHPAGES_URL}" > /dev/null || true

echo ""
echo "Done! $VERSION on all targets."
echo "Vercel:  ${VERCEL_URL}"
echo "Vercel2: ${VERCEL_URL2}"
echo "Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/"
echo "GitHub:  ${GHPAGES_URL}"
