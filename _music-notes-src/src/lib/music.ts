import type { T } from '../i18n'
import type { MessageId } from '../i18n/en'
export type Spelling = 'sharp' | 'flat'
export type Clef = 'treble' | 'bass'

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const

/** Full 88-key piano: A0 – C8 */
export const PIANO_LOW = 21
export const PIANO_HIGH = 108

/** Standard tuning, string 1 (high E) first */
export const GUITAR_STRINGS = [
  { midi: 64, label: 'E', number: 1 },
  { midi: 59, label: 'B', number: 2 },
  { midi: 55, label: 'G', number: 3 },
  { midi: 50, label: 'D', number: 4 },
  { midi: 45, label: 'A', number: 5 },
  { midi: 40, label: 'E', number: 6 },
]
export const FRETS = 15

export const isBlack = (midi: number) => [1, 3, 6, 8, 10].includes(((midi % 12) + 12) % 12)
export const octaveOf = (midi: number) => Math.floor(midi / 12) - 1
export const pitchClass = (midi: number) => ((midi % 12) + 12) % 12

export function noteName(midi: number, spelling: Spelling, withOctave = true) {
  const n = (spelling === 'sharp' ? SHARP_NAMES : FLAT_NAMES)[pitchClass(midi)]
  return withOctave ? `${n}${octaveOf(midi)}` : n
}

/** Do / Re / Mi… (Đô / Rê / Mi… in Vietnamese), keeping any ♯ or ♭ */
export function solfege(midi: number, spelling: Spelling, t: T) {
  const n = noteName(midi, spelling, false)
  return t(`solfege.${n[0]}` as MessageId) + n.slice(1)
}

export const frequency = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

/**
 * How the note is spelled on a staff: the letter it sits on, its
 * accidental, and a diatonic step index (C0 = 0, each letter +1).
 */
export function staffSpelling(midi: number, spelling: Spelling) {
  const pc = pitchClass(midi)
  const octave = octaveOf(midi)
  let accidental: '' | '♯' | '♭' = ''
  let letterIdx: number
  if (!isBlack(midi)) {
    letterIdx = LETTERS.indexOf(SHARP_NAMES[pc] as (typeof LETTERS)[number])
  } else if (spelling === 'sharp') {
    letterIdx = LETTERS.indexOf(SHARP_NAMES[pc][0] as (typeof LETTERS)[number])
    accidental = '♯'
  } else {
    letterIdx = LETTERS.indexOf(FLAT_NAMES[pc][0] as (typeof LETTERS)[number])
    accidental = '♭'
  }
  return { step: letterIdx + 7 * octave, accidental, letter: LETTERS[letterIdx] }
}

/** Diatonic step of each clef's bottom line */
export const CLEF_BOTTOM: Record<Clef, number> = {
  treble: 2 + 7 * 4, // E4
  bass: 4 + 7 * 2, // G2
}

export const clefFor = (midi: number): Clef => (midi >= 60 ? 'treble' : 'bass')

/** Natural (white-key) note sitting on a diatonic step */
export function stepToMidi(step: number) {
  const octave = Math.floor(step / 7)
  const semis = [0, 2, 4, 5, 7, 9, 11][((step % 7) + 7) % 7]
  return 12 * (octave + 1) + semis
}

/** Every exact-pitch position of a note on the fretboard */
export function guitarPositions(midi: number) {
  return GUITAR_STRINGS.flatMap((s, i) => {
    const fret = midi - s.midi
    return fret >= 0 && fret <= FRETS ? [{ string: i, fret, number: s.number }] : []
  })
}

export const midiAt = (stringIdx: number, fret: number) => GUITAR_STRINGS[stringIdx].midi + fret

/** Plain-language position, e.g. "2nd line of the treble staff" */
export function describeStaff(midi: number, clef: Clef, spelling: Spelling, t: T) {
  const { step } = staffSpelling(midi, spelling)
  const off = step - CLEF_BOTTOM[clef]
  if (off >= 0 && off <= 8) {
    return off % 2 === 0
      ? t('desc.line', { ord: t('ord', { n: off / 2 + 1 }), clef })
      : t('desc.space', { ord: t('ord', { n: (off + 1) / 2 }), clef })
  }
  if (off === -1) return t('desc.justBelow', { clef })
  if (off === 9) return t('desc.justAbove', { clef })
  const dir = off < 0 ? 'below' : 'above'
  const n = off < 0 ? Math.floor(-off / 2) : Math.floor((off - 8) / 2)
  return t(off % 2 === 0 ? 'desc.ledgerOn' : 'desc.ledgerNear', { ord: t('ord', { n }), dir, clef })
}

export const STAFF_LINE_NAMES: Record<Clef, { lines: string; spaces: string }> = {
  treble: { lines: 'E G B D F', spaces: 'F A C E' },
  bass: { lines: 'G B D F A', spaces: 'A C E G' },
}
