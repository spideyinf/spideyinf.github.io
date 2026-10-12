# Daily Hand

A daily calligraphy practice sheet, after William Zinsser's *Writing to Learn*.
Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **ABC**: a stroke-by-stroke tutorial for every capital (Copperplate) and lowercase (business cursive) letter, with play, previous and next. The stroke data lives in `src/lib/ductus.ts`, authored upright in x-height units and slanted to 55°; downstrokes are shaded like a pointed pen. Below it you trace the same letters on Copperplate guidelines.
- The combined hand in text: Pinyon Script capitals with Ephesis lowercase.
- Paper: real scans from [Subtle Patterns](https://github.com/subtlepatterns/SubtlePatterns) (CC BY-SA 3.0) with a generated aging layer; see `src/assets/paper/CREDITS.md`. Open `#/ductus` in `npm run dev` for a contact sheet of all letters.
- **Paragraph**: built-in public-domain quotes or your own, wrapped into ruled pages.
- Fountain-pen ink on canvas (`src/lib/pen.ts`): Extra fine, Fine, Medium and Flex nibs; black, blue-black, blue and sepia inks. Lines swell slightly on downstrokes and when you slow down, thin when fast, pool where the nib rests, and darken where strokes overlap. Stylus pressure is used when available.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/hand.ts      combined-hand fonts, measuring, wrapping
src/lib/sheet.ts     guideline layout and drawing
src/components/      Sheet (canvas + pen), PracticeShell, ui
src/lib/pen.ts       nibs, inks, fountain-pen stroke model
src/lib/ductus.ts    stroke order and shapes for A–Z, a–z
src/screens/         Home, Letters, Abc, Quotes, Write
src/state/practice   storage-backed context (swap for an API later)
```
