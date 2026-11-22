# AniLink — Design (brainstorming output)

> After approval, this design is copied to `Application/docs/superpowers/specs/2026-11-21-anilink-design.md`, then an implementation plan is written (superpowers:writing-plans).

## Context / intent
AniLink is a mobile marketplace that connects **local farmers and local buyers in Zamboanga City, Philippines**, so they can list, find, and **negotiate** over fruits, vegetables, and crafts. It's like Facebook Marketplace, but built for farm trade: structured offers, verified sellers, price guidance, and order tracking.
**Why:** a **presentation prototype**. It runs locally (Android Studio emulator + one physical phone) and shows every feature live. Features that need cloud services become **interactive facades** that look and behave real.

## Goals
- A polished, demo-ready Android app with every feature listed below working end-to-end on local infrastructure.
- **Two-device live demo:** emulator (e.g. Farmer) and phone (e.g. Buyer). Chat, offers, orders and notifications sync in real time through a server on the presenter's PC.
- Data visible live in **MongoDB Compass** (the MongoDB Windows service is already running locally).
- Dark theme matching the Fieldlink reference, plus a light mode. Poppins font. AniLink logos.

## Non-goals
- Production deployment, real payments, real Google OAuth, real ID verification, App Store/Play Store release, iOS polish (Android first; iOS untested).
- Scalability, security hardening beyond basic hashed passwords + JWT.

## Anti-goals (failure even if it "works")
- Demo stalls: blank screens, spinners with no logo, crashes when switching devices, a keyboard covering inputs.
- Facades that look obviously fake or break mid-flow.
- Visual drift from the reference theme.

## Constraints
- Stack: React Native + Expo (latest SDK) + Expo Router, TypeScript; local storage on device (AsyncStorage); MongoDB (local service, viewed with Compass).
- Node 24 / npm 11 installed; Android SDK present; MongoDB service running.
- A phone app can't talk to MongoDB directly, so a **local Node server** sits between them.
- The phone and the PC must be on the same Wi-Fi. The server binds to `0.0.0.0:4000`, and Windows Firewall must allow that port.
- Logos: `Application/logos/app-loading-logo.png` (mark + "ANILINK" wordmark → splash/loading), `Application/logos/homescreen-logo.png` (circle mark → app icon, in-app loaders, headers).

## Approaches (decided)
| | Approach | Trade-off |
|---|---|---|
| **A ✅ chosen** | **Expo development build** (`npx expo run:android`) + local **Express + Socket.IO + Mongoose** server | Real AniLink icon and native splash, full notification channel, installable APK for the second phone. The first native build takes about 10–15 minutes. |
| B | Expo Go + same server | No build step, but Expo branding on the splash and icon, and limited notifications. Rejected. |
| C | On-device storage only | Can't sync two devices and leaves MongoDB out. Dropped. |

## Decisions made by the user
- Two devices, live sync.
- Advanced features: **structured offers in chat**, **verified farmers & ratings**, **price guide & harvest alerts**, **map + delivery + payment facade**. All four included.
- Roles: **picked at signup (Farmer/Buyer), switchable in profile**. Farmer mode gets a seller dashboard; Buyer mode gets a shopping-first home.
- Language: **English default, toggle to Tagalog** (i18n).
- Approach A.

## Design

### Repo layout
```
Application/
  logos/                (existing)
  mobile/               Expo app (expo-router, TS)
  server/               Express + Socket.IO + Mongoose API, seed script, /uploads
  docs/superpowers/specs/
```

### Theme (tokens from reference)
Dark (default):
- bg `#1F1E1B`, surface `#272622`, card `#161614`, border `#34322D`
- primary `#1E4A3D` (buttons), primaryText `#C9E8D6`, headline mint `#BEE3CF`, eyebrow green `#6FBF8E`
- accent orange `#E8834A`, sun yellow `#F0C04B`, mustard `#A8873A`
- text `#ECE8E0`, muted `#9E998F`, section green `#1A3F36`, deep green `#0F2E28`
- category tints: tomato `#4A2E28`, banana `#3D2E14`, leafy `#2E3D2E`, mango `#3D3608`

Light: bg cream `#F6F3EC`, surface `#FFFFFF`, primary `#1E5A45`, headline `#1B4D3E`, accent `#D9702F`, text `#1F1E1B`, muted `#6B675E`, same tint hues lightened.

Style cues from the reference: uppercase letter-spaced eyebrow labels (e.g. "GAWANG LOKAL. PARA SA BAYAN."), pill chips, rounded 20–24px cards with a colored produce header and a dark body, big price with a small unit ("₱82/kg"), stat tiles, and the yellow sun circle as a decorative accent. Theme mode: System / Dark / Light, persisted. Font: Poppins (400/500/600/700) via `@expo-google-fonts/poppins`, used everywhere.

