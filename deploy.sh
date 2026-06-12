#!/usr/bin/env bash
# deploy.sh — test, build, bump, commit, push, zip, release, deploy, notify.
# Usage: ./deploy.sh "what you changed"
set -e

cd "$(dirname "$0")"
MSG="${1:-Update}"
NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"
REPO="Safename321/CLI_Dashboards"

# 1. Run tests
echo "Running tests..."
npx vitest run --reporter=dot

# 2. Build
echo "Building..."
npx vite build

# 3. Bump build letter
CURRENT=$(node -p "require('./package.json').buildLetter")
NEXT=$(echo "$CURRENT" | tr 'a-y' 'b-z')
sed -i "s/\"buildLetter\": \"$CURRENT\"/\"buildLetter\": \"$NEXT\"/" package.json
VERSION=$(node -p "'v'+require('./package.json').version+require('./package.json').buildLetter")
echo "Version: $VERSION"

# 4. Get deployer info
DEPLOYER=$(git config user.name 2>/dev/null || echo "unknown")
IP=$(curl -s ifconfig.me 2>/dev/null || curl -s api.ipify.org 2>/dev/null || echo "unavailable")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S %Z')

# 5. Append to deploy log
node -e "
const fs = require('fs');
const log = JSON.parse(fs.readFileSync('public/deploy-log.json','utf8'));
log.push({ version:'$VERSION', message:\`$MSG\`, deployer:'$DEPLOYER', ip:'$IP', time:'$TIMESTAMP' });
fs.writeFileSync('public/deploy-log.json', JSON.stringify(log, null, 2));
"

# 6. Commit & push
git add -A
git commit -m "$MSG ($VERSION)"
git push origin AllRepo

# 7. Create zip (exclude .git, node_modules, dist, .env)
ZIPNAME="cli-dashboards-${VERSION}.zip"
ZIPPATH="/tmp/${ZIPNAME}"
echo "Creating ${ZIPNAME}..."
powershell.exe -Command "
  \$src = (Get-Location).Path
  if (Test-Path '$ZIPPATH') { Remove-Item '$ZIPPATH' }
  \$items = Get-ChildItem -Path \$src -Exclude '.git','node_modules','dist','.env'
  Compress-Archive -Path \$items.FullName -DestinationPath 'C:\tmp\${ZIPNAME}' -Force
"

# 8. Create GitHub release + upload zip
echo "Creating GitHub release ${VERSION}..."
CRED=$(git credential fill <<EOF 2>/dev/null | grep password | cut -d= -f2
protocol=https
host=github.com

EOF
)
git tag "$VERSION" 2>/dev/null || true
git push origin "$VERSION" 2>/dev/null || true

RELEASE_JSON=$(curl -s -X POST "https://api.github.com/repos/${REPO}/releases" \
  -H "Authorization: token $CRED" \
  -H "Accept: application/vnd.github+json" \
  -d "{\"tag_name\":\"${VERSION}\",\"name\":\"CLI Dashboards ${VERSION}\",\"body\":\"${MSG}\",\"draft\":false,\"prerelease\":false}")
RELEASE_ID=$(echo "$RELEASE_JSON" | node -p "JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')).id")

if [ -n "$RELEASE_ID" ] && [ "$RELEASE_ID" != "undefined" ]; then
  echo "Uploading ${ZIPNAME} to release..."
  curl -s -X POST "https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=${ZIPNAME}" \
    -H "Authorization: token $CRED" \
    -H "Content-Type: application/zip" \
    --data-binary "@C:/tmp/${ZIPNAME}" > /dev/null
  echo "Zip uploaded to GitHub release."
else
  echo "Warning: Could not create release (may already exist). Skipping zip upload."
fi

# 9. Deploy to Vercel
vercel --prod --yes

# 10. Notify via ntfy.sh (shows on status page + push notification)
curl -s -X POST "$NTFY_TOPIC" \
  -H "Title: Deployed $VERSION" \
  -H "Tags: rocket" \
  -d "Version: $VERSION
$MSG
Deployer: $DEPLOYER | IP: $IP
$TIMESTAMP
https://cli-dashboards-gamma.vercel.app" > /dev/null

echo ""
echo "Done! $VERSION is live."
echo "Release: https://github.com/${REPO}/releases/tag/${VERSION}"
echo "Status:  https://cli-dashboards-gamma.vercel.app/status.html"
