import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Built into ../music-notes so GitHub Pages serves it at
// https://spideyinf.github.io/music-notes/
export default defineConfig({
  base: '/music-notes/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('../music-notes', import.meta.url)),
    emptyOutDir: true,
  },
})
