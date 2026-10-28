// Notifications, one engine for two worlds:
//
// - In the wrapped app (Capacitor on iOS / Android) the daily reminder is a
//   real native local notification, scheduled by the OS for each chosen
//   weekday at the chosen time. It arrives with the app closed; tapping it
//   opens the right screen.
// - On the web it uses the Notification API through the service worker. A
//   page can't schedule a notification for later, so the reminder is shown
//   when it's due and the app is opened or already open, and, where the
//   browser allows it (installed app, Chromium), from a periodic background
//   check in the service worker.
//
// While the app is in front, a notification appears as an in-app banner in
// the same native style instead. Every notification also lands in the inbox.

import { Capacitor } from '@capacitor/core'
import { useSyncExternalStore } from 'react'
import { dayKey } from './date'
import { LETTERS } from './letters'
import { SCRIPTS, scriptById } from './scripts'

/* ---------- Types and storage ---------- */

export type Kind = 'remind' | 'feed' | 'loves' | 'styles' | 'test'

export type Prefs = {
  /** The person turned notifications on (and the platform allowed them). */
  enabled: boolean
  remind: boolean
  /** "HH:MM", local time. */
  time: string
  /** Monday first. */
  days: boolean[]
  feed: boolean
  loves: boolean
  styles: boolean
  /** No pages or styles notifications from 10 pm to 7 am. */
  quiet: boolean
}

export type Note = {
  id: string
  kind: Kind
  title: string
  body: string
  href: string
  at: number
  read?: boolean
  /** A letter or word to show beside it, in a hand's font. */
  sample?: { text: string; font: string }
}

const PREFS_KEY = 'wtl:notify'
const INBOX_KEY = 'wtl:inbox'
const LAST_KEY = 'wtl:notify-last'
const STYLES_KEY = 'wtl:known-styles'
const SNAP_CACHE = 'wtl-notify'
const SNAP_URL = '__notify.json'

export const DEFAULT_PREFS: Prefs = {
  enabled: false,
  remind: true,
  time: '20:00',
  days: [true, true, true, true, true, true, true],
  feed: true,
  loves: true,
  styles: true,
  quiet: true,
}

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}
const readList = <T,>(key: string): T[] => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]')
  } catch {
    return []
  }
}
const write = (key: string, v: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(v))
  } catch {
    /* storage full or blocked */
  }
}

/* ---------- A tiny store for React ---------- */

let prefs: Prefs = read(PREFS_KEY, DEFAULT_PREFS)
let inbox: Note[] = readList<Note>(INBOX_KEY)
const subs = new Set<() => void>()
const emit = () => subs.forEach((f) => f())
const subscribe = (f: () => void) => {
  subs.add(f)
  return () => subs.delete(f)
}

export const usePrefs = () => useSyncExternalStore(subscribe, () => prefs)
export const useInbox = () => useSyncExternalStore(subscribe, () => inbox)

export function setPrefs(patch: Partial<Prefs>) {
  prefs = { ...prefs, ...patch }
  write(PREFS_KEY, prefs)
  emit()
  void sync()
}

function addToInbox(n: Note) {
  inbox = [n, ...inbox.filter((x) => x.id !== n.id)].slice(0, 60)
  write(INBOX_KEY, inbox)
  emit()
}
export function markRead(id?: string) {
  inbox = inbox.map((n) => (!id || n.id === id ? { ...n, read: true } : n))
  write(INBOX_KEY, inbox)
  emit()
}
export function clearInbox() {
  inbox = []
  write(INBOX_KEY, inbox)
  emit()
}

/* ---------- The in-app banner ---------- */

const bannerSubs = new Set<(n: Note) => void>()
export function onBanner(f: (n: Note) => void) {
  bannerSubs.add(f)
  return () => {
    bannerSubs.delete(f)
  }
}

/* ---------- Platforms ---------- */

