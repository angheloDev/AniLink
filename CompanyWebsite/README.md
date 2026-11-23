# AniLink company website

A one-page marketing site for AniLink, the marketplace for Zamboanga City farmers and local buyers. React + Vite + Tailwind. The look follows the Fieldlink reference (dark theme, serif headlines, mint and orange, yellow sun circle), with the AniLink logo.

Everything on the page is a **demo**: the store buttons fake a redirect, the phone screens are rebuilt in React so you can click them, and no data is collected or sent anywhere.

## Run it

```bash
cd CompanyWebsite
npm install
npm run dev        # development server (prints the local address)
npm test           # unit and interaction tests (Vitest)
npm run build      # type-check + production build into dist/
npm run preview    # serve the production build locally
```

Needs Node 20+ (built with Node 24).

## How the "download" facade works

Every store button (nav, hero, produce section, download band) opens one shared overlay: a short "Taking you to Google Play…" screen, then an "AniLink is coming soon" card with a QR code. Esc, the backdrop or **Close** dismisses it. Nothing leaves the page. When the app really is in a store, replace the `open()` behaviour in `src/lib/store.tsx` with a real link and swap `PLACEHOLDER_QR_URL` in `src/components/QrCard.tsx`.

## Placeholders to replace

These are clearly marked on the page and must be filled in before the site is public:

- **Contact details** in the footer: the email is `anilink@gmail.com` (`CONTACT_EMAIL` in `src/components/Footer.tsx`); the phone number and address are still placeholders (`footer.*` in `src/content/`).
- **About mission paragraph**: `about.mission` in `src/content/en.ts` and `tl.ts`.
- **Legal text** for the Privacy and Terms pop-ups: `legal.*` keys.
- **QR code target**: `PLACEHOLDER_QR_URL` in `src/components/QrCard.tsx` (currently `https://anilink.example/download`).
- **Open Graph image** path in `index.html` (relative today; use a full URL once hosted).

## Content notes

- Stat tiles only use facts that are true of the app (98 barangays, 7 categories, 2 languages, one chat per deal). `test/stats.test.ts` checks them against the app's own data.
- Produce listings, prices and the farmer profile are **sample data** and are labelled as such on the page.
- Produce pictures are real photos from Wikimedia Commons (`public/photos`, cropped to 3:2 and compressed). Their authors and licences are in `src/content/photoCredits.ts` and shown in the footer's **Photo credits** pop-up; keep that credit if you keep the photos. `test/photos.test.tsx` fails if a photo has no credit.
- All copy lives in `src/content/en.ts` and `src/content/tl.ts`. The **Tagalog is a first draft and needs a native speaker's review.**
- Animations live in `src/styles/motion.css` (CSS) plus `Reveal`, `CountUp` and `ScrollProgress` (small React pieces). Everything that moves is inside a `prefers-reduced-motion: no-preference` query, so visitors who ask for less motion get the finished page with nothing hidden; `test/motion.test.tsx` checks this.
- Colors mirror `Application/mobile/src/theme/tokens.ts`; `test/scaffold.test.ts` fails if they drift.
