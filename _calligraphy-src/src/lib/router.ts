import { useSyncExternalStore } from 'react'

// Hash routing keeps deep links working on GitHub Pages without a 404 fallback.
export type Route =
  | { name: 'home' }
  | { name: 'letters' }
  | { name: 'abc'; letter: string }
  | { name: 'quotes' }
  | { name: 'write'; quoteId: string }

export function parse(hash: string): Route {
  const [, a, b] = hash.replace(/^#/, '').split('/')
  if (a === 'abc') return /^[A-Z]$/.test(b ?? '') ? { name: 'abc', letter: b } : { name: 'letters' }
  if (a === 'paragraph' && b) return { name: 'write', quoteId: decodeURIComponent(b) }
  if (a === 'paragraph') return { name: 'quotes' }
  return { name: 'home' }
}

export const href = {
  home: '#/',
  letters: '#/abc',
  abc: (l: string) => `#/abc/${l}`,
  quotes: '#/paragraph',
  write: (id: string) => `#/paragraph/${encodeURIComponent(id)}`,
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
