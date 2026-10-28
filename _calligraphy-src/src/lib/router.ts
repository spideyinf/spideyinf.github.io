import { useSyncExternalStore } from 'react'

// Hash routing keeps deep links working on GitHub Pages without a 404 fallback.
export type Route =
  | { name: 'home' }
  | { name: 'letters' }
  | { name: 'abc'; letter: string }
  | { name: 'quotes' }
  | { name: 'write'; quoteId: string }
  | { name: 'record' }
  | { name: 'hands' }
  | { name: 'preface' }
  | { name: 'guide' }
  | { name: 'trace' }
  | { name: 'pages' }
  | { name: 'settings' }
  | { name: 'achievement' }
  | { name: 'feed' }
  | { name: 'unlock' }
  | { name: 'inbox' }
  | { name: 'notifications' }
  | { name: 'notify-start' }

export function parse(hash: string): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/')
  if (a === 'abc') return /^[A-Z]$/.test(b ?? '') ? { name: 'abc', letter: b } : { name: 'letters' }
  if (a === 'paragraph' && b) return { name: 'write', quoteId: decodeURIComponent(b) }
  if (a === 'paragraph') return { name: 'quotes' }
  if (a === 'record') return { name: 'record' }
  if (a === 'hands') return { name: 'hands' }
  if (a === 'trace') return { name: 'trace' }
  if (a === 'pages') return { name: 'pages' }
  if (a === 'settings' && b === 'notifications') return { name: 'notifications' }
  if (a === 'settings') return { name: 'settings' }
  if (a === 'achievement' && b === 'all') return { name: 'feed' }
  if (a === 'achievement') return { name: 'achievement' }
  if (a === 'unlock') return { name: 'unlock' }
  if (a === 'inbox') return { name: 'inbox' }
  if (a === 'notifications') return { name: 'notify-start' }
  if (a === 'pens' || a === 'inks') return { name: 'guide' }
  if (a === 'preface' || a === 'prefaces') return { name: 'preface' }
  return { name: 'home' }
}

export const href = {
  home: '#/',
  letters: '#/abc',
  abc: (l: string) => `#/abc/${l}`,
  quotes: '#/paragraph',
  write: (id: string) => `#/paragraph/${encodeURIComponent(id)}`,
  record: '#/record',
  hands: '#/hands',
  preface: '#/preface',
  guide: '#/pens',
  trace: '#/trace',
  pages: '#/pages',
  settings: '#/settings',
  achievement: '#/achievement',
  feed: '#/achievement/all',
  unlock: '#/unlock',
  inbox: '#/inbox',
  notifications: '#/settings/notifications',
  notifyStart: '#/notifications',
}

export const go = (to: string, replace = false) => {
  if (replace) history.replaceState(null, '', to)
  else history.pushState(null, '', to)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

export function useRoute(): Route {
  const hash = useSyncExternalStore(subscribe, () => location.hash)
  return parse(hash)
}
