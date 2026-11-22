# AniLink demo script

**Setup (before the audience arrives)**

1. MongoDB service running; open Compass on `mongodb://127.0.0.1:27017`, database `anilink`.
2. `cd server && npm run seed && npm run dev` (note the LAN address it prints).
3. **Emulator** = the farmer (`farmer@anilink.demo`). **Phone** = the buyer (`buyer@anilink.demo`). Password for both: `anilink123`.
4. On the phone: welcome screen → gear → enter `http://<PC-LAN-IP>:4000` → *Test connection* → *Save*.
5. If venue Wi-Fi blocks device-to-device traffic: use the phone's hotspot and connect the PC to it.
6. Keep both apps open. To show notifications, **press Home** (don't swipe the app away).

## Flow (about 12 minutes)

| # | Say / do | Where | What the audience sees |
|---|----------|-------|------------------------|
| 1 | Cold start the phone app | Phone | Native splash → animated AniLink logo → welcome (EN/TL toggle, gear) |
| 2 | Toggle **TL**, then back to **EN** | Phone | Whole UI switches language |
| 3 | **Continue with Google** → pick an account | Phone | Google-style chooser, logo loader, signed in → onboarding (role, profile, barangay, notification permission). Then **Profile → Log out** to continue as the seeded buyer |
| 4 | Log in as **buyer@anilink.demo** (log out first if needed) | Phone | Buyer home: categories, fresh this week, near you, upcoming harvests, price-guide teaser, verified farmers |
| 5 | Open **Explore**, filter *Fruits* + *Delivery*, switch to **Map** | Phone | Filters, sort, list/map toggle, pins with prices |
| 6 | Open *Carabao Mangoes* → heart it → price-guide badge, seller card, mini map | Phone | Listing detail |
| 7 | **Message** → quick reply "Last price?" | Phone | Chat; keyboard keeps the composer visible; typing dots on the farmer's emulator |
| 8 | Farmer replies on the emulator | Emulator | Instant delivery both ways, read ticks |
| 9 | Buyer taps the **tag** icon → *Send offer* (₱120 × 10 kg, delivery) | Phone | Offer card in chat |
| 10 | Farmer **Counter**s (₱128), buyer **Accept**s | Emulator/Phone | Negotiation history stays in the chat, order created card |
| 11 | Buyer **View order → Pay now** → E-wallet A → MPIN → receipt | Phone | Processing loader, receipt with reference |
| 12 | Farmer: *Mark as preparing* → *Out for delivery* (buyer app on Home screen) | Emulator | **System notification** on the phone; tap it → opens the order; rider moves on the map |
| 13 | Farmer: *Mark as completed*; buyer **Leave a review** | Both | Rating appears on the seller profile |
| 14 | Farmer **Profile → Verification** → add two photos → submit | Emulator | "Under review" spinner → ~30 s later a notification and the verified badge |
| 15 | Buyer **Profile → Harvest alerts** → alert for "mango" ≤ ₱150; farmer posts *Mango* listing | Both | Buyer gets a "Harvest alert" notification |
| 16 | **Settings** → Theme: Light / Dark / System | Phone | Light mode and the Fieldlink-style dark mode |
| 17 | Compass → refresh `orders`, `messages`, `offers`, `notifications` | PC | The data created during the demo |

## If something goes wrong

- *Offline banner on the phone*: tap **Server address**, re-enter the PC address, **Test connection**.
- *Data got messy*: `cd server && npm run seed` resets everything (restart the apps).
- *No notification*: Android Settings → Apps → AniLink → Notifications must be allowed; keep the app in the background, not swiped away.
