#!/usr/bin/env bash
set -euo pipefail

APP_NAME="AttendanceSystem"
TMP_DIR=".native-template"

if [[ -d android || -d ios ]]; then
  echo "android/ or ios/ already exists. Nothing to bootstrap."
  exit 0
fi

rm -rf "$TMP_DIR"
echo "Generating React Native CLI native projects..."
npx @react-native-community/cli@latest init "$APP_NAME" --version 0.86.0 --skip-install --directory "$TMP_DIR"
cp -R "$TMP_DIR/android" ./android
cp -R "$TMP_DIR/ios" ./ios
cp "$TMP_DIR/gradle.properties" ./gradle.properties 2>/dev/null || true
cp "$TMP_DIR/gradlew" ./gradlew 2>/dev/null || true
cp "$TMP_DIR/gradlew.bat" ./gradlew.bat 2>/dev/null || true
cp "$TMP_DIR/gradle" ./gradle 2>/dev/null || true
rm -rf "$TMP_DIR"

echo "Native projects created. Installing project dependencies is next."
./scripts/configure-native.sh || true
echo "Native projects created. Run npm install, then cd ios && pod install (iOS), then npm run android/npm run ios."
