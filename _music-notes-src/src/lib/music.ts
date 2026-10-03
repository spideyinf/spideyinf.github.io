export type Spelling = 'sharp' | 'flat'
export type Clef = 'treble' | 'bass'

const SHARP_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B']
const FLAT_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B']
const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const SOLFEGE: Record<string, string> = { C: 'Do', D: 'Re', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si' }

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

export function solfege(midi: number, spelling: Spelling) {
  const n = noteName(midi, spelling, false)
  return SOLFEGE[n[0]] + n.slice(1)
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

export const ordinal = (n: number) =>
  `${n}${n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th'}`

/** Plain-language position, e.g. "2nd line of the treble staff" */
export function describeStaff(midi: number, clef: Clef, spelling: Spelling) {
  const { step } = staffSpelling(midi, spelling)
  const off = step - CLEF_BOTTOM[clef]
  const where = `${clef} staff`
  if (off >= 0 && off <= 8) {
    return off % 2 === 0
      ? `${ordinal(off / 2 + 1)} line of the ${where}`
      : `${ordinal((off + 1) / 2)} space of the ${where}`
  }
  if (off === -1) return `just below the ${where}`
  if (off === 9) return `just above the ${where}`
  const dir = off < 0 ? 'below' : 'above'
  const n = off < 0 ? Math.floor(-off / 2) : Math.floor((off - 8) / 2)
  return off % 2 === 0
    ? `on the ${ordinal(n)} ledger line ${dir} the ${where}`
    : `just ${dir} the ${ordinal(n)} ledger line ${dir} the ${where}`
}

export const STAFF_LINE_NAMES: Record<Clef, { lines: string; spaces: string }> = {
  treble: { lines: 'E G B D F', spaces: 'F A C E' },
  bass: { lines: 'G B D F A', spaces: 'A C E G' },
}
