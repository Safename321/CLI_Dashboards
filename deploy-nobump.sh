#!/usr/bin/env bash
# deploy-nobump.sh — deploy the CURRENT version (no buildLetter bump, no commit).
# Use to re-deploy the already-committed version to all targets.
# Usage: ./deploy-nobump.sh
set -e
# Ignore SIGPIPE (piping through head must never kill the run) and guarantee an
# ntfy notification on EVERY exit — success or failure — via the EXIT trap.
trap '' PIPE
cd "$(dirname "$0")"

NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"

STEP="init"
NOTIFIED=0

notify() { # $1=title $2=tags $3=body — never fails the script
  curl -s --max-time 15 -X POST "$NTFY_TOPIC" \
    -H "Title: $1" -H "Tags: $2" -d "$3" > /dev/null 2>&1 || true
}

on_exit() {
  code=$?
  [ "$NOTIFIED" = "1" ] && return 0
  NOTIFIED=1
  if [ "$code" -eq 0 ]; then
    notify "Deployed ${VERSION:-?}" "rocket" "Version: ${VERSION:-?} (no-bump redeploy)
Vercel:  ${VERCEL_URL}
Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/
GitHub:  ${GHPAGES_URL}"
  else
    notify "Redeploy FAILED ${VERSION:-?}" "rotating_light" "FAILED at step: $STEP (exit $code)
$(date '+%Y-%m-%d %H:%M:%S %Z')
Targets may be partially deployed - check and re-run."
  fi
}
trap on_exit EXIT
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
STEP="build"
echo "Building..."
npx vite build

# 2a. Vercel (both projects)
STEP="vercel"
echo "Deploying to Vercel (gamma)..."
vercel link --yes --project cli-dashboards
vercel --prod --yes --force
echo "Deploying to Vercel (v200n)..."
vercel link --yes --project cli-dashboards-v2.0.0n
vercel --prod --yes --force

STEP="droplet"
# 2b. Droplet — git pull + rebuild + restart
echo "Deploying to droplet ${DROPLET_HOST}..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "cd ${DROPLET_PATH} && git pull origin AllRepo && npm install && APP_BASE=/CLI_Dashboards/ npx vite build && rm -rf /root/www && mkdir -p /root/www && ln -sfn ${DROPLET_PATH}/dist /root/www/CLI_Dashboards"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "systemctl restart cli-dash.service; sleep 2; systemctl is-active cli-dash.service && echo 'droplet: cli-dash active' || echo 'droplet: WARNING cli-dash not active'"
echo "Droplet deployed."

# 2c. GitHub Pages
STEP="gh-pages"
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

# 3. Notify — sent by the EXIT trap (on_exit) so it fires on success AND on
# any failure/abort; do not add a bare curl back here.
STEP="done"

echo ""
echo "Done! $VERSION on all targets."
echo "Vercel:  ${VERCEL_URL}"
echo "Vercel2: ${VERCEL_URL2}"
echo "Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/"
echo "GitHub:  ${GHPAGES_URL}"
