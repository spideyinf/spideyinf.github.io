/* Writing to Learn: notifications in the service worker.
   Imported into the generated service worker (see vite.config.ts).
   - Tapping a notification opens (or focuses) the app on the screen it names.
   - Where the browser runs periodic background checks (an installed app in
     Chromium), today's reminder can arrive with the app closed. The page keeps
     a small snapshot of the settings in the Cache API for this. */

const SNAP_CACHE = 'wtl-notify'
const SNAP_URL = '__notify.json'

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const href = (event.notification.data && event.notification.data.href) || '#/'
  const url = new URL(href, self.registration.scope).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) {
        if (c.url.startsWith(self.registration.scope)) {
          return c.focus().then((w) => (w && 'navigate' in w ? w.navigate(url) : w))
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'wtl-reminder') event.waitUntil(remind())
})

const pad = (n) => String(n).padStart(2, '0')

async function remind() {
  const cache = await caches.open(SNAP_CACHE)
  const res = await cache.match(SNAP_URL)
  if (!res) return
  const s = await res.json()
  if (!s.enabled || !s.remind) return
  const now = new Date()
  const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  const weekday = (now.getDay() + 6) % 7
  const [h, m] = String(s.time || '20:00').split(':').map(Number)
  if (!s.days || !s.days[weekday]) return
  if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return
  if (s.wroteDay === today || s.lastRemind === today) return
  await self.registration.showNotification(s.title, { body: s.body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'remind', data: { href: s.href } })
  s.lastRemind = today
  await cache.put(SNAP_URL, new Response(JSON.stringify(s)))
}
