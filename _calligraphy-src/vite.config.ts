import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Built into ../calligraphy so GitHub Pages serves it at
// https://spideyinf.github.io/calligraphy/
export default defineConfig({
  base: '/calligraphy/',
  plugins: [
    react(),
    tailwindcss(),
    // Installable on the home screen, and works offline once opened.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png', 'favicon.svg'],
      manifest: {
        name: 'Writing to Learn',
        short_name: 'Writing to Learn',
        description: 'Paper, fountain pen and ink on your phone. Learn a hand stroke by stroke and write a line every day.',
        lang: 'en',
        start_url: '/calligraphy/',
        scope: '/calligraphy/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#E9E1D0',
        theme_color: '#E9E1D0',
        categories: ['education', 'lifestyle', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Fonts, paper scans and the app itself, so writing works on a plane.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    outDir: fileURLToPath(new URL('../calligraphy', import.meta.url)),
    emptyOutDir: true,
  },
})