export type Permission = 'granted' | 'denied' | 'default' | 'unsupported'

type Platform = {
  kind: 'native' | 'web'
  permission(): Promise<Permission>
  request(): Promise<Permission>
  show(n: Note): Promise<void>
  /** Schedule (or clear) the repeating daily reminder. */
  schedule(p: Prefs, reminder: Reminder): Promise<void>
}

type Reminder = { title: string; body: string; href: string }

const ICON = 'icon-192.png'

const native: Platform = {
  kind: 'native',
  async permission() {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const s = await LocalNotifications.checkPermissions()
    return s.display === 'granted' ? 'granted' : s.display === 'denied' ? 'denied' : 'default'
  },
  async request() {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const s = await LocalNotifications.requestPermissions()
    return s.display === 'granted' ? 'granted' : s.display === 'denied' ? 'denied' : 'default'
  },
  async show(n) {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.schedule({
      notifications: [{ id: Math.floor(Math.random() * 1e6) + 10_000, title: n.title, body: n.body, extra: { href: n.href } }],
    })
  },
  async schedule(p, r) {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    // One repeating notification per weekday: ids 1001 (Monday) … 1007 (Sunday).
    const ids = [1001, 1002, 1003, 1004, 1005, 1006, 1007]
    await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) })
    if (!p.enabled || !p.remind) return
    const [hour, minute] = p.time.split(':').map(Number)
    const notifications = p.days.flatMap((on, i) =>
      on
        ? [
            {
              id: ids[i],
              title: r.title,
              body: r.body,
              extra: { href: r.href },
              // Capacitor counts Sunday as 1, Monday as 2 … Saturday as 7.
              schedule: { on: { weekday: (i === 6 ? 1 : i + 2) as 1 | 2 | 3 | 4 | 5 | 6 | 7, hour, minute }, allowWhileIdle: true },
            },
          ]
        : [],
    )
    if (notifications.length) await LocalNotifications.schedule({ notifications })
  },
}

const webSupported = () => typeof window !== 'undefined' && 'Notification' in window

const web: Platform = {
  kind: 'web',
  async permission() {
    return webSupported() ? Notification.permission : 'unsupported'
  },
  async request() {
    if (!webSupported()) return 'unsupported'
    return Notification.requestPermission()
  },
  async show(n) {
    if (!webSupported() || Notification.permission !== 'granted') return
    const options: NotificationOptions = { body: n.body, icon: ICON, badge: ICON, tag: n.kind, data: { href: n.href } }
    const reg = 'serviceWorker' in navigator ? await navigator.serviceWorker.getRegistration() : undefined
    if (reg) await reg.showNotification(n.title, options)
    else new Notification(n.title, options)
  },
  async schedule(p, r) {
    // The service worker reads this snapshot when the browser wakes it for a periodic check.
    if (!('caches' in window)) return
    const cache = await caches.open(SNAP_CACHE)
    await cache.put(SNAP_URL, new Response(JSON.stringify({ ...p, ...r, wroteDay: wroteToday() ? dayKey() : '', lastRemind: lastRemind() })))
    if (!p.enabled || !p.remind) return
    try {
      const reg = await navigator.serviceWorker?.getRegistration()
      if (!reg) return
      const ps = (reg as ServiceWorkerRegistration & { periodicSync?: { register(tag: string, o: { minInterval: number }): Promise<void> } }).periodicSync
      if (ps) await ps.register('wtl-reminder', { minInterval: 60 * 60 * 1000 })
    } catch {
      /* not installed, or the browser said no: reminders come when the app is opened */
    }
  },
}

export const platform: Platform = Capacitor.isNativePlatform() ? native : web

