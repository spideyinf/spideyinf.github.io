// The greatest achievement: pages people wrote by hand today, ranked by loves.
//
// This is the base. The source of posts is one function, `fetchFeed`, so a
// backend (the Worker + D1 + R2 plan) can be plugged in without touching the
// screens. Until there is one, the feed is honestly empty; a clearly labelled
// sample can be shown so the layout can be seen. Your reactions are kept on
// this device.

import { useSyncExternalStore } from 'react'

export type Reaction = 'love' | 'beautiful' | 'inspired'
export const REACTIONS: { id: Reaction; label: string }[] = [
  { id: 'love', label: 'Love' },
  { id: 'beautiful', label: 'Beautiful' },
  { id: 'inspired', label: 'Inspired' },
]

export type Post = {
  id: string
  author: { name: string; color: string }
  /** The hand it was written in (a script id) and its display name. */
  hand: string
  handName: string
  /** When it was posted, ms since epoch. */
  at: number
  /** A photo of the page, when there is one. */
  image?: string
  /** The words on the page, read from the photo (also the alt text). */
  lines: string[]
  lang?: string
  tools: { pen?: string; ink?: string; paper?: string }
  counts: Record<Reaction, number>
  /** Sample content for the preview, not a real person's page. */
  sample?: boolean
}

export type Feed = { top: Post[]; all: Post[] }

/** Where posts come from. Set VITE_FEED_URL to a backend that returns a Feed as JSON. */
const FEED_URL = import.meta.env.VITE_FEED_URL as string | undefined

export async function fetchFeed(): Promise<Feed> {
  if (!FEED_URL) return { top: [], all: [] }
  const res = await fetch(FEED_URL)
  if (!res.ok) throw new Error(`Feed ${res.status}`)
  return (await res.json()) as Feed
}

/** Is sharing open (a backend configured)? */
export const sharingOpen = !!FEED_URL

/* ---------- Sample, for the preview only ---------- */

const hour = 3600_000
const ago = (h: number) => Date.now() - h * hour

const SAMPLE_POSTS: Post[] = [
  {
    id: 's1',
    author: { name: 'Sample writer A', color: '#1E3A5F' },
    hand: 'copperplate',
    handName: 'Copperplate',
    at: ago(2),
    lines: ['Nulla dies sine linea.', 'No day without a line.', '', '— Pliny the Elder'],
    tools: { pen: 'A fine fountain pen', ink: 'Blue-black', paper: 'Smooth notebook paper' },
    counts: { love: 36, beautiful: 12, inspired: 5 },
    sample: true,
  },
  {
    id: 's2',
    author: { name: 'Sample writer B', color: '#92400E' },
    hand: 'italic',
    handName: 'Italic',
    at: ago(5),
    lines: ['Little by little,', 'one travels far.'],
    tools: { pen: 'A stub nib', ink: 'Dark red' },
    counts: { love: 20, beautiful: 8, inspired: 3 },
    sample: true,
  },
  {
    id: 's3',
    author: { name: 'Sample writer C', color: '#2F6A62' },
    hand: 'vietnamese',
    handName: 'Vietnamese',
    at: ago(6),
    lang: 'vi',
    lines: ['Có công mài sắt,', 'có ngày nên kim.'],
    tools: { pen: 'A school fountain pen', ink: 'Violet' },
    counts: { love: 17, beautiful: 6, inspired: 6 },
    sample: true,
  },
  {
    id: 's4',
    author: { name: 'Sample writer D', color: '#6B4A2F' },
    hand: 'print',
    handName: 'Modern print',
    at: ago(8),
    lines: ['While we teach,', 'we learn.', '', '— Seneca'],
    tools: { pen: 'A medium nib' },
    counts: { love: 11, beautiful: 2, inspired: 4 },
    sample: true,
  },
  {
    id: 's5',
    author: { name: 'Sample writer E', color: '#27305E' },
    hand: 'monoline',
    handName: 'Monoline',
    at: ago(9),
    lines: ['Aa Bb Cc Dd', 'Ee Ff Gg'],
    tools: { paper: 'Dot grid' },
    counts: { love: 9, beautiful: 5, inspired: 1 },
    sample: true,
  },
  {
    id: 's6',
    author: { name: 'Sample writer F', color: '#6A2328' },
    hand: 'business',
    handName: 'Business',
    at: ago(11),
    lines: ['Well begun', 'is half done.', '', '— Aristotle'],
    tools: { pen: 'An everyday pen' },
    counts: { love: 7, beautiful: 3, inspired: 2 },
    sample: true,
  },
]

export const SAMPLE_FEED: Feed = { top: SAMPLE_POSTS.slice(0, 3), all: SAMPLE_POSTS }

/* ---------- Preview switch (this session) ---------- */

const PREVIEW_KEY = 'wtl:feed-preview'
const listeners = new Set<() => void>()
export function setPreview(on: boolean) {
  try {
    if (on) sessionStorage.setItem(PREVIEW_KEY, '1')
    else sessionStorage.removeItem(PREVIEW_KEY)
  } catch {
    /* storage blocked */
  }
  listeners.forEach((l) => l())
}
const readPreview = () => {
  try {
    return sessionStorage.getItem(PREVIEW_KEY) === '1'
  } catch {
    return false
  }
}
export function usePreview() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => listeners.delete(l)
    },
    readPreview,
  )
}

/* ---------- Your reactions (this device) ---------- */

const REACT_KEY = 'wtl:reactions'
const rListeners = new Set<() => void>()
let rCache: Record<string, Reaction[]> | null = null
const readReactions = () => {
  if (rCache) return rCache
  try {
    rCache = JSON.parse(localStorage.getItem(REACT_KEY) ?? '{}')
  } catch {
    rCache = {}
  }
  return rCache!
}
export function toggleReaction(postId: string, r: Reaction) {
  const all = { ...readReactions() }
  const mine = new Set(all[postId] ?? [])
  if (mine.has(r)) mine.delete(r)
  else mine.add(r)
  all[postId] = [...mine]
  rCache = all
  try {
    localStorage.setItem(REACT_KEY, JSON.stringify(all))
  } catch {
    /* storage full or blocked: keep it for this session */
  }
  rListeners.forEach((l) => l())
}
export function useReactions() {
  return useSyncExternalStore((l) => {
    rListeners.add(l)
    return () => rListeners.delete(l)
  }, readReactions)
}

/** Is the full feed unlocked? Payments open with the app; until then, never. */
export const unlocked = false

export function timeAgo(at: number) {
  const m = Math.round((Date.now() - at) / 60000)
  if (m < 60) return `${Math.max(1, m)} min ago`
  const h = Math.round(m / 60)
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`
}
