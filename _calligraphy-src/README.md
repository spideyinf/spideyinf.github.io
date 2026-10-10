# Daily Hand

A daily calligraphy practice sheet, after William Zinsser's *Writing to Learn*.
Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **ABC**: Copperplate capitals (Pinyon Script) with business-cursive lowercase (Ephesis, italic and shaded to match), traced on Copperplate guidelines (ascender, x-height, baseline, descender, 55° slant).
- **Paragraph**: built-in public-domain quotes or your own, wrapped into ruled pages.
- Fountain-pen ink on canvas (`src/lib/pen.ts`): Extra fine, Fine, Medium and Flex nibs; black, blue-black, blue and sepia inks. Lines swell slightly on downstrokes and when you slow down, thin when fast, pool where the nib rests, and darken where strokes overlap. Stylus pressure is used when available.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/hand.ts      combined-hand fonts, measuring, wrapping
src/lib/sheet.ts     guideline layout and drawing
src/components/      Sheet (canvas + pen), PracticeShell, ui
src/lib/pen.ts       nibs, inks, fountain-pen stroke model
src/screens/         Home, Letters, Abc, Quotes, Write
src/state/practice   storage-backed context (swap for an API later)
```
