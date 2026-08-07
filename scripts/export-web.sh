#!/usr/bin/env bash
# Export all dispensary templates as static SPA web builds into docs/
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_NAME="${REPO_NAME:-dispotemplates}"
OUT="$ROOT/docs"

APPS=(
  amber-reserve
  obsidian-glow
  rose-noir
  ethereal-ghost
  emerald-crypt
  nebula-clinic
  luminous-botanical
  citrus-grove
  azure-bloom
)

rm -rf "$OUT"
mkdir -p "$OUT"

for app in "${APPS[@]}"; do
  echo "════════════════════════════════════════"
  echo " Exporting $app"
  echo "════════════════════════════════════════"
  cd "$ROOT/$app"

  npm install react-dom@19.2.3 react-native-web@^0.21.0 @expo/metro-runtime --save --silent

  node << NODE
const fs = require('fs');
const p = 'app.json';
const data = JSON.parse(fs.readFileSync(p, 'utf8'));
data.expo.experiments = data.expo.experiments || {};
data.expo.experiments.baseUrl = '/${REPO_NAME}/${app}';
data.expo.experiments.typedRoutes = true;
data.expo.web = data.expo.web || {};
data.expo.web.bundler = 'metro';
data.expo.web.output = 'single';
if (!data.expo.web.favicon) data.expo.web.favicon = './assets/favicon.png';
fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
console.log('baseUrl ->', data.expo.experiments.baseUrl);
NODE

  rm -rf dist-web
  EXPO_PUBLIC_SCREENSHOT_MODE=1 npx expo export --platform web --output-dir dist-web

  mkdir -p "$OUT/$app"
  rsync -a --delete dist-web/ "$OUT/$app/"
  cp "$OUT/$app/index.html" "$OUT/$app/404.html"
  rm -rf dist-web
  echo "✓ $app"
done

echo "All exports written to $OUT"
