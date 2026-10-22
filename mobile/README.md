# Naturalizer Ops

Private iOS and Android operations app for Naturalizer, built with Expo and React Native.

## Features

- Admin login using the existing Naturalizer admin accounts
- Bearer-token sessions stored in iOS Keychain / Android Keystore through `expo-secure-store`
- Orders dashboard with totals, search, and status filters
- Pull-to-refresh order list
- Order detail with full pricing, referral source, customer notes, and audit timeline
- Status updates recorded against the signed-in admin
- Quotes list with expiry state
- Account screen with API endpoint, version, and sign-out
- iOS and Android configuration with EAS build profiles

## API

The app talks to these production routes:

```text
POST  /api/mobile/login
GET   /api/mobile/me
GET   /api/mobile/orders
GET   /api/mobile/orders/:id
PATCH /api/mobile/orders/:id
GET   /api/mobile/quotes
```

All except login require `Authorization: Bearer <token>`. Tokens expire after 12 hours. The mobile app never contains the Supabase service role key.

The default API is:

```text
https://naturalizerplatform.vercel.app
```

To point the app at another deployment, set an Expo public environment variable:

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-preview-url.vercel.app npm run start
```

## Run locally

```bash
cd mobile
npm install
npm run start
```

Then scan the QR code with Expo Go, or press `i` / `a` for a local simulator or emulator.

Useful checks:

```bash
npm run typecheck
npx expo-doctor
npx expo export --platform ios
npx expo export --platform android
```

## Build for the App Store and Google Play

EAS Build produces signed binaries without requiring Xcode or Android Studio locally.

```bash
cd mobile
npx eas-cli@latest login
npx eas-cli@latest init
```

`eas init` links the app to an Expo account and writes the EAS project ID into `app.json`.

Build both platforms:

```bash
npx eas-cli@latest build --platform ios --profile production
npx eas-cli@latest build --platform android --profile production
```

Submit after the builds finish:

```bash
npx eas-cli@latest submit --platform ios --profile production
npx eas-cli@latest submit --platform android --profile production
```

You will need:

- An Apple Developer Program account for iOS signing and App Store submission
- A Google Play Console account for Android signing and Play Store submission
- An Expo account for EAS Build

The bundle identifier / package name is currently:

```text
com.naturalizer.ops
```

Change it in `app.json` before the first store upload if a different identifier is required. Store listings, screenshots, privacy declarations, and review notes still need to be prepared in App Store Connect and Google Play Console.

## Security notes

- Admin passwords are never stored on the device.
- Only the signed 12-hour bearer token is stored, using the device secure store.
- The login endpoint is rate-limited to 10 failed attempts per IP in a 10-minute window per server instance.
- The Supabase service role key stays server-side in Vercel.
- There is no offline order cache; the app always reads current server data.
- Signing out removes the token from the device.
