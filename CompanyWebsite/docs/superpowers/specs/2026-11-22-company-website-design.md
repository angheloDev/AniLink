# AniLink Company Website — Design

> Approved by the user on 2026-11-22. Next step: implementation plan (superpowers:writing-plans). No git/version-control actions by Claude (standing rule from the user).

## Context / intent
AniLink is a prototype mobile marketplace for local farmers and buyers in Zamboanga City. It needs a public face: a **company website** that explains the app, shows its best features interactively, and drives visitors to "download" it.
**Audience (user's answer):** both a real-company-site audience (farmers and buyers in Zamboanga, anyone who finds it online) and a presentation audience (judges/investors on a projector). So it must read like a real company page and still impress live.
**Look (user's words):** "just the website I showed you earlier as a reference for the theme (just change the logo accordingly)". The reference is the four Fieldlink screenshots from the first session. Downloads are a **facade**: the buttons pretend to redirect to the app store.

Location: `C:\Users\ANGELO GALLEROS\GitHub\AniLink\CompanyWebsite\` (sibling of `Application/`).

## Goals
- One scrolling page, faithful to the reference: uppercase eyebrow, big two-tone headline, pill chips, rounded tinted produce cards, dark-green "how it works" band with numbered steps, stat tiles, yellow sun circle.
- Showcase the app's best features **interactively** (not static screenshots).
- Mobile-first and fully responsive, 320px to 1440px+, no horizontal scroll.
- A convincing store-redirect facade.
- English default with Tagalog toggle; dark default with light toggle (both mirror the app); both persisted.
- Honest content: nothing on the page claims facts that aren't true of the prototype.

## Non-goals
Real store links or a store listing, any backend, analytics, a working contact form, a CMS, multi-page routing, SEO beyond basic title/description/Open Graph tags, deployment/hosting.

## Anti-goals (failure even if it "works")
- Looks like a generic template instead of the reference.
- Invented user counts, testimonials, press logos, or ratings.
- Official Apple/Google badge artwork or real e-wallet brand logos.
- Breaks or scrolls sideways on a phone; tap targets under 44px.
- The interactive demo can dead-end or get stuck; motion ignores `prefers-reduced-motion`.
- Flash of the wrong theme on load.

## Constraints
- **Stack (user: "react, tailwind and other tools that are necessary"):** Vite + React + TypeScript + Tailwind CSS + Framer Motion (`motion`) + lucide-react; Poppins self-hosted via `@fontsource/poppins` (400/500/600/700, no CDN); Vitest + Testing Library. Pin exact versions at install.
- Colors come from `Application/mobile/src/theme/tokens.ts` (dark and light), exposed as CSS variables and mapped into Tailwind's theme so one set of values drives both themes.
- Logos: copy (don't move) `Application/mobile/assets/logos/mark.png` (circle mark, favicon and nav), `loading-dark.png` (stacked, mint wordmark, for dark theme), `loading-light.png` (stacked, dark-green wordmark, for light theme) into the website. The nav shows the mark plus the wordmark in the theme-matching color.
- Node 24 / npm 11. The user runs their own dev servers; I only start a temporary preview for verification and stop it afterwards, and I tell the user the command to run it themselves.
- Placeholder content (contact details, team, legal text, QR target) is clearly marked and listed in the website README.
- I will not put the user's email or any personal details on the page.

## Approaches (decided)
| | Approach | Trade-off |
|---|---|---|
| **A ✅ chosen** | One scrolling page (Vite SPA) | Matches the reference; fastest and lightest; hosts anywhere as static files. Sections share one URL (anchors only), so search engines see one page. |
| B | Multi-page (React Router) | Shareable URLs per page, but loses the scroll story, adds clicks before the download button, about twice the work. |
| C | Next.js static export | Best SEO and link previews; heavier setup and overkill for an unpublished site. A can be moved to it later. |

## Design

### Page sections, top to bottom
1. **Nav** (sticky, blurred backdrop): mark + wordmark; Features · How it works · About · FAQ; EN|TL toggle; theme toggle; "Get the app" button. Below `md`: hamburger opens a full-screen menu.
2. **Hero:** eyebrow "GAWANG LOKAL. PARA SA BAYAN." (the reference's own tagline, also used in the app); two-tone headline (mint/deep-green + orange line); subtitle; two store-style buttons (Google Play-style first because the app is Android, App Store-style second); chips (Verified farmers · Price guide · Offers in chat); a phone frame whose screens auto-cycle (home → listing → chat); yellow sun circle and floating tinted produce cards with light parallax.
3. **Stat tiles** (true facts only): 98 barangays, 7 categories, 2 languages, one chat per deal. Wording is the builder's, but every figure must be true.
4. **Features showcase** (the centerpiece). Six tabs; a phone beside them changes screen with the tab. Desktop: tab list left, phone right. Mobile: a horizontally scrollable pill row above the phone.
   - **Offers in chat (interactive):** buyer proposes ₱120 × 10 kg → farmer counters ₱128 → buyer accepts → "Order created" card; the negotiation history stays visible; a Reset button. Steps can't be skipped or repeated out of order.
   - **Verified farmers & ratings:** profile card, "Under review" spinner that turns into the verified badge, rating and response time.
   - **Price guide:** low/avg/high, 8-week sparkline, "₱6 below Zamboanga avg" badge, labeled "Sample data".
   - **Harvest alerts:** set "mango ≤ ₱150", a farmer posts a mango listing, a notification pops.
   - **Map & delivery:** an SVG map of Zamboanga with barangay pins and a rider dot moving along a route (no tiles, no network).
   - **Payments & order tracking:** timeline paid → preparing → out for delivery → completed; generic e-wallet / bank / cash chips (no brand logos).
5. **How it works:** dark-green band, numbered steps, For buyers | For farmers toggle.
6. **Fresh from the farm:** pill filters (All, Fruits, Vegetables, Leafy, Root crops, Crafts) over tinted emoji-art produce cards with ₱ price/unit, barangay and a verified badge. Labeled "Sample listings".
7. **About:** mission story for Zamboanga's farmers and buyers; three value cards; team cards with initials avatars. Copy and team are placeholders, marked as such.
8. **FAQ:** accordion, 6–8 questions answered truthfully for a prototype (what it is, who can sell, how offers work, how farmers are verified, payments are a demo, platforms: Android first).
9. **Download band:** large headline, the two store buttons, a QR card.
10. **Footer:** logo, tagline, links, placeholder contact, social icons (no links), © line, Privacy and Terms (open small pop-ups with placeholder text).

### Store facade
Click a store button → full-screen overlay with the logo loader and "Taking you to Google Play…" (about 1.6 s) → card: "AniLink is coming soon", a QR code (placeholder URL), a short note, and a Close button. Esc and backdrop close it; focus returns to the button. The App Store version says "Coming soon" too. Nothing is collected or sent.

### Language and theme
- A small typed EN/TL dictionary (no heavy i18n library); reuse the app's existing Tagalog strings (`mobile/src/i18n/tl.ts`) where they fit. **The Tagalog needs the user's review.**
- Dark by default, light toggle. An inline script in `index.html` sets the theme before first paint (no flash). localStorage reads/writes are wrapped in try/catch and the page works without them.

### Responsive and accessibility
- Breakpoints 360 / 640 / 768 / 1024 / 1280; hero stacks on mobile; phone frames scale down; tap targets ≥ 44px.
- Tabs follow the ARIA tablist pattern with arrow keys; the FAQ uses `aria-expanded`; modals trap focus; visible focus rings; alt text on logos.
- `prefers-reduced-motion`: no auto-cycling, no parallax, no autoplay; the interactive demo still works.

### Suggested layout (builder may adjust)
`CompanyWebsite/` — `index.html`, `package.json`, `vite.config.ts`, `public/` (favicon, logos), `src/` (`main.tsx`, `App.tsx`, `styles/theme.css`, `content/` EN+TL copy, `lib/` i18n, theme and the offer-demo state machine, `components/` and `components/screens/`), `test/`, `README.md` (run commands, list of placeholders).

## Calls made by Claude (check these)
- **Phone screens are rebuilt in React, not screenshots:** crisp at any size, exact app colors, clickable. Real screenshots would need you to run the app and would be static.
- **Dark by default**, matching the reference, with a light toggle.
- **Google Play-style button first**, because the app is Android; the App Store button says "coming soon", which implies an iPhone version. Remove it if you don't want to imply that.
- **No made-up numbers or testimonials.**
- **Plain store-style buttons**, not the official badges.
- **Spec and plan live inside `CompanyWebsite/docs/superpowers/`** so the website stays self-contained.
- **Stack extras:** `@fontsource/poppins`, an SVG-only map, a small QR library for the QR card.
- **Reference fidelity:** at build start I extract the four reference screenshots from this session's saved transcript and compare against them; if that fails, I use the written description plus the app's tokens and ask you to re-attach them.

## Left to the builder
Exact copy and Tagalog wording (marked for review), animation timings, produce samples, stat wording, FAQ wording, the QR library, image optimization, icon choices, component structure.

## Verification
1. `npm test` (Vitest): offer-demo state machine (propose → counter → accept → reset, no skipping), store-facade flow (open → redirect → card → Esc/close, focus returns), EN/TL toggle (copy changes and persists; every EN key has a TL key), theme toggle (persists, no throw when storage is blocked), tabs keyboard navigation, produce filter, FAQ accordion.
2. `npx tsc --noEmit` and `npm run build` succeed with no warnings.
3. Temporary `vite preview`, checked in a browser at 360×800, 768×1024 and 1440×900 against the reference screenshots: no horizontal scroll, nav hamburger works, phone demo clickable, both themes, both languages. Preview stopped afterwards.
4. Reduced-motion check (emulated) and a keyboard-only pass through the nav, tabs, FAQ and store modal.
