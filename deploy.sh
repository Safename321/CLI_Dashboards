#!/usr/bin/env bash
# deploy.sh — build, test, bump version, commit, push, deploy, log.
# Usage: ./deploy.sh "what you changed"
set -e

cd "$(dirname "$0")"
MSG="${1:-Update}"
NTFY_TOPIC="https://ntfy.sh/clidash-3dd4654f0f939b8cc5"

# 1. Run tests
echo "Running tests..."
npx vitest run --reporter=dot

# 2. Build
echo "Building..."
npx vite build

# 3. Bump build letter (e.g. g -> h)
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

# 7. Deploy
vercel --prod --yes

# 8. Notify via ntfy.sh (free, no account needed)
curl -s -X POST "$NTFY_TOPIC" \
  -H "Title: CLI Dashboards deployed $VERSION" \
  -H "Tags: rocket" \
  -d "Version: $VERSION | $MSG
Deployer: $DEPLOYER | IP: $IP
$TIMESTAMP" > /dev/null

echo ""
echo "Done! $VERSION is live."
echo "Status page: https://cli-dashboards-gamma.vercel.app/status.html"