/** How reminders are delivered here, in plain words, for the settings screen. */
export function deliveryNote(p: Permission) {
  if (platform.kind === 'native') return p === 'denied' ? 'Notifications are off for Writing to Learn in your phone’s Settings.' : null
  if (p === 'unsupported') return 'This browser can’t show notifications. On iPhone, add Writing to Learn to your Home Screen first (Share › Add to Home Screen).'
  if (p === 'denied') return 'Notifications are blocked for this site in your browser’s settings.'
  return 'In the browser, your reminder arrives when it’s due and the app is open, or soon after you open it. The app for iPhone and Android delivers it on time, even when closed.'
}

/* ---------- What the reminder says ---------- */

type Practice = { days?: Record<string, { letters: string[]; quotes: string[] }>; script?: string }
const practice = (): Practice => read<Practice>('daily-hand:v1', {})

function wroteToday() {
  const d = practice().days?.[dayKey()]
  return !!d && d.letters.length + d.quotes.length > 0
}

function reminder(): Reminder & { sample: Note['sample'] } {
  const p = practice()
  const script = scriptById(p.script)
  const done = (p.days?.[dayKey()]?.letters ?? []).map((l) => (l.includes(':') ? l.split(':') : ['copperplate', l])).filter(([id]) => id === script.id).map(([, l]) => l)
  const L = LETTERS.find((l) => !done.includes(l)) ?? 'A'
  return {
    title: 'Your page is waiting',
    body: `One line of ${L.toLowerCase()} in ${script.name}. Five quiet minutes.`,
    href: `#/abc/${L}`,
    sample: { text: L.toLowerCase(), font: script.font },
  }
}

const lastRemind = () => {
  try {
    return localStorage.getItem(LAST_KEY) ?? ''
  } catch {
    return ''
  }
}

/* ---------- Delivering ---------- */

const minutesOf = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}
const nowMinutes = () => {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}
const inQuiet = () => {
  const m = nowMinutes()
  return m >= 22 * 60 || m < 7 * 60
}
const kindOn = (k: Kind) => k === 'test' || (k === 'remind' ? prefs.remind : prefs[k])

/**
 * Deliver a notification: into the inbox, and then either as an in-app banner
 * (the app is in front) or as a system notification (it isn't). `system`
 * forces the system notification, for the test.
 */
export async function deliver(n: Omit<Note, 'id' | 'at'> & { id?: string }, opts: { system?: boolean; inboxOnly?: boolean } = {}) {
  const note: Note = { ...n, id: n.id ?? `${n.kind}-${Date.now()}`, at: Date.now() }
  if (n.kind !== 'test') addToInbox(note)
  if (opts.inboxOnly || !prefs.enabled || !kindOn(n.kind)) return
  if (n.kind !== 'remind' && n.kind !== 'test' && prefs.quiet && inQuiet()) return
  const front = document.visibilityState === 'visible'
  if (front && !opts.system) bannerSubs.forEach((f) => f(note))
  else await platform.show(note).catch(() => bannerSubs.forEach((f) => f(note)))
}

/** Is today's reminder due and not yet sent? */
async function checkReminder() {
  if (!prefs.remind) return
  const today = dayKey()
  const weekday = (new Date().getDay() + 6) % 7 // Monday = 0
  if (!prefs.days[weekday] || nowMinutes() < minutesOf(prefs.time) || wroteToday()) return
  // The service worker may already have sent it.
  let last = lastRemind()
  try {
    const snap = await (await caches.open(SNAP_CACHE)).match(SNAP_URL)
    if (snap) last = (await snap.json()).lastRemind || last
  } catch {
    /* no cache: use ours */
  }
  if (last === today) return
  try {
    localStorage.setItem(LAST_KEY, today)
  } catch {
    /* ignore */
  }
  const r = reminder()
  // In the app the OS already showed it at the right time; just keep it in the inbox.
  await deliver({ id: `remind-${today}`, kind: 'remind', ...r }, { inboxOnly: platform.kind === 'native' })
}

