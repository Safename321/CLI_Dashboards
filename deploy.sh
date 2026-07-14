#!/usr/bin/env bash
# deploy.sh — test, build, bump, commit, push, zip, release, deploy (4 targets), notify.
# Usage: ./deploy.sh "what you changed"
set -e
# Ignore SIGPIPE: piping this script through `head` etc. used to kill it mid-run
# (lost the v2.0.1b notification). With PIPE ignored a broken pipe becomes a
# plain write error and the EXIT trap below still guarantees a notification.
trap '' PIPE

cd "$(dirname "$0")"
MSG="${1:-Update}"
# Force ASCII: non-ASCII bytes (em dashes etc.) turn the ntfy notification into
# an attachment.txt and mojibake the deploy log on Windows/Git Bash.
MSG=$(printf '%s' "$MSG" | iconv -f UTF-8 -t ASCII//TRANSLIT 2>/dev/null || printf '%s' "$MSG" | tr -cd '\11\12\15\40-\176')
NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"

# ── Guaranteed notification ───────────────────────────────────────────────────
# ntfy must fire on EVERY run. Success sends from the trap too; a set -e abort
# or signal sends a failure notification naming the step that died.
STEP="init"
VERSION=""
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
    notify "Deployed ${VERSION:-?}" "rocket" "Version: ${VERSION:-?}
$MSG
Deployer: ${DEPLOYER:-unknown} | IP: ${IP:-unavailable}
${TIMESTAMP:-$(date '+%Y-%m-%d %H:%M:%S %Z')}
Vercel:  ${VERCEL_URL}
Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/
GitHub:  ${GHPAGES_URL}"
  else
    notify "Deploy FAILED ${VERSION:-(pre-version)}" "rotating_light" "FAILED at step: $STEP (exit $code)
$MSG
Deployer: ${DEPLOYER:-unknown} | $(date '+%Y-%m-%d %H:%M:%S %Z')
Targets may be partially deployed - check and re-run ./deploy-nobump.sh if needed."
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

# 1. Run tests
STEP="tests"
echo "Running tests..."
npx vitest run --reporter=dot

# 2. Build
STEP="build"
echo "Building..."
npx vite build

STEP="version-bump"
# 3. Bump build letter — roll the patch version when the letter saturates at 'z'
# (a→b … y→z, then z → patch+1 letter 'a'), so tags/releases never collide again.
CURRENT=$(node -p "require('./package.json').buildLetter")
if [ "$CURRENT" = "z" ]; then
  NEWVER=$(node -p "const [a,b,c]=require('./package.json').version.split('.'); [a,b,(+c+1)].join('.')")
  NEXT="a"
  sed -i "s/\"version\": \"[0-9.]*\"/\"version\": \"$NEWVER\"/" package.json
else
  NEXT=$(echo "$CURRENT" | tr 'a-y' 'b-z')
fi
sed -i "s/\"buildLetter\": \"$CURRENT\"/\"buildLetter\": \"$NEXT\"/" package.json
VERSION=$(node -p "'v'+require('./package.json').version+require('./package.json').buildLetter")
echo "Version: $VERSION"

# 4. Get deployer info
STEP="deployer-info"
DEPLOYER=$(git config user.name 2>/dev/null || echo "unknown")
IP=$(curl -s ifconfig.me 2>/dev/null || curl -s api.ipify.org 2>/dev/null || echo "unavailable")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# 5. Append to deploy log
STEP="deploy-log"
node -e "
const fs = require('fs');
const log = JSON.parse(fs.readFileSync('public/deploy-log.json','utf8'));
log.push({ version:'$VERSION', message:\`$MSG\`, deployer:'$DEPLOYER', ip:'$IP', time:'$TIMESTAMP' });
fs.writeFileSync('public/deploy-log.json', JSON.stringify(log, null, 2));
"

# 6. Commit & push
STEP="commit-push"
git add -A
git commit -m "$MSG ($VERSION)"
git push origin AllRepo

# 7. Create zip using git archive (avoids file locks)
STEP="zip"
ZIPNAME="cli-dashboards-${VERSION}.zip"
echo "Creating ${ZIPNAME}..."
git archive --format=zip --prefix="cli-dashboards-${VERSION}/" -o "/tmp/${ZIPNAME}" HEAD

# 8. Create GitHub release + upload zip
STEP="github-release"
echo "Creating GitHub release ${VERSION}..."
CRED=$(git credential fill 2>/dev/null << CREDEOF | grep password | cut -d= -f2
protocol=https
host=github.com

CREDEOF
)
git tag "$VERSION" 2>/dev/null || true
git push origin "$VERSION" 2>/dev/null || true

RELEASE_JSON=$(curl -s -X POST "https://api.github.com/repos/${REPO}/releases" \
  -H "Authorization: token $CRED" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"tag_name\":\"${VERSION}\",\"name\":\"CLI Dashboards ${VERSION}\",\"body\":\"${MSG}\",\"draft\":false,\"prerelease\":false}")
RELEASE_ID=$(echo "$RELEASE_JSON" | node -p "JSON.parse(require('fs').readFileSync(0,'utf8')).id" 2>/dev/null || echo "")

if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "undefined" ]; then
  echo "Uploading ${ZIPNAME} to release..."
  curl -s -X POST "https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=${ZIPNAME}" \
    -H "Authorization: token $CRED" \
    -H "Content-Type: application/zip" \
    --data-binary "@/tmp/${ZIPNAME}" > /dev/null
  echo "Zip uploaded to GitHub release."
else
  echo "Warning: Could not create release. Skipping zip upload."
fi

STEP="vercel"
# 9a. Deploy to both Vercel projects (skipped when the CLI is not authenticated —
# the push to AllRepo auto-deploys gamma via Vercel's Git integration anyway)
if vercel whoami > /dev/null 2>&1; then
  echo "Deploying to Vercel (gamma)..."
  vercel link --yes --project cli-dashboards
  vercel --prod --yes --force
  echo "Deploying to Vercel (v200n)..."
  vercel link --yes --project cli-dashboards-v2.0.0n
  vercel --prod --yes --force
else
  echo "Vercel CLI not authenticated — skipping CLI deploys (gamma still auto-deploys from the AllRepo push)."
fi

STEP="droplet"
# 9b. Deploy to DigitalOcean droplet (static — the Express proxy was excised in
# E2; the SPA has no client-side routing, so a plain static server suffices and
# connectors call the authed Laravel /data proxy on app.cardinalfund.com).
echo "Deploying to droplet ${DROPLET_HOST}..."
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "cd ${DROPLET_PATH} && git pull origin AllRepo && npm install && APP_BASE=/CLI_Dashboards/ npx vite build && rm -rf /root/www && mkdir -p /root/www && ln -sfn ${DROPLET_PATH}/dist /root/www/CLI_Dashboards"
# Restart the static server via its systemd unit (cli-dash.service: python3
# http.server on :8000 serving /root/www, Restart=always, enabled at boot).
# systemd owns the process so it survives the SSH close, crashes and reboots —
# the earlier bare-nohup/setsid-over-ssh approach flapped (E2 droplet, 2026-07-12).
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no root@${DROPLET_HOST} \
  "systemctl restart cli-dash.service; sleep 2; systemctl is-active cli-dash.service && echo 'droplet: cli-dash active on :8000' || echo 'droplet: WARNING cli-dash not active'"
echo "Droplet deployed."

# 9c. Deploy to GitHub Pages (needs separate build with /CLI_Dashboards/ base)
STEP="gh-pages"
echo "Deploying to GitHub Pages..."
GHPAGES_DIR="ghpages-out"
rm -rf "$GHPAGES_DIR"
# MSYS_NO_PATHCONV prevents Git Bash from mangling the --base path on Windows
MSYS_NO_PATHCONV=1 npx vite build --base="/CLI_Dashboards/" --outDir="$GHPAGES_DIR" --emptyOutDir
# Copy 404.html for SPA client-side routing on GitHub Pages
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

# 10. Notify via ntfy.sh (shows on status page instantly). The EXIT trap
# (on_exit) sends it, so it fires on success AND on any failure/abort —
# do not add a bare curl back here.
STEP="done"

echo ""
echo "Done! $VERSION is live on all targets."
echo "Vercel:  ${VERCEL_URL}"
echo "Vercel2: ${VERCEL_URL2}"
echo "Droplet: http://${DROPLET_HOST}:8000/CLI_Dashboards/"
echo "GitHub:  ${GHPAGES_URL}"
echo "Release: https://github.com/${REPO}/releases/tag/${VERSION}"
echo "Status:  ${VERCEL_URL}/status.html"
