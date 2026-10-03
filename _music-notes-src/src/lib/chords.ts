import { GUITAR_STRINGS, pitchClass, staffSpelling, type Spelling } from './music'

export type Role = 'R' | '3' | '5' | '7' | '2' | '4'

export type Tone = {
  /** Half-steps above the root */
  semis: number
  /** Degree label shown to the learner, e.g. "♭3" */
  degree: string
  /** Color family */
  role: Role
  /** Letters above the root letter (3rd = 2, 5th = 4, 7th = 6…) */
  letters: number
}

export type Quality = {
  id: string
  name: string
  /** Suffix after the root, e.g. "m7" */
  suffix: string
  tones: Tone[]
  sound: string
  rule: string
}

const R: Tone = { semis: 0, degree: 'R', role: 'R', letters: 0 }
const M3: Tone = { semis: 4, degree: '3', role: '3', letters: 2 }
const m3: Tone = { semis: 3, degree: '♭3', role: '3', letters: 2 }
const P5: Tone = { semis: 7, degree: '5', role: '5', letters: 4 }
const d5: Tone = { semis: 6, degree: '♭5', role: '5', letters: 4 }
const A5: Tone = { semis: 8, degree: '♯5', role: '5', letters: 4 }
const M2: Tone = { semis: 2, degree: '2', role: '2', letters: 1 }
const P4: Tone = { semis: 5, degree: '4', role: '4', letters: 3 }
const m7: Tone = { semis: 10, degree: '♭7', role: '7', letters: 6 }
const M7: Tone = { semis: 11, degree: '7', role: '7', letters: 6 }

export const QUALITIES: Quality[] = [
  {
    id: 'maj',
    name: 'Major',
    suffix: '',
    tones: [R, M3, P5],
    sound: 'Bright, stable, “home”. The chord most songs start and end on.',
    rule: 'Major 3rd (4 half-steps) on the bottom, minor 3rd (3) on top.',
  },
  {
    id: 'min',
    name: 'Minor',
    suffix: 'm',
    tones: [R, m3, P5],
    sound: 'Darker, sad or serious. Only one note differs from major.',
    rule: 'Lower the major chord’s 3rd by one half-step: minor 3rd (3) then major 3rd (4).',
  },
  {
    id: 'dim',
    name: 'Diminished',
    suffix: 'dim',
    tones: [R, m3, d5],
    sound: 'Tense and unstable — it wants to move to another chord.',
    rule: 'Two minor 3rds stacked (3 + 3). Like minor, but the 5th is lowered too.',
  },
  {
    id: 'aug',
    name: 'Augmented',
    suffix: 'aug',
    tones: [R, M3, A5],
    sound: 'Dreamy and floating, a bit eerie. Used as a passing chord.',
    rule: 'Two major 3rds stacked (4 + 4). Like major, but the 5th is raised.',
  },
  {
    id: 'sus2',
    name: 'Suspended 2nd',
    suffix: 'sus2',
    tones: [R, M2, P5],
    sound: 'Open and airy — neither happy nor sad, because there’s no 3rd.',
    rule: 'Replace the 3rd with the 2nd (2 half-steps above the root).',
  },
  {
    id: 'sus4',
    name: 'Suspended 4th',
    suffix: 'sus4',
    tones: [R, P4, P5],
    sound: 'Hanging tension that usually falls back to the major chord (4 → 3).',
    rule: 'Replace the 3rd with the 4th (5 half-steps above the root).',
  },
  {
    id: '7',
    name: 'Dominant 7th',
    suffix: '7',
    tones: [R, M3, P5, m7],
    sound: 'Bluesy and restless; pulls hard toward the chord a 5th below (G7 → C).',
    rule: 'Major triad plus a minor 7th (10 half-steps above the root).',
  },
  {
    id: 'maj7',
    name: 'Major 7th',
    suffix: 'maj7',
    tones: [R, M3, P5, M7],
    sound: 'Soft, warm and jazzy. Common in ballads, bossa nova and city pop.',
    rule: 'Major triad plus a major 7th — one half-step below the octave.',
  },
  {
    id: 'm7',
    name: 'Minor 7th',
    suffix: 'm7',
    tones: [R, m3, P5, m7],
    sound: 'Mellow and smooth; a staple of soul, R&B and jazz.',
    rule: 'Minor triad plus a minor 7th (10 half-steps above the root).',
  },
]

