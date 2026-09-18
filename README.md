# Attendance System — React Native CLI

Frontend-only geolocation attendance technical assignment implemented with React Native CLI + TypeScript.

## Requirements

- React Native CLI (not Expo)
- Node.js 20+
- Android Studio / Android SDK for Android
- Xcode + CocoaPods for iOS

## Features

- Real-time foreground location tracking
- Interactive office map
- Configurable company/building details
- Tap-to-select building location
- Use current location for building setup
- Fixed 100m geofence
- Check-in only while inside the geofence
- Local attendance history with MMKV
- Searchable attendance history
- Location permission handling
- GPS/location-services error handling
- Offline state handling
- Error Boundary
- Absolute imports (`@globalComponents`, `@services`, etc.)

## Installation

```bash
npm install
```

If the repository was delivered without generated native folders, bootstrap them once:

```bash
npm run bootstrap:native
```

Then install iOS pods:

```bash
cd ios && pod install && cd ..
```

Run Metro:

```bash
npm start
```

Run Android:

```bash
npm run android
```

Run iOS:

```bash
npm run ios
```

## Google Maps

For Android, add your Google Maps API key to `android/app/src/main/AndroidManifest.xml` as a `com.google.android.geo.API_KEY` meta-data entry. For iOS, add the key through `GMSServices.provideAPIKey(...)` in `AppDelegate` if using Google Maps on iOS.

Apple Maps can be used on iOS without a Google Maps key if the map provider is left at the default.

## Architecture

```text
src/
├── components/
│   ├── Map/
│   └── global/
├── contexts/
├── hooks/
├── navigation/
├── screens/
│   ├── Attendance/
│   ├── Configuration/
│   └── History/
├── services/
├── storage/
├── theme/
├── types/
└── utils/
```

Persistence is deliberately isolated behind repositories so UI components do not depend directly on MMKV.
