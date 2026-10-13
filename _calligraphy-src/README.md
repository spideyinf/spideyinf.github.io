# Writing to Learn

Paper, fountain pen and ink on your phone: learn a hand stroke by stroke and write a line every day. Named after William Zinsser's *Writing to Learn*.

Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **Hands** (`src/lib/scripts.ts`): Italic, Modern print, Modern monoline, Vietnamese school hand, Business cursive and Copperplate. A hand = a font + stroke data for A–Z and a–z + a slant and pen style (pointed, broad-edge or monoline). Stroke data: `src/lib/ductus.ts` (cursive and Copperplate) and `src/lib/ductus-modern.ts` (print and italic), authored upright in x-height units. Contact sheet in dev: `#/ductus/<handId>`.
- **Your own hand**: record strokes in the app (`#/record`), make a font from a scanned template, drop both into `src/hands/<id>/`. Step by step: [CUSTOM_HAND.md](CUSTOM_HAND.md).
- **ABC**: stroke-by-stroke tutorials (play, previous, next), then trace the same letters on guidelines.
- **Paragraph**: quotes (including Vietnamese proverbs), your own words, or the prefaces, wrapped into ruled pages.
- **Pen case** (`src/lib/pen.ts`, `#/pens`): six original pens, six nibs (EF to B, a 1.1 stub that draws thick and thin by direction, a flex), nine original inks (shading, sheen, iron gall that writes blue and darkens as it dries, wet and dry flow) and three papers (absorbency, sheen, drying time). Optional nib sound (`src/lib/sound.ts`).
- **Prefaces** (`src/lib/prefaces.ts`): short letters written out live on the page in your ink; one a day on Home; the first opens the app. `PREFACE_FONT` sets the hand they're written in.
- **Installable and offline** (vite-plugin-pwa), and **share cards**: any saved page becomes a 9:16 image for stories.
- Paper: real scans from [Subtle Patterns](https://github.com/subtlepatterns/SubtlePatterns) (CC BY-SA 3.0) with a generated aging layer; see `src/assets/paper/CREDITS.md`.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/scripts.ts   the hands: built-in + src/hands/*
src/lib/hand.ts      script fonts: measuring, wrapping
src/lib/recording.ts recorder → hand.json
src/lib/sheet.ts     guideline layout and drawing
src/components/      Sheet (canvas + pen), PracticeShell, ui
src/lib/pen.ts       pens, nibs, inks, papers; the ink model
src/lib/prefaces.ts  the prefaces
src/lib/shareCard.ts 9:16 share images
src/lib/ductus*.ts   stroke order and shapes for A–Z, a–z
src/screens/         Home, Hands, Pens, Prefaces, Letters, Abc, Quotes, Write, Record
src/hands/           your own hands (hand.json + font)
src/state/           practice (pages, streak, hand) and pen settings; swap for an API later
```
