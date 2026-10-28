# Writing to Learn

A daily handwriting companion for real pen and paper: the app shows you a hand stroke by stroke, and you write it on paper with your own pen. Named after William Zinsser's *Writing to Learn*.

Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **Hands** (`src/lib/scripts.ts`): Italic, Modern print, Modern monoline, Vietnamese school hand, Business cursive and Copperplate. A hand = a font + stroke data for A–Z and a–z + a slant and pen style (pointed, broad-edge or monoline). Stroke data: `src/lib/ductus.ts` (cursive and Copperplate) and `src/lib/ductus-modern.ts` (print and italic), authored upright in x-height units. Contact sheet in dev: `#/ductus/<handId>`.
- **Your own hand**: record strokes in the app (`#/record`, unlinked in the UI), make a font from a scanned template, drop both into `src/hands/<id>/`. Step by step: [CUSTOM_HAND.md](CUSTOM_HAND.md).
- **Tracing** (`src/lib/trace/`, the key feature): every tutorial shows the hand's real letter, exactly as the font (or an SVG) draws it, revealed stroke by stroke. The letter is drawn onto a small grid, thinned to its centre lines, and split into strokes. Order and direction come from the hand's ductus fitted onto the letter, from the SVG's own paths, or, when neither exists, from a writing heuristic. Each inked pixel then gets the moment the pen passes it. The **Trace studio** (`#/trace`) traces any character in any hand, or any SVG you upload or paste. Dev contact sheet: `#/tracesheet/<handId>`.
- **ABC**: stroke-by-stroke tutorials (play, previous, next), then model letters and a word on guidelines to copy onto your paper. **I wrote it** marks the day; the camera button keeps a photo of your page.
- **Paragraph**: quotes (including Vietnamese proverbs), or your own words, laid out on ruled pages to copy by hand.
- **Design** (`src/theme.ts`, `src/index.css`, `src/components/b.tsx`): mobile first. A cream ground with a faint grain, navy ink and one amber accent; Bricolage Grotesque for the interface and Newsreader italic for the app's voice; a floating liquid-glass tab bar (ABC, Paragraph, Home, My pages, Settings). Real paper scans are kept for the parts that are paper: the tracing card, the ruled sheet you copy from, the preface letter.
- **The greatest achievement** (`#/achievement`, `src/lib/feed.ts`): today's three most loved handwritten pages (free), everyone's pages behind an unlock, a full feed with reactions (`#/achievement/all`) and the unlock screen (`#/unlock`, no payments yet). Posts come from one function, `fetchFeed`: set `VITE_FEED_URL` to a backend returning `{ top, all }`. Without one the feed is empty, and a clearly labelled sample preview shows the layout. No posting yet.
- **Notifications** (`src/lib/notify.ts`, `#/inbox`, `#/settings/notifications`, `#/notifications`): a daily writing reminder at your time and days (skipped once you've written), new letter styles, and, once sharing opens, top pages and loves; quiet hours; an inbox; a test. In the wrapped app they are native local notifications (Capacitor), scheduled by the OS per weekday and delivered with the app closed; tapping opens the right screen. On the web they use the Notification API via the service worker (`public/notify-sw.js`): shown when due and the app is open or next opened, plus a periodic background check where the browser supports it. While the app is in front, a notification appears as an in-app banner in the phone's style.
- **iOS and Android apps** (`capacitor.config.ts`): `npm run build:app` builds into `dist-app/` with relative paths and no service worker; then `npx cap add ios` / `npx cap add android` once (needs Xcode / Android Studio) and `npm run cap:sync` after changes.
- **My pages** (`#/pages`): photos of pages you wrote, by day, with share, download and delete. A shared feed is planned once there's a backend.
- **Pens & inks** (`#/pens`, `src/lib/fieldGuide.ts`, `src/components/InkArt.tsx`): a small field guide to well-known pens and inks, names and plain facts only, each with a faded ink drawing of generic pen parts or bottles behind it (not pictures of the products).
- **Preface** (`src/lib/prefaces.ts`, `src/components/DiaryWriter.tsx`, `#/preface`): one short letter, written onto the page stroke by stroke by an unseen hand in the italic hand's real strokes. The ink goes on wet and blue and darkens as each line dries; closing the letter lets it sink into the paper. It opens the app on first visit; tap the page to skip.
- **Installable and offline** (vite-plugin-pwa), and **share cards**: any saved page becomes a 9:16 image for stories.
- Paper: real scans from [Subtle Patterns](https://github.com/subtlepatterns/SubtlePatterns) (CC BY-SA 3.0) with a generated aging layer; see `src/assets/paper/CREDITS.md`.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/scripts.ts   the hands: built-in + src/hands/*
src/lib/hand.ts      script fonts: measuring, wrapping
src/lib/recording.ts recorder → hand.json
src/lib/sheet.ts     guideline layout and drawing
src/lib/trace/       tracing: sources (font, SVG), skeleton, stroke order, reveal timing
src/components/      b (tab bar, headers, controls, paper), TraceView (the player), LetterTutorial, DiaryWriter, InkArt, ui
src/lib/pen.ts       the ink model (wet-to-dry colour, pooling) used to draw the models
src/lib/photo.ts     photos of your pages, scaled down
src/lib/prefaces.ts  the preface
src/lib/shareCard.ts 9:16 share images
src/lib/ductus*.ts   authored stroke order for A–Z, a–z (guides the tracing; draws the diary letter)
src/screens/         Home, Abc, Paragraph, Pages, Settings, Hands, Guide, Trace, Preface, Record
src/hands/           your own hands (hand.json + font)
src/state/           practice (pages, streak, hand); swap for an API later
```