export const INTERVAL_NAMES: Record<number, string> = {
  2: 'major 2nd',
  3: 'minor 3rd',
  4: 'major 3rd',
  5: 'perfect 4th',
  6: 'diminished 5th',
  7: 'perfect 5th',
  8: 'augmented 5th',
  10: 'minor 7th',
  11: 'major 7th',
}

export const INVERSIONS = ['Root position', '1st inversion', '2nd inversion', '3rd inversion']

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const NATURAL = [0, 2, 4, 5, 7, 9, 11]
const ACC: Record<number, string> = { [-2]: '𝄫', [-1]: '♭', 0: '', 1: '♯', 2: '𝄪' }

export type ChordTone = Tone & { pc: number; letter: number; name: string; accidental: string }

/** Chord tones spelled correctly from the root letter (E♭ G B♭, not D♯ G A♯) */
export function chordTones(rootPc: number, quality: Quality, spelling: Spelling): ChordTone[] {
  const rootLetter = 'CDEFGAB'.indexOf(staffSpelling(60 + rootPc, spelling).letter)
  return quality.tones.map((t) => {
    const pc = (rootPc + t.semis) % 12
    const letter = (rootLetter + t.letters) % 7
    let diff = (pc - NATURAL[letter] + 12) % 12
    if (diff > 6) diff -= 12
    const accidental = ACC[diff] ?? ''
    return { ...t, pc, letter, accidental, name: LETTERS[letter] + accidental }
  })
}

export function chordSymbol(tones: ChordTone[], quality: Quality, inversion: number) {
  const base = tones[0].name + quality.suffix
  return inversion > 0 ? `${base}/${tones[inversion].name}` : base
}

/** Staff position of a chord tone at a given pitch, using the chord's own spelling */
export function spellOnStaff(midi: number, tone: ChordTone) {
  const oct = Math.floor(midi / 12) - 1
  for (const o of [oct, oct - 1, oct + 1]) {
    const natural = 12 * (o + 1) + NATURAL[tone.letter]
    if (Math.abs(midi - natural) <= 2) return { step: tone.letter + 7 * o, accidental: tone.accidental }
  }
  return { step: tone.letter + 7 * oct, accidental: tone.accidental }
}

/** Close piano voicing around middle C; inversion moves the lowest notes up an octave */
export function pianoVoicing(rootPc: number, quality: Quality, inversion: number) {
  const root = 60 + rootPc - (rootPc > 7 ? 12 : 0)
  const notes = quality.tones.map((t) => root + t.semis)
  for (let i = 0; i < inversion; i++) notes[i] += 12
  return notes.sort((a, b) => a - b)
}

export type Shape = {
  /** Fret per string, string 1 (high E) first; null = muted */
  frets: (number | null)[]
  baseFret: number
  barre: { fret: number; from: number; to: number } | null
}

/**
 * Finds playable guitar shapes: every chord tone present (the 5th may be
 * dropped from 7th chords), the lowest string plays the bass note, muted
 * strings only at the edges, at most 4 fingers (a barre counts as one)
 * and a stretch of 4 frets.
 */
