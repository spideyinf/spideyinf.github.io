/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { dayKey } from '../lib/date'
import { BUILT_IN_QUOTES, type Quote } from '../lib/quotes'

// Everything is kept on this device (localStorage). The shape is versioned
// so it can later move to a backend without losing anyone's pages.
const KEY = 'daily-hand:v1'
const MAX_PAGES = 30

export type DayLog = { letters: string[]; quotes: string[] }
export type SavedPage = { id: string; day: string; kind: 'abc' | 'paragraph'; label: string; src: string }

type Stored = { days: Record<string, DayLog>; pages: SavedPage[]; quotes: Quote[] }

const empty: Stored = { days: {}, pages: [], quotes: [] }

function load(): Stored {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...empty, ...JSON.parse(raw) } : empty
  } catch {
    return empty
  }
}

function save(data: Stored) {
  let d = data
  // If storage is full, drop the oldest pages until it fits.
  for (;;) {
    try {
      localStorage.setItem(KEY, JSON.stringify(d))
      return
    } catch {
      if (!d.pages.length) return
      d = { ...d, pages: d.pages.slice(0, -1) }
    }
  }
}

function computeStreak(days: Record<string, DayLog>, todayKey: string) {
  const [y, m, d0] = todayKey.split('-').map(Number)
  const d = new Date(y, m - 1, d0)
  // Today still counts as "in progress": the streak isn't broken until tomorrow.
  if (!days[dayKey(d)]) d.setDate(d.getDate() - 1)
  let n = 0
  while (days[dayKey(d)]) {
    n++
    d.setDate(d.getDate() - 1)
  }
  return n
}

type Ctx = {
  days: Record<string, DayLog>
  pages: SavedPage[]
  quotes: Quote[]
  today: DayLog
  streak: number
  savePage: (p: Omit<SavedPage, 'id' | 'day'>, mark: { letter?: string; quoteId?: string }) => void
  deletePage: (id: string) => void
  addQuote: (text: string, author: string) => Quote
  deleteQuote: (id: string) => void
}

const PracticeContext = createContext<Ctx | null>(null)

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Stored>(load)
  useEffect(() => save(data), [data])

  // Fixed for the session; a reload on a new day picks up the new date.
  const [todayKey] = useState(dayKey)
  const today = useMemo(() => data.days[todayKey] ?? { letters: [], quotes: [] }, [data.days, todayKey])
  const streak = useMemo(() => computeStreak(data.days, todayKey), [data.days, todayKey])

  const savePage = useCallback<Ctx['savePage']>((p, mark) => {
    setData((prev) => {
      const day = dayKey()
      const log = prev.days[day] ?? { letters: [], quotes: [] }
      const next: DayLog = {
        letters: mark.letter && !log.letters.includes(mark.letter) ? [...log.letters, mark.letter] : log.letters,
        quotes: mark.quoteId && !log.quotes.includes(mark.quoteId) ? [...log.quotes, mark.quoteId] : log.quotes,
      }
      const page: SavedPage = { ...p, id: crypto.randomUUID(), day }
      return { ...prev, days: { ...prev.days, [day]: next }, pages: [page, ...prev.pages].slice(0, MAX_PAGES) }
    })
  }, [])

  const deletePage = useCallback((id: string) => {
    setData((prev) => ({ ...prev, pages: prev.pages.filter((p) => p.id !== id) }))
  }, [])

  const addQuote = useCallback((text: string, author: string) => {
    const q: Quote = { id: `my-${Date.now().toString(36)}`, text: text.trim(), author: author.trim(), custom: true }
    setData((prev) => ({ ...prev, quotes: [q, ...prev.quotes] }))
    return q
  }, [])

  const deleteQuote = useCallback((id: string) => {
    setData((prev) => ({ ...prev, quotes: prev.quotes.filter((q) => q.id !== id) }))
  }, [])

  const value = useMemo<Ctx>(
    () => ({
      days: data.days,
      pages: data.pages,
      quotes: [...data.quotes, ...BUILT_IN_QUOTES],
      today,
      streak,
      savePage,
      deletePage,
      addQuote,
      deleteQuote,
    }),
    [data, today, streak, savePage, deletePage, addQuote, deleteQuote],
  )

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>
}

export function usePractice() {
  const ctx = useContext(PracticeContext)
  if (!ctx) throw new Error('usePractice must be used inside PracticeProvider')
  return ctx
}
