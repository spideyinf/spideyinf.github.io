# Daily Hand

A daily calligraphy practice sheet, after William Zinsser's *Writing to Learn*.
Live at https://spideyinf.github.io/calligraphy/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../calligraphy
```

- **ABC**: Copperplate capitals (Pinyon Script) with business-cursive lowercase (Sacramento), traced on Copperplate guidelines (ascender, x-height, baseline, descender, 55° slant).
- **Paragraph**: built-in public-domain quotes or your own, wrapped into ruled pages.
- Pointed-pen ink on canvas: strokes swell on downstrokes and thin on upstrokes; stylus pressure is used when available.
- Saved pages, quotes and the daily streak live in localStorage (`daily-hand:v1`).

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite.

```
src/lib/hand.ts      combined-hand fonts, measuring, wrapping
src/lib/sheet.ts     guideline layout and drawing
src/components/      Sheet (canvas + pen), PracticeShell, ui
src/screens/         Home, Abc, Quotes, Write
src/state/practice   storage-backed context (swap for an API later)
```
