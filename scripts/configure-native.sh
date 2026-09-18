#!/usr/bin/env bash
set -euo pipefail

ANDROID_MANIFEST="android/app/src/main/AndroidManifest.xml"
IOS_PLIST="ios/AttendanceSystem/Info.plist"

if [[ ! -f "$ANDROID_MANIFEST" || ! -f "$IOS_PLIST" ]]; then
  echo "Native folders are missing. Run: npm run bootstrap:native"
  exit 1
fi

python3 - <<'PY'
from pathlib import Path
p=Path('android/app/src/main/AndroidManifest.xml')
s=p.read_text()
perm='    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />\n    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />\n'
if 'android.permission.ACCESS_FINE_LOCATION' not in s:
    s=s.replace('<manifest xmlns:android="http://schemas.android.com/apk/res/android">', '<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n'+perm)
key='${GOOGLE_MAPS_API_KEY:-}'
if key:
    pass
p.write_text(s)
PY
if [[ -n "${GOOGLE_MAPS_API_KEY:-}" ]]; then
  python3 - <<'PY'
import os
from pathlib import Path
p=Path('android/app/src/main/AndroidManifest.xml')
s=p.read_text()
meta=f'        <meta-data android:name="com.google.android.geo.API_KEY" android:value="{os.environ["GOOGLE_MAPS_API_KEY"]}" />\n'
if 'com.google.android.geo.API_KEY' not in s:
    s=s.replace('</application>', meta+'    </application>')
p.write_text(s)
PY
fi

/usr/libexec/PlistBuddy -c "Add :NSLocationWhenInUseUsageDescription string 'Attendance System uses your location to determine whether you are within the configured 100 meter office geofence.'" "$IOS_PLIST" 2>/dev/null || true

echo "Native location configuration applied."
