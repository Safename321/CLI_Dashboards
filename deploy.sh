#!/usr/bin/env bash
# deploy.sh — build, test, bump version, commit, push, deploy.
# Usage: ./deploy.sh "what you changed"
set -e

cd "$(dirname "$0")"
MSG="${1:-Update}"

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

# 4. Commit & push
git add -A
git commit -m "$MSG ($VERSION)"
git push origin AllRepo

# 5. Deploy
vercel --prod --yes

echo ""
echo "Done! $VERSION is live."
