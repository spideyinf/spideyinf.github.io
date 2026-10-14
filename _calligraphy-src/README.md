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
- **ABC**: stroke-by-stroke tutorials (play, previous, next), then model letters and a word on guidelines to copy onto your paper. **I wrote it** marks the day; the camera button keeps a photo of your page.
- **Paragraph**: quotes (including Vietnamese proverbs), or your own words, laid out on ruled pages to copy by hand.
- **Craft ornament** (`src/components/Craft.tsx`): an engraved nib as the maker's mark, cap-band rules between sections, and an original pen at rest on Home. Original drawings, not any maker's design.
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
src/components/      ModelSheet, PracticeShell, DiaryWriter, Craft, ui
src/lib/pen.ts       the ink model (wet-to-dry colour, pooling) used to draw the models
src/lib/photo.ts     photos of your pages, scaled down
src/lib/prefaces.ts  the preface
src/lib/shareCard.ts 9:16 share images
src/lib/ductus*.ts   stroke order and shapes for A–Z, a–z
src/screens/         Home, Hands, Guide, Preface, Letters, Abc, Quotes, Write, Record
src/hands/           your own hands (hand.json + font)
src/state/           practice (pages, streak, hand); swap for an API later
```