export function guitarShapes(rootPc: number, quality: Quality, inversion: number, max = 3): Shape[] {
  const pcs = quality.tones.map((t) => (rootPc + t.semis) % 12)
  const bassPc = pcs[inversion]
  const required = new Set(quality.tones.length === 4 ? [pcs[0], pcs[1], pcs[3]] : pcs)
  if (inversion === 2 && quality.tones.length === 4) required.add(pcs[2])
  const lowToHigh = [...GUITAR_STRINGS].reverse() // E A D G B E
  const found: { shape: Shape; score: number }[] = []

  for (let base = 0; base <= 12; base++) {
    const lo = Math.max(1, base)
    const hi = lo + 3
    const options = lowToHigh.map((s) => {
      const opts: (number | null)[] = [null]
      if (base <= 1 && pcs.includes(pitchClass(s.midi))) opts.push(0)
      for (let f = lo; f <= hi; f++) if (pcs.includes(pitchClass(s.midi + f))) opts.push(f)
      return opts
    })
    const pick: (number | null)[] = []
    const walk = (i: number) => {
      if (i === 6) {
        evaluate(pick, base)
        return
      }
      for (const o of options[i]) {
        // muted strings only at the edges: below the bass, or above the top note
        const started = pick.some((p) => p !== null)
        const closed = started && pick[pick.length - 1] === null
        if (closed && o !== null) continue
        pick.push(o)
        walk(i + 1)
        pick.pop()
      }
    }
    walk(0)
  }

  function evaluate(lowHigh: (number | null)[], base: number) {
    const sounding = lowHigh.map((f, i) => (f === null ? null : lowToHigh[i].midi + f))
    const first = sounding.findIndex((m) => m !== null)
    if (first < 0) return
    const count = sounding.filter((m) => m !== null).length
    if (count < 4) return
    if (pitchClass(sounding[first]!) !== bassPc) return
    const present = new Set(sounding.filter((m): m is number => m !== null).map(pitchClass))
    for (const r of required) if (!present.has(r)) return
    const fretted = lowHigh.filter((f): f is number => f !== null && f > 0)
    if (!fretted.length && base > 0) return
    const minF = fretted.length ? Math.min(...fretted) : 0
    const maxF = fretted.length ? Math.max(...fretted) : 0
    if (maxF - minF > 3) return
    // fingers: a barre at the lowest fret covers every string there
    const atMin = lowHigh.map((f, i) => (f === minF && minF > 0 ? i : -1)).filter((i) => i >= 0)
    let barre: Shape['barre'] = null
    let fingers = fretted.length
    if (atMin.length >= 2 && fretted.length > 4) {
      const from = atMin[0]
      const to = atMin[atMin.length - 1]
      const covered = lowHigh.slice(from, to + 1).every((f) => f !== null && f >= minF && f !== 0)
      if (covered) {
        fingers = fretted.length - atMin.length + 1
        // barre is written high-E-first in the Shape
        barre = { fret: minF, from: 5 - to, to: 5 - from }
      }
    }
    if (fingers > 4) return
    if (!barre && fretted.length > 4) return
    const opens = lowHigh.filter((f) => f === 0).length
    // open strings only help in real "open position" shapes
    const openBonus = maxF <= 3 ? opens * 1.5 : -opens * 2
    const lastSounding = lowHigh.length - 1 - [...lowHigh].reverse().findIndex((f) => f !== null)
    const topMuted = 5 - lastSounding
    const rootCount = sounding.filter((m) => m !== null && pitchClass(m) === pcs[0]).length
    const score =
      count * 3 +
      openBonus +
      rootCount -
      topMuted * 1.5 -
      minF * 0.9 -
      (maxF - minF) * 1.2 -
      fingers * 0.6 -
      (barre ? 1 : 0)
    found.push({
      shape: { frets: [...lowHigh].reverse(), baseFret: minF, barre },
      score,
    })
  }

  found.sort((a, b) => b.score - a.score)
  const out: Shape[] = []
  for (const f of found) {
    // keep shapes in clearly different positions on the neck
    if (out.some((o) => Math.abs(o.baseFret - f.shape.baseFret) < 3)) continue
    out.push(f.shape)
    if (out.length === max) break
  }
  return out.sort((a, b) => a.baseFret - b.baseFret)
}

export const shapeString = (s: Shape) =>
  [...s.frets]
    .reverse()
    .map((f) => (f === null ? 'x' : f > 9 ? `(${f})` : String(f)))
    .join('')

export const shapeMidis = (s: Shape) => s.frets.flatMap((f, i) => (f === null ? [] : [GUITAR_STRINGS[i].midi + f]))
