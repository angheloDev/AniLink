# AniLink

A prototype mobile marketplace that connects **local farmers and local buyers in Zamboanga City**. Think Facebook Marketplace, built for farm trade: structured offers inside chat, verified sellers, a price guide, harvest alerts and order tracking.

It is a **local demo**. Everything runs on your PC and your devices. Things that would normally need cloud services (Google sign-in, payments, ID verification, delivery tracking) are interactive facades.

```
Application/
  server/    Node + Express + Socket.IO + MongoDB (Mongoose) API
  mobile/    Expo (React Native, Expo Router, TypeScript) Android app
  logos/     The AniLink logos (source of the app icon and splash)
  docs/      Design, implementation plan, demo script
```

## What you need

- Node 20+ and npm
- MongoDB running locally on the default port (the Windows service is fine). Open **MongoDB Compass** and connect to `mongodb://127.0.0.1:27017` to watch the data.
- Android Studio (SDK + an emulator). JDK 17+ — Android Studio's bundled JBR works:
  `set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr`
- A phone and the PC on the **same Wi-Fi** (or the phone's hotspot) for the two-device demo.

## 1. Start the server

```bash
cd server
npm install
npm run seed      # drops and recreates the `anilink` database with demo data
npm run dev       # listens on 0.0.0.0:4000 and prints your LAN address(es)
```

The seed creates 8 farmers, 3 buyers, 43 listings, a price guide, reviews, orders and one chat.
**Demo logins** (password `anilink123`):

| Role   | Email                  |
| ------ | ---------------------- |
| Farmer | `farmer@anilink.demo`  |
| Buyer  | `buyer@anilink.demo`   |

Let the phone reach the server: run `scripts/open-firewall.ps1` **once, as Administrator** (it opens TCP 4000 inbound).

## 2. Run the app

```bash
cd mobile
npm install
```

**Emulator** (reaches the PC at `10.0.2.2`, which is the default):

```bash
npx expo run:android
```

**Physical phone** — build a release APK (the JavaScript is bundled inside, so Metro is not needed) and install it with the phone connected over USB or by sharing the APK file:

```bash
npx expo run:android --variant release --device
```

Then on the phone open AniLink, tap the **gear icon** on the welcome screen, enter `http://<PC-LAN-IP>:4000` (the server prints it on start), tap **Test connection**, then **Save**. The address is remembered, so a different Wi-Fi only needs this one step.

> The first native build downloads Gradle, Maven packages and the NDK. On a slow connection this takes a long time; later builds are fast.

## 3. Checks

```bash
cd server && npm test          # 86 tests against the anilink_test database
cd mobile && npm test          # 134 unit tests
cd mobile && npm run typecheck
cd server && npm run typecheck
```

## Things worth knowing

- **Notifications** appear while the app is open or in the background (press Home). A fully swiped-away app does not receive live notifications from the other device (that would need Firebase, which this prototype deliberately avoids). Scheduled reminders (pickup/delivery/harvest day) do fire when the app is closed.
- **Map**: Leaflet is bundled in the app. With internet it shows OpenStreetMap tiles; without it, a plain canvas with barangay labels and the same pins.
- **Language**: English by default; switch to Tagalog on the welcome screen or in Settings. Theme: System / Dark / Light in Settings.
- Sample prices in the Price Guide are labelled "Sample data".
- `docs/demo-script.md` is a step-by-step presentation flow.
