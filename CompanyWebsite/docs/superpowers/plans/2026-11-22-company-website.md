# AniLink Company Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AniLink company website: a one-page, responsive, interactive marketing site in the Fieldlink look, with a fake app-store redirect.

**Architecture:** A Vite single-page React app. Section components read copy from a typed EN/TL dictionary and colors from CSS variables (dark/light) mapped into Tailwind. All interactive demos are driven by small pure state modules (`lib/`) that are tested without the DOM; components are thin views over them. The store redirect is one shared provider opened from the nav, hero and download band.

**Tech Stack:** Vite, React, TypeScript, Tailwind CSS v4 (`@tailwindcss/vite`), `motion` (Framer Motion), lucide-react, `qrcode.react`, `@fontsource/poppins`, Vitest + Testing Library (jsdom).

**Spec:** `CompanyWebsite/docs/superpowers/specs/2026-11-22-company-website-design.md`

## Global Constraints

- **No git.** The user owns version control: run no git command and write no commit steps. After each task, append one line to the hand-kept ledger `CompanyWebsite/docs/superpowers/progress.md` (`Task N: complete — npm test → <result>`), and record rulings there as `Ruling: <what> — <why> — <cost if wrong>`.
- All commands run from `C:\Users\ANGELO GALLEROS\GitHub\AniLink\CompanyWebsite` (Node 24 / npm 11). Install with `npm install --save-exact`.
- Colors come from `Application/mobile/src/theme/tokens.ts` (dark: bg `#1F1E1B`, surface `#272622`, primary `#1E4A3D`, headline `#BEE3CF`, eyebrow `#6FBF8E`, accent `#E8834A`, sun `#F0C04B`; light: bg `#F6F3EC`, headline `#1B4D3E`, accent `#D9702F`). Never hand-copy hexes elsewhere; use the CSS variables.
- Font: Poppins 400/500/600/700, self-hosted. Radii: cards 24px, chips and buttons fully rounded, phone frame 44px. Breakpoints 360 / 640 / 768 / 1024 / 1280. Tap targets at least 44×44px.
- Dark theme and English are the defaults. Every `localStorage` access goes through `lib/storage.ts` (try/catch).
- Tagline "GAWANG LOKAL. PARA SA BAYAN." as the hero eyebrow. Stat figures must be true: 98 barangays, 7 categories, 2 languages, one chat per deal.
- Plain store-style buttons only: no Apple/Google badge art, no real e-wallet logos. Nothing on the page collects or sends data.
- Placeholders (contact details, team, legal text, QR target URL) are visibly marked "Placeholder" and listed in `README.md`. The user's email or any personal detail never appears on the page.
- Never start the user's dev server; the only server you start is the temporary `vite preview` in Task 12, which you stop afterwards.
- Every task that adds visible copy adds the keys to both `content/en.ts` and `content/tl.ts` (Task 2's parity test enforces it). Tagalog is Claude's own wording; reuse `Application/mobile/src/i18n/tl.ts` phrasing where it fits and list the new Tagalog in the final message for the user's review.

## Review Focus

Failure modes the spec implies but no obvious test covers, most likely first. Each has a pinning test in the owning task.

1. Closing the store overlay mid-redirect, or double-clicking a store button: no late card pops up, timers don't stack (Task 3).
2. Blocked or corrupted `localStorage` (throws, or holds `theme=purple` / `lang=fr`): defaults apply, nothing crashes (Task 2).
3. The offer demo clicked out of order, double-clicked, or Reset mid-flow: no duplicate history, state stays consistent (Task 5).
4. A 320px viewport with longer Tagalog strings: no horizontal page scroll; only the feature tab row scrolls, inside its own container (Tasks 8, 12).
5. `prefers-reduced-motion`: no auto-cycling or parallax, the verification screen shows its end state at once, the rider is static, the demo still works (Tasks 6, 7, 9).

---

### Task 1: Scaffold, tokens, logos, reference screenshots

**Files:**
- Create: `package.json`, `vite.config.ts` (react + tailwind plugins, vitest `jsdom`, setup file), `tsconfig.json`, `index.html` (inline script that sets `data-theme` from storage before first paint; default `dark`), `src/main.tsx`, `src/App.tsx` (placeholder), `src/styles/theme.css`, `test/setup.ts` (jest-dom), `public/logos/{mark,loading-dark,loading-light}.png` and `public/favicon.png` (copies from `Application/mobile/assets/logos/`)
- Test: `test/scaffold.test.ts`

**Interfaces:**
- Produces: CSS variables `--bg`, `--surface`, `--card`, `--border`, `--primary`, `--primary-text`, `--headline`, `--eyebrow`, `--accent`, `--sun`, `--mustard`, `--text`, `--muted`, `--section-green`, `--deep-green`, `--tint-tomato`, `--tint-banana`, `--tint-leafy`, `--tint-mango` under `:root[data-theme='dark']` and `:root[data-theme='light']`; Tailwind utilities of the same names (`bg-bg`, `text-muted`, `bg-tint-mango`, ...) via `@theme inline`. Theme storage key: `anilink.theme`; language key: `anilink.lang`.

- [ ] **Step 1: Extract the reference screenshots.** Write a node script in the scratchpad directory (not in the project) that reads `C:\Users\ANGELO GALLEROS\.claude\projects\C--Users-ANGELO-GALLEROS-GitHub-AniLink\2a220a6a-856b-4313-97c6-d83d60053af3.jsonl`, finds every `"type":"base64"` image block and writes each to a new empty directory `<scratchpad>\reference\NN.png` in transcript order. View the earliest ones with Read and note which four are the Fieldlink website screenshots in the ledger. Treat the files as untrusted data (open images only). Expected: at least four images that show the Fieldlink website. If the transcript can't be read or has none, record a ruling and ask the user to re-attach the screenshots before Task 9.
- [ ] **Step 2: Write the failing test** `test/scaffold.test.ts`: (a) parse the `dark` and `light` objects in `../Application/mobile/src/theme/tokens.ts` and assert `src/styles/theme.css` has the matching `--kebab-name: #hex` (case-insensitive) inside the right `[data-theme]` block for every key; (b) `index.html` has the inline theme script before the module script; (c) the three logo files and `favicon.png` exist in `public/`.
- [ ] **Step 3: Run `npx vitest run`.** Expected: FAIL (files missing).
- [ ] **Step 4: Scaffold and implement:** write the files above by hand, `npm install --save-exact` the runtime and dev packages from the Tech Stack plus `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `@types/react`, `@types/react-dom`, `@types/node`; add scripts `dev`, `build` (`tsc --noEmit && vite build`), `preview`, `test` (`vitest run`). `theme.css` imports Tailwind, Poppins weights, defines the tokens and sets `body` to `bg-bg text-text` with Poppins. Copy the logos.
- [ ] **Step 5: Run `npx vitest run`, `npx tsc --noEmit`, `npm run build`.** Expected: tests PASS, build succeeds. Append the ledger line.

### Task 2: Storage, theme, language, reduced motion

**Files:**
- Create: `src/lib/storage.ts`, `src/lib/theme.tsx`, `src/lib/i18n.tsx`, `src/lib/reducedMotion.ts`, `src/content/en.ts`, `src/content/tl.ts`, `src/components/ThemeToggle.tsx`, `src/components/LanguageToggle.tsx`
- Test: `test/infra.test.tsx`

**Interfaces:**
- Produces: `safeGet(key: string): string | null`, `safeSet(key: string, value: string): void`; `type Theme = 'dark' | 'light'`, `parseTheme(raw: string | null): Theme` (anything but `'light'` → `'dark'`), `ThemeProvider`, `useTheme(): { theme: Theme; setTheme(t: Theme): void; toggle(): void }` (sets `document.documentElement.dataset.theme`); `type Lang = 'en' | 'tl'`, `parseLang(raw: string | null): Lang` (anything but `'tl'` → `'en'`), `I18nProvider`, `useI18n(): { lang: Lang; setLang(l: Lang): void; t(key: MessageKey, vars?: Record<string, string | number>): string }` (sets `document.documentElement.lang`); `export const en = {...} as const` with flat dotted keys, `export type MessageKey = keyof typeof en`, `export const tl: Record<MessageKey, string>`; `useReducedMotion(): boolean`; `ThemeToggle`, `LanguageToggle` (buttons with `aria-label` and `aria-pressed` state).

- [ ] **Step 1: Write the failing tests** in `test/infra.test.tsx`: `parseTheme('purple')` → `'dark'` and `parseLang('fr')` → `'en'` (**Review Focus 2**); with `Storage.prototype.getItem/setItem` mocked to throw, `ThemeProvider` and `I18nProvider` still render and toggling still changes `data-theme` / copy; toggling theme persists `anilink.theme` and sets `data-theme`; switching language changes a rendered `t('nav.getApp')` and sets `<html lang>`; every key of `en` exists in `tl` and no `tl` value is empty (key parity); `t('x', { n: 3 })` replaces `{n}`; `useReducedMotion` returns true when `matchMedia('(prefers-reduced-motion: reduce)')` matches.
- [ ] **Step 2: Run `npx vitest run test/infra.test.tsx`.** Expected: FAIL (modules missing).
- [ ] **Step 3: Implement the modules above.** Seed `en`/`tl` with the nav keys (`nav.features`, `nav.how`, `nav.about`, `nav.faq`, `nav.getApp`) and toggle labels. Providers read storage once on mount via the parse functions.
- [ ] **Step 4: Run the file again.** Expected: PASS. Then `npx vitest run` (all) and `npx tsc --noEmit`. Append the ledger line.

### Task 3: Modal and the store facade

**Files:**
- Create: `src/components/Modal.tsx`, `src/lib/store.tsx`, `src/components/StoreButton.tsx`, `src/components/StoreOverlay.tsx`, `src/components/QrCard.tsx`
- Test: `test/modal.test.tsx`, `test/store.test.tsx`

**Interfaces:**
- Consumes: `useI18n().t`, `useReducedMotion`.
- Produces: `Modal({ open: boolean; onClose(): void; title: string; children })` (dialog role, `aria-labelledby`, traps focus, Esc and backdrop close, restores focus to the previously focused element); `type StoreId = 'google' | 'apple'`; `REDIRECT_MS = 1600`; `StoreProvider` (renders `StoreOverlay`), `useStore(): { stage: 'closed' | 'redirecting' | 'card'; store: StoreId | null; open(store: StoreId): void; close(): void }`; `StoreButton({ store: StoreId })` (plain store-style button, calls `open`); `QrCard({ url: string })` using `qrcode.react`; `PLACEHOLDER_QR_URL` (a clearly fake `https://anilink.example/download`).

- [ ] **Step 1: Write the failing tests.** `modal.test.tsx`: opens with focus inside; Tab from the last control wraps to the first; Esc and backdrop click call `onClose`; closing returns focus to the opener. `store.test.tsx` (fake timers): `open('google')` → `redirecting` → after `REDIRECT_MS` → `card`; `close()` at any stage → `closed`; **closing mid-redirect and advancing timers well past `REDIRECT_MS` leaves `closed`; two `open()` calls in a row produce one transition, not two** (Review Focus 1); the overlay text names Google Play or the App Store per `store`; the card renders the QR and a Close button; the App Store card says "coming soon".
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement.** `useStore` keeps the timer id in a ref, clears it in `close()` and before starting a new one, and clears on unmount. The redirect overlay shows the logo loader (`public/logos/mark.png` with a spinning ring; no spin under reduced motion). Add keys `store.redirecting`, `store.soonTitle`, `store.soonBody`, `store.close`, `store.qrHint`, `store.google`, `store.apple` to both dictionaries.
- [ ] **Step 4: Run both files, then the full suite and `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 4: Logo, Nav, Footer

**Files:**
- Create: `src/components/Logo.tsx`, `src/components/Nav.tsx`, `src/components/Footer.tsx`
- Test: `test/nav-footer.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `useI18n`, `useStore().open`, `Modal`, `ThemeToggle`, `LanguageToggle`.
- Produces: `Logo({ variant: 'mark' | 'stacked' | 'lockup' })` (picks `loading-dark.png` or `loading-light.png` by theme for `stacked`; `lockup` is the mark plus a text "AniLink" wordmark in `--headline`; always has alt text); `Nav` (sticky; anchors `#features`, `#how`, `#about`, `#faq`; both toggles; "Get the app" calls `open('google')`; hamburger button `aria-expanded` opens a full-screen menu below `md`, Esc and link click close it); `Footer` (logo, tagline, links, placeholder contact, non-link social icons, © line, Privacy and Terms buttons that open `Modal`s with text marked "Placeholder").

- [ ] **Step 1: Write the failing tests:** nav shows the four links with the right `href`s; "Get the app" calls the store (assert the overlay appears); the hamburger toggles the menu (`aria-expanded`), a menu link closes it, Esc closes it; the logo `src` switches with the theme; Footer's Privacy opens a dialog containing "Placeholder"; no element in the page contains an `@` email address or the word "trinove".
- [ ] **Step 2: Run the file.** Expected: FAIL.
- [ ] **Step 3: Implement** with the keys `footer.*`, `legal.*`. Nav blurred backdrop: `backdrop-blur` over `bg-bg/80`.
- [ ] **Step 4: Run the file, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 5: Offer demo (state machine and chat screen)

**Files:**
- Create: `src/lib/offerDemo.ts`, `src/components/PhoneFrame.tsx`, `src/components/screens/OfferChatScreen.tsx`
- Test: `test/offerDemo.test.ts`, `test/offerChat.test.tsx`

**Interfaces:**
- Produces: `type OfferStage = 'idle' | 'proposed' | 'countered' | 'accepted'`; `interface OfferEvent { by: 'buyer' | 'farmer'; kind: 'offer' | 'counter' | 'accept'; price: number; qty: number }`; `interface OfferDemoState { stage: OfferStage; history: OfferEvent[] }`; `initialOfferDemo: OfferDemoState`; `offerDemoReducer(state, action: { type: 'propose' | 'counter' | 'accept' | 'reset' }): OfferDemoState` (fixed values: offer ₱120 × 10 kg, counter ₱128, accept at ₱128; actions out of order return the same state object); `PhoneFrame({ children, label })` (the 44px-radius phone shell with a status bar; scales with its container width); `OfferChatScreen({ initial?: OfferDemoState; interactive?: boolean })` (shows a single contextual action button, the negotiation history as chat cards, and an "Order created" card when accepted; `interactive={false}` renders the state without buttons).

- [ ] **Step 1: Write the failing tests.** Reducer: `propose` from idle → `proposed` with one buyer offer event of 120 × 10; `counter` → `countered` with the farmer's ₱128; `accept` → `accepted`; history keeps all three in order; `accept` from `idle` and `counter` from `idle` return the identical state; `propose` twice leaves one offer event; `reset` from every stage → `initialOfferDemo` (**Review Focus 3**). Component: clicking the single action button three times walks the story and shows "Order created"; double-clicking the first button adds only one offer card; Reset returns to the start; with `interactive={false}` no action button exists.
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement** the reducer first (pure), then the components. Next action label per stage: "Send offer ₱120 × 10 kg" → "Farmer counters ₱128" → "Accept ₱128". Keys `offer.*`.
- [ ] **Step 4: Run both files, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 6: Price guide and verification screens

**Files:**
- Create: `src/lib/priceGuide.ts`, `src/components/screens/PriceGuideScreen.tsx`, `src/components/screens/VerifiedScreen.tsx`
- Test: `test/priceGuide.test.ts`, `test/screens-a.test.tsx`

**Interfaces:**
- Consumes: `PhoneFrame`, `useReducedMotion`, `useI18n`.
- Produces: `PRICE_GUIDE: { crop: string; low: number; avg: number; high: number; weekly: number[] }[]` (8 weekly values each, sample data); `sparklinePath(values: number[], w: number, h: number): string` (SVG path `M`/`L` points scaled to the box; empty array → `''`; one value → a flat line); `vsAverage(price: number, avg: number): { delta: number; label: 'below' | 'above' | 'at' }`; `PriceGuideScreen` (low/avg/high, sparkline, badge like "₱6 below Zamboanga avg", the text "Sample data"); `VerifiedScreen` (profile card, "Under review" spinner for about 2 s, then the verified badge, rating and response time; under reduced motion it shows the verified state immediately; restarts when remounted).

- [ ] **Step 1: Write the failing tests.** `sparklinePath([1,2,3], 100, 50)` starts with `M` and has 3 points, min value maps to y=50 and max to y=0; `[]` → `''`; `[5]` doesn't produce `NaN`; `vsAverage(76, 82)` → `{ delta: 6, label: 'below' }`; screens: price guide shows "Sample data" and the below-average badge; verified screen shows "Under review" then (fake timers) the verified badge; with reduced motion mocked on, the badge is there at once (**Review Focus 5**).
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `price.*`, `verified.*`.
- [ ] **Step 4: Run both files, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 7: Alerts, map and order screens

**Files:**
- Create: `src/lib/route.ts`, `src/components/screens/AlertsScreen.tsx`, `src/components/screens/MapScreen.tsx`, `src/components/screens/OrderScreen.tsx`
- Test: `test/route.test.ts`, `test/screens-b.test.tsx`

**Interfaces:**
- Produces: `pointOnPolyline(points: [number, number][], t: number): [number, number]` (`t` clamped to 0–1, arc-length based; one point → that point; empty → `[0, 0]`); `ORDER_STEPS = ['paid', 'preparing', 'delivery', 'completed'] as const`; `AlertsScreen` (steps: set "mango ≤ ₱150" → farmer posts a mango listing → notification card appears; a button advances, with Reset); `MapScreen` (SVG: stylized Zamboanga outline, barangay pins with ₱ prices, a route and a rider dot moving via `pointOnPolyline` and `requestAnimationFrame`, static at t=0.6 under reduced motion; the caption says the map is illustrative); `OrderScreen` (timeline over `ORDER_STEPS`, advancing on click, plus generic e-wallet / bank / cash chips).

- [ ] **Step 1: Write the failing tests.** `pointOnPolyline([[0,0],[10,0],[10,10]], 0.5)` → `[10,0]`; `t=0` and `t=1` hit the ends; `t=-1` and `t=2` clamp; `[]` → `[0,0]`. Screens: alerts notification appears only after the farmer step and Reset hides it; order timeline marks steps complete in order and "completed" last; map renders at least three pins and, with reduced motion on, never calls `requestAnimationFrame` (**Review Focus 5**).
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `alerts.*`, `map.*`, `order.*`.
- [ ] **Step 4: Run both files, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 8: Features showcase

**Files:**
- Create: `src/components/Features.tsx`
- Test: `test/features.test.tsx`

**Interfaces:**
- Consumes: all six screens, `PhoneFrame`.
- Produces: `FEATURE_IDS = ['offers', 'verified', 'price', 'alerts', 'map', 'orders'] as const`; `Features` (section `id="features"`, headline and blurb, ARIA tablist with six tabs, one tabpanel showing the matching screen inside the `PhoneFrame`; Left/Right/Home/End move and select; the active tab is the only one with `tabindex=0`; mobile: the tab row is `overflow-x-auto` inside its own container).

- [ ] **Step 1: Write the failing tests:** six tabs with roles; the first is selected; clicking a tab shows its screen and sets `aria-selected`; ArrowRight/ArrowLeft/Home/End move selection (wrapping at the ends); only the active tab is in the tab order; the tab row element has the horizontal-scroll class and the section root does not (**Review Focus 4**).
- [ ] **Step 2: Run the file.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `features.*` (title, six tab labels, six short descriptions).
- [ ] **Step 4: Run the file, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 9: Hero and stat tiles

**Files:**
- Create: `src/lib/useCycle.ts`, `src/components/screens/HomeScreen.tsx`, `src/components/screens/ListingScreen.tsx`, `src/components/Hero.tsx`, `src/components/Stats.tsx`, `src/content/stats.ts`
- Test: `test/hero.test.tsx`, `test/stats.test.ts`

**Interfaces:**
- Consumes: `PhoneFrame`, `OfferChatScreen` (frozen at `countered`, `interactive={false}`), `StoreButton`, `useReducedMotion`.
- Produces: `useCycle(length: number, ms: number, enabled: boolean): number` (current index, advances on an interval only while `enabled`); `STATS = { barangays: 98, categories: 7, languages: 2 }`; `Hero` (eyebrow, two-tone headline, subtitle, Google store button first then App Store, three chips, the phone cycling home → listing → chat, `SunDecor` circle in `--sun`, floating tinted produce cards with parallax only when motion is allowed); `Stats` (four tiles: the three figures plus "one chat per deal").
- Reference: before building the layout, view the extracted Fieldlink screenshots from Task 1 and match the hero's composition, spacing and chip style.

- [ ] **Step 1: Write the failing tests.** `stats.test.ts`: `STATS.barangays` equals the length of `Application/mobile/src/data/barangays.json`; `STATS.categories` equals the number of keys of `CATEGORY_EMOJI` parsed from `tokens.ts`; `STATS.languages` equals the number of exported dictionaries (2). `hero.test.tsx`: the eyebrow reads "GAWANG LOKAL. PARA SA BAYAN."; both store buttons exist, Google first in DOM order; `useCycle` (fake timers) advances every `ms` and wraps; with reduced motion it stays at 0 after a long time (**Review Focus 5**); clicking a hero store button opens the store overlay.
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `hero.*`, `stats.*`. Stack the hero on mobile (text first, phone below, scaled by `PhoneFrame`).
- [ ] **Step 4: Run both files, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 10: How it works and fresh produce

**Files:**
- Create: `src/lib/produce.ts`, `src/components/HowItWorks.tsx`, `src/components/Produce.tsx`
- Test: `test/produce.test.ts`, `test/how-produce.test.tsx`

**Interfaces:**
- Produces: `type ProduceCategory = 'fruits' | 'vegetables' | 'leafy' | 'rootcrops' | 'crafts'`; `interface ProduceItem { id: string; name: string; emoji: string; category: ProduceCategory; price: number; unit: 'kg' | 'piece' | 'tali' | 'dozen'; barangay: string; verified: boolean }`; `PRODUCE: ProduceItem[]` (at least 10 sample items across all categories; barangays must exist in `Application/mobile/src/data/barangays.json`); `filterProduce(items: ProduceItem[], category: 'all' | ProduceCategory): ProduceItem[]`; `HowItWorks` (id `how`, `section-green` band, For buyers | For farmers toggle, four numbered steps each); `Produce` (pill filters, tinted emoji cards, a visible "Sample listings" label).

- [ ] **Step 1: Write the failing tests:** `filterProduce(PRODUCE, 'all')` returns everything, `'fruits'` only fruits, and every category has at least one item; every `barangay` is a real barangay name; the toggle switches between buyer and farmer steps (`aria-pressed`) and shows exactly four steps each; clicking a pill filters the cards and the pressed pill is marked; "Sample listings" is visible.
- [ ] **Step 2: Run both files.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `how.*`, `produce.*`. Card tints use `tint-*` utilities by category (fruits → banana, vegetables → tomato, leafy → leafy, rootcrops and crafts → mango).
- [ ] **Step 4: Run both files, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 11: About, FAQ, download band

**Files:**
- Create: `src/components/About.tsx`, `src/components/Faq.tsx`, `src/components/Download.tsx`
- Test: `test/about-faq-download.test.tsx`

**Interfaces:**
- Consumes: `StoreButton`, `QrCard`, `PLACEHOLDER_QR_URL`.
- Produces: `About` (id `about`; mission copy, three value cards, team cards with initials avatars, every team name and the mission copy block visibly labeled "Placeholder"); `Faq` (id `faq`; at least six items; one open at a time; each trigger is a `button` with `aria-expanded` and `aria-controls`); `Download` (large headline, both store buttons, `QrCard`).

- [ ] **Step 1: Write the failing tests:** About contains "Placeholder" labels and no email address; FAQ has at least six triggers, all collapsed at first; clicking one expands it and collapses the previously open one; Enter/Space toggles it; Download has both store buttons and a QR; clicking either opens the overlay. FAQ answers must say payments are a demo and that the app is Android-first (assert both phrases are present in `en`).
- [ ] **Step 2: Run the file.** Expected: FAIL.
- [ ] **Step 3: Implement.** Keys `about.*`, `faq.*`, `download.*`.
- [ ] **Step 4: Run the file, the full suite, `npx tsc --noEmit`.** Expected: PASS. Append the ledger line.

### Task 12: Assembly, README, build and browser verification

**Files:**
- Modify: `src/App.tsx` (providers → Nav, Hero, Stats, Features, HowItWorks, Produce, About, Faq, Download, Footer), `index.html` (title, description, Open Graph tags, favicon link)
- Create: `README.md` (install, `npm run dev`, `npm test`, `npm run build`, how the facade works, the list of placeholders), `test/app.test.tsx`

- [ ] **Step 1: Write the failing test** `test/app.test.tsx`: rendering `<App />` shows all ten sections in order by `id`/landmark; `document.title` and the meta description exist in `index.html`; no text on the page matches `/\d[\d,]* (farmers|buyers|users|downloads)/i` (no invented counts); toggling to Tagalog changes the hero eyebrow-adjacent headline and the nav link text; every `Placeholder` marker in the rendered page is also named in `README.md`.
- [ ] **Step 2: Run the file.** Expected: FAIL.
- [ ] **Step 3: Implement** the assembly, meta tags and README.
- [ ] **Step 4: Run `npx vitest run`, `npx tsc --noEmit`, `npm run build`.** Expected: all PASS, build with no warnings.
- [ ] **Step 5: Browser verification.** Load the Chrome tools in one `ToolSearch` call. Start `npx vite preview --port 4173` in the background, open it in a new tab and, at 320×700, 360×800, 768×1024 and 1440×900, evaluate `document.documentElement.scrollWidth <= window.innerWidth` (Expected: true at every size, **Review Focus 4** with Tagalog on too), compare the hero and features against the reference screenshots, click through the offer demo to "Order created", the store facade from all three entry points, the hamburger menu, both themes and both languages. Emulate reduced motion and confirm nothing auto-cycles. Do a keyboard-only pass through nav, tabs, FAQ and the store overlay. Fix anything found test-first, then **stop the preview process** and close the tab.
- [ ] **Step 6: Append the ledger line,** then list for the user: the placeholders, the new Tagalog strings to review, and the command to run the site themselves (`cd CompanyWebsite; npm run dev`).