### App shell & basics
- **Native splash:** `app-loading-logo.png` on a themed background. It hands off to an **animated logo splash** (fade/scale) while fonts, session and theme load.
- **Loading:** a shared `<LogoLoader>` (circle mark + spinner ring) for blocking processes, skeleton placeholders for lists, pull-to-refresh, toasts, haptics, and an offline/server-unreachable banner with retry.
- **Navigation:** Expo Router. Auth stack → onboarding → bottom tabs: **Home, Explore, Sell (+), Messages, Profile**, with native stack transitions.
- **Keyboard:** `react-native-keyboard-controller`. Forms use `KeyboardAwareScrollView`, so the focused input scrolls into view. The chat composer is sticky to the keyboard. Android uses `softwareKeyboardLayoutMode: resize`. The next/return key moves between fields, and tapping outside dismisses the keyboard.
- **i18n:** `i18next` with `en` and `tl` resource files. Toggle in Settings, persisted.

### Auth & onboarding
- Email + password sign up and log in (bcrypt + JWT, token kept in AsyncStorage → auto-login).
- **"Continue with Google" facade:** a Google-style account-chooser bottom sheet with demo accounts and "Use another account". Picking one creates or logs into that user on the server.
- **Phone OTP facade:** the code arrives as a local notification, then is entered in a 6-box OTP input.
- Onboarding: pick a role (Farmer/Buyer) → name, photo (image picker), barangay (Zamboanga barangay list) → farm details for farmers.
- Forgot password: facade (the reset code arrives as a notification).

### Marketplace
- **Categories:** Vegetables (Gulay), Fruits (Prutas), Leafy (Dahon), Root crops, Rice & grains, Crafts (Gawang-kamay), Others.
- **Create/edit listing:** up to 5 photos, title, category, price, unit (kg / piece / tali / sack / dozen), stock quantity, harvest date, **pre-order** flag for upcoming harvests, negotiable toggle, minimum order, pickup and/or delivery, barangay location. Listings can be marked sold out, paused, or deleted.
- **Home (Buyer):** greeting, search, category chips, "Fresh this week", "Near you", "Upcoming harvests", "Verified farmers", price-guide teaser.
- **Home (Farmer):** dashboard with stats (active listings, pending offers, orders, earnings this month, views), quick actions, recent offers.
- **Explore:** search with filters (category, price range, barangay/distance, verified only, pre-order, delivery available) and sort (newest, price, nearest, top rated). A list/map toggle switches to the map view.
- **Listing detail:** image carousel and fullscreen viewer, price with a **price-guide badge** ("₱6 below Zamboanga avg"), stock, harvest date, seller card (verified badge, rating, response time), location mini-map, and "Message", "Make offer", favorite, share (native share sheet), and report.
- Favorites, recently viewed, and seller public profiles (listings + reviews).

### Messaging & negotiation (real-time via Socket.IO)
- Conversation list with unread badges and last-message preview. Each chat is tied to a listing (listing chip pinned at the top).
- Messages: text, images, quick replies ("Available pa ba?", "Last price?"), typing indicator, sent/read receipts.
- **Offer cards inside the chat:** price per unit, quantity, delivery method, preferred date. The other party sees **Accept / Counter / Decline**. A counter creates a new card and marks the previous one superseded. The negotiation history stays visible.
- An accepted offer turns into an **Order**.

### Orders, delivery, payment (facades where needed)
- Order statuses: `pending_payment → paid → preparing → ready_for_pickup | out_for_delivery → completed` (plus `cancelled`), shown as a timeline. The farmer advances the status, and each change notifies the buyer.
- **Payment facade:** choose GCash-style e-wallet, Maya-style e-wallet, bank, or Cash on pickup/delivery → mock wallet screen (number + MPIN) → processing loader → receipt with a reference number. Generic wallet styling only, no real brand logos.
- **Delivery facade:** at "out for delivery", a mock rider is assigned and shown moving along a simulated route on the map.
- After completion, the buyer is prompted to leave a **review**.

### Trust
- **Verification facade:** the farmer uploads an ID photo and a farm photo and sees "Under review". The server auto-approves after about 30 seconds and sends a notification, and the verified badge appears.
- Reviews (1–5 stars + text, one per order), average rating, completed-order count, response rate. Report and block user.

### Price guide & harvest alerts
- **Price guide screen:** seeded reference prices per crop for Zamboanga City markets, with low/avg/high and an 8-week trend sparkline. Each crop links to its current listings.
- **Harvest alerts:** "Notify me" on a crop (optional max price and barangay). When a farmer posts a matching listing, the server notifies subscribed buyers.

