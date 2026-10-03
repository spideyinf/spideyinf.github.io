import { useCallback, useEffect, useRef, useState } from 'react'
import { isBlack, pitchClass } from '../lib/music'

export type Prompt = 'staff' | 'name' | 'sound'
export type Level = 'treble' | 'middle' | 'full'

export const LEVELS: Record<Level, { label: string; range: [number, number] }> = {
  middle: { label: 'C4 – C5', range: [60, 72] },
  treble: { label: 'C4 – G5', range: [60, 79] },
  full: { label: 'E2 – G5', range: [40, 79] },
}

export type QuizState = {
  target: number
  answered: boolean
  /** Answered by the player rather than revealed with "Show me" */
  solved: boolean
  wrong: number | null
  score: number
  total: number
  streak: number
  best: number
}

function pick(level: Level, naturalsOnly: boolean, avoid?: number) {
  const [lo, hi] = LEVELS[level].range
  const pool: number[] = []
  for (let m = lo; m <= hi; m++) if ((!naturalsOnly || !isBlack(m)) && m !== avoid) pool.push(m)
  return pool[Math.floor(Math.random() * pool.length)]
}

export function useQuiz(opts: { level: Level; naturalsOnly: boolean; anyOctave: boolean; onCorrect?: () => void }) {
  const { level, naturalsOnly, anyOctave } = opts
  const [q, setQ] = useState<QuizState>(() => ({
    target: pick(level, naturalsOnly),
    answered: false,
    solved: false,
    wrong: null,
    score: 0,
    total: 0,
    streak: 0,
    best: 0,
  }))
  const missed = useRef(false)
  const timer = useRef<number | undefined>(undefined)

  const next = useCallback(() => {
    window.clearTimeout(timer.current)
    missed.current = false
    setQ((s) => ({ ...s, target: pick(level, naturalsOnly, s.target), answered: false, solved: false, wrong: null }))
  }, [level, naturalsOnly])

  // New question whenever the settings change
  useEffect(() => {
    next()
  }, [next])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const answer = useCallback(
    (midi: number) => {
      if (q.answered) return
      const ok = anyOctave ? pitchClass(midi) === pitchClass(q.target) : midi === q.target
      if (ok) {
        const first = !missed.current
        setQ((s) => {
          const streak = first ? s.streak + 1 : 0
          return {
            ...s,
            answered: true,
            solved: true,
            wrong: null,
            score: s.score + (first ? 1 : 0),
            total: s.total + (first ? 1 : 0),
            streak,
            best: Math.max(s.best, streak),
          }
        })
        opts.onCorrect?.()
        timer.current = window.setTimeout(next, 1400)
      } else {
        if (!missed.current) setQ((s) => ({ ...s, total: s.total + 1, streak: 0 }))
        missed.current = true
        setQ((s) => ({ ...s, wrong: midi }))
      }
      return ok
    },
    [q.answered, q.target, anyOctave, next, opts],
  )

  const reveal = useCallback(() => {
    if (q.answered) return
    if (!missed.current) setQ((s) => ({ ...s, total: s.total + 1, streak: 0 }))
    missed.current = true
    setQ((s) => ({ ...s, answered: true, solved: false, wrong: null }))
  }, [q.answered])

  const reset = useCallback(() => {
    setQ((s) => ({ ...s, score: 0, total: 0, streak: 0, best: 0 }))
    next()
  }, [next])

  return { q, answer, next, reveal, reset }
}
