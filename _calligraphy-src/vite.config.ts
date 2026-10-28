import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Built into ../calligraphy so GitHub Pages serves it at
// https://spideyinf.github.io/calligraphy/
// `npm run build:app` (mode "app") builds the same app for the iOS and
// Android wrappers (Capacitor): relative paths, no service worker, into
// dist-app/. See capacitor.config.ts.
export default defineConfig(({ mode }) => {
  const app = mode === 'app'
  return {
  base: app ? './' : '/calligraphy/',
  plugins: [
    react(),
    tailwindcss(),
    !app &&
    // Installable on the home screen, and works offline once opened.
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png', 'favicon.svg'],
      manifest: {
        name: 'Writing to Learn',
        short_name: 'Writing to Learn',
        description: 'Paper, pen and ink. Learn a hand stroke by stroke, then write a line every day on real paper.',
        lang: 'en',
        start_url: '/calligraphy/',
        scope: '/calligraphy/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FBF6EA',
        theme_color: '#FBF6EA',
        categories: ['education', 'lifestyle', 'productivity'],
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Notification taps and the background reminder check (public/notify-sw.js).
        importScripts: ['notify-sw.js'],
        // The text reader is big: not precached, but kept once fetched, so it works offline after first use.
        globIgnores: ['ocr/**'],
        runtimeCaching: [{ urlPattern: /\/ocr\//, handler: 'CacheFirst', options: { cacheName: 'wtl-ocr', expiration: { maxEntries: 12 } } }],
        // Fonts, paper scans and the app itself, so writing works on a plane.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: {
    outDir: fileURLToPath(new URL(app ? './dist-app' : '../calligraphy', import.meta.url)),
    emptyOutDir: true,
  },
  }
})