/** A hand added since last time: tell people once. */
async function checkStyles() {
  const ids = SCRIPTS.filter((s) => s.id !== 'draft').map((s) => s.id)
  let known: string[] | null = null
  try {
    known = JSON.parse(localStorage.getItem(STYLES_KEY) ?? 'null')
  } catch {
    known = null
  }
  write(STYLES_KEY, ids)
  if (!known) return // first run: nothing is "new"
  for (const s of SCRIPTS.filter((x) => ids.includes(x.id) && !known.includes(x.id))) {
    await deliver({
      id: `styles-${s.id}`,
      kind: 'styles',
      title: `New letter style: ${s.name}`,
      body: 'Learn it stroke by stroke, starting with a.',
      href: '#/hands',
      sample: { text: 'Aa', font: s.font },
    })
  }
}

/** Keep the platform's schedule in step with the settings and today's progress. */
export async function sync() {
  try {
    const r = reminder()
    await platform.schedule(prefs, { title: r.title, body: r.body, href: r.href })
  } catch {
    /* scheduling is best effort */
  }
}

/** Ask to turn notifications on. Returns what the platform said. */
export async function enable(patch: Partial<Prefs> = {}): Promise<Permission> {
  const p = await platform.request().catch(() => 'denied' as Permission)
  prefs = { ...prefs, ...patch, enabled: p === 'granted' }
  write(PREFS_KEY, prefs)
  emit()
  void sync()
  return p
}

export async function sendTest() {
  const r = reminder()
  await deliver({ kind: 'test', title: 'Writing to Learn', body: 'This is how your reminder will look.', href: r.href, sample: r.sample }, { system: true })
}

let started = false
/** Start the engine once: check now, when the app comes back to the front, and every minute while open. */
export function startNotifications() {
  if (started || typeof window === 'undefined') return
  started = true
  const tick = () => {
    void checkReminder()
  }
  void checkStyles()
  void sync()
  tick()
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && tick())
  setInterval(tick, 60_000)
  if (platform.kind === 'native') {
    void import('@capacitor/local-notifications').then(({ LocalNotifications }) =>
      LocalNotifications.addListener('localNotificationActionPerformed', (a) => {
        const href = a.notification.extra?.href
        if (typeof href === 'string') location.hash = href.replace(/^#/, '')
      }),
    )
  }
}

/** Call when today's progress changes, so tonight's reminder knows. */
export const progressChanged = () => void sync()

/** What each kind looks like in lists. */
export const KIND_STYLE: Record<Kind, { tile: string; icon: string; label: string }> = {
  remind: { tile: '#1E3A5F', icon: 'M6 16.5 V11 A6 6 0 0 1 18 11 V16.5 L19.5 18 H4.5 Z M10 20.5 A2.2 2.2 0 0 0 14 20.5', label: 'Reminders' },
  test: { tile: '#1E3A5F', icon: 'M6 16.5 V11 A6 6 0 0 1 18 11 V16.5 L19.5 18 H4.5 Z M10 20.5 A2.2 2.2 0 0 0 14 20.5', label: 'Reminders' },
  feed: { tile: '#92400E', icon: 'M12 3.5 A5.5 5.5 0 1 1 11.99 3.5 Z M8.8 13.2 L7.5 20.5 L12 18 L16.5 20.5 L15.2 13.2', label: 'Pages' },
  loves: { tile: '#92400E', icon: 'M12 20 C6 15.5 3 12.4 3 8.8 C3 6.2 5 4.4 7.4 4.4 C9.2 4.4 10.8 5.4 12 7.2 C13.2 5.4 14.8 4.4 16.6 4.4 C19 4.4 21 6.2 21 8.8 C21 12.4 18 15.5 12 20 Z', label: 'Pages' },
  styles: { tile: '#2F6A62', icon: 'M3 18 L8 6 L13 18 M5 14 H11 M19.5 18 V12 M19.5 13.5 A3 3 0 1 0 19.5 16.5', label: 'Letter styles' },
}
