# Daily Hand

A daily calligraphy practice sheet, after William Zinsser's *Writing to Learn*.
Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **Hands**: choose the script to learn: **Copperplate** (Pinyon Script, pointed-pen shading, 55°) or **Business cursive** (Ephesis, light shading, 58°). A hand is a font plus stroke data (`src/lib/scripts.ts`).
- **Your own hand**: record your strokes in the app (`#/record`), make a font from a scanned template, and drop both into `src/hands/<id>/`. Step-by-step: [CUSTOM_HAND.md](CUSTOM_HAND.md).
- **ABC**: a stroke-by-stroke tutorial for every capital and lowercase letter of the chosen hand, with play, previous and next. Stroke data is authored upright in x-height units (`src/lib/ductus.ts`) and slanted per hand. Below it you trace the same letters on guidelines.
- Paper: real scans from [Subtle Patterns](https://github.com/subtlepatterns/SubtlePatterns) (CC BY-SA 3.0) with a generated aging layer; see `src/assets/paper/CREDITS.md`. Open `#/ductus/<scriptId>` in `npm run dev` for a contact sheet of a hand's letters.
- **Paragraph**: built-in public-domain quotes or your own, wrapped into ruled pages.
- Fountain-pen ink on canvas (`src/lib/pen.ts`): Extra fine, Fine, Medium and Flex nibs; black, blue-black, blue and sepia inks. Lines swell slightly on downstrokes and when you slow down, thin when fast, pool where the nib rests, and darken where strokes overlap. Stylus pressure is used when available.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/scripts.ts   the hands: built-in + src/hands/*
src/lib/hand.ts      script fonts: measuring, wrapping
src/lib/recording.ts recorder → hand.json
src/lib/sheet.ts     guideline layout and drawing
src/components/      Sheet (canvas + pen), PracticeShell, ui
src/lib/pen.ts       nibs, inks, fountain-pen stroke model
src/lib/ductus.ts    stroke order and shapes for A–Z, a–z
src/screens/         Home, Letters, Abc, Quotes, Write, Record
src/hands/           your own hands (hand.json + font)
src/state/practice   storage-backed context (swap for an API later)
```