### Map
- A Leaflet + OpenStreetMap map inside `react-native-webview` (no API key needed), centered on Zamboanga City. Sellers and listings are pinned by barangay coordinates. Tapping a pin opens a preview card.

### Notifications
- An in-app **notification center** (stored in MongoDB) for offers, messages, order updates, verification, harvest alerts, and price drops.
- **System notifications** via `expo-notifications`, with an Android "AniLink" channel (high importance, sound, AniLink icon). Socket events are turned into local notifications while the app is in the foreground or background (socket kept alive). Scheduled notifications (pickup reminders, harvest-date reminders, OTP) fire even when the app is closed. Tapping a notification deep-links to the right screen.
- **Decided (user):** background delivery is enough; **no Firebase**. If the app is swiped away, live messages from the other device won't arrive. The demo script presses Home instead of swiping the app away.

### Profile & settings
- Edit profile, switch role (Farmer ⇄ Buyer), my listings, orders (buying/selling tabs), favorites, saved alerts, reviews, and verification status.
- Settings: theme, language (EN/TL), notification toggles, help/FAQ, about, and log out.

### Server (`Application/server`)
- Express REST + Socket.IO + Mongoose. DB `anilink` at `mongodb://127.0.0.1:27017`. Image uploads via multer to `/uploads`, served statically.
- Collections: `users`, `listings`, `conversations`, `messages` (type: text | image | offer | system), `offers`, `orders`, `reviews`, `notifications`, `priceguides`, `alerts`, `reports`.
- Socket rooms per user and per conversation. Events: `message:new`, `typing`, `message:read`, `offer:update`, `order:update`, `notification:new`.
- `npm run seed`: about 8 Zamboanga farmers (real barangays such as Tumaga, Pasonanca, Talisayan, Vitali, Ayala, Mercedes, Culianan, Manicahan), about 3 buyers, about 40 listings with bundled produce images, price-guide data, and some reviews and orders. Two ready-made demo logins (farmer + buyer) for the presentation.
- The mobile app reads the server URL from `EXPO_PUBLIC_API_URL` (the PC's LAN IP, used by both the emulator and the phone).

## Calls made by Claude (after builder check) — check these
- **Build order:** no hard deadline, so everything is built. The demo-script path still comes first: auth → browse → chat → offer → order → pay → review.
- **Phone runs a release APK** with the JS bundled in (`npx expo run:android --variant release`), so the phone doesn't need Metro. The emulator can use either a debug or release build.
- **The server address can be edited in the app:** a gear icon on the login screen and in Settings → "Server address". It's saved in AsyncStorage and pre-filled from `EXPO_PUBLIC_API_URL`. There's also a "Test connection" button, and the server's startup log prints its LAN IP. Fallback if the venue Wi-Fi blocks devices from seeing each other: a phone hotspot with the PC connected to it.
- **Map works offline:** Leaflet JS/CSS is bundled in the app, not loaded from a CDN. OSM tiles load when there's internet; with no internet, a bundled illustrated Zamboanga map image is the base layer, so pins, the rider route, and mini-maps still render.
- **Price-guide numbers** are realistic ranges based on typical Philippine retail prices, and labeled "Sample data" in the app.
- **Visual reference** = the 4 Fieldlink screenshots shared in chat (hero with eyebrow and big two-tone headline, pill chips, produce cards with a tinted top and emoji-style produce art, a dark green "how it works" section with numbered steps, stat tiles, and the yellow sun circle). Mobile screens adapt those patterns. The headline uses Poppins SemiBold/Bold in mint, and an accent line in orange.

## Left to the builder
Component library structure, state management (React Query + Zustand suggested), exact animations, image assets for seeded produce (royalty-free or generated illustrations bundled locally), icon set (lucide-react-native or @expo/vector-icons), copy, and the exact Tagalog strings.

## Verification
1. `cd Application/server && npm run seed && npm run dev` → check in Compass that the `anilink` collections are populated.
2. `cd Application/mobile && npx expo run:android` on the emulator → the native splash shows the AniLink logo, then the animated splash.
3. Install the same debug APK on the physical phone (same Wi-Fi), log in as the demo buyer there and the demo farmer on the emulator.
4. Demo script: buyer browses → favorites → messages the farmer (live) → sends an offer → farmer counters → buyer accepts → pays via the facade → farmer advances the status → notifications appear on the buyer's device while it is backgrounded → buyer reviews. Then verification, a harvest alert match, the map, the price guide, theme and language toggles, and keyboard behavior in chat and forms.
5. Check that new data appears in Compass as it happens.
