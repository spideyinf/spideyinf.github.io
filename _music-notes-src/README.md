# Note map

Interactive comparison of notes on the piano, the staff and the guitar fretboard.
Live at https://spideyinf.github.io/music-notes/

```bash
npm install
npm run dev     # local dev server
npm run build   # writes the production build to ../music-notes
```

Stack: React 19 + TypeScript, styled-components, Tailwind CSS v4, Vite. Sound is synthesized with the Web Audio API (Karplus–Strong for guitar).
