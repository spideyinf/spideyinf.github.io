import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// Built into ../calligraphy so GitHub Pages serves it at
// https://spideyinf.github.io/calligraphy/
export default defineConfig({
  base: '/calligraphy/',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: fileURLToPath(new URL('../calligraphy', import.meta.url)),
    emptyOutDir: true,
  },
})
