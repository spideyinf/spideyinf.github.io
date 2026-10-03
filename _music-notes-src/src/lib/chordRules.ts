import { INTERVAL_NAMES, INVERSIONS, shapeString, type ChordTone, type Quality, type Shape } from './chords'
import { GUITAR_STRINGS, ordinal } from './music'
import type { StaffNote } from './types'

export type RuleSet = { title: string; points: string[] }

const isSus = (q: Quality) => q.id.startsWith('sus')

export function pianoRules(tones: ChordTone[], quality: Quality, inversion: number): RuleSet {
  const steps = tones.slice(1).map((t, i) => t.semis - tones[i].semis)
  const walk = tones
    .slice(1)
    .map((t, i) => `${steps[i]} keys up to ${t.name}`)
    .join(', then ')
  const four = tones.length === 4
  const points = [
    `Count every key, black and white. From ${tones[0].name}: ${walk}.`,
    `Right hand fingers ${four ? '1-2-3-5' : '1-3-5'} (thumb on the lowest note); left hand ${four ? '5-3-2-1' : '5-3-1'}.`,
    `The pattern of distances is what makes it ${quality.name.toLowerCase()} — start the same count from any key to get that chord in a new key.`,
  ]
  if (inversion > 0) {
    points.push(
      `${INVERSIONS[inversion]}: the same notes, but the lowest ${inversion === 1 ? 'note moves' : `${inversion} notes move`} up an octave, so ${tones[inversion].name} is on the bottom. Inversions let your hand stay in one place between chords.`,
    )
  } else if (!isSus(quality)) {
    points.push(
      'On white keys only (C, Dm, Em, F, G, Am) a triad is just "play one, skip one, play one, skip one, play one".',
    )
  }
  return { title: 'Piano', points }
}

export function staffRules(tones: ChordTone[], quality: Quality, inversion: number, notes: StaffNote[]): RuleSet {
  const points: string[] = []
  const low = notes[0]
  if (!isSus(quality) && inversion === 0 && low) {
    // Staff lines (and ledger lines) all fall on even diatonic steps in both clefs
    const onLine = low.step % 2 === 0
    points.push(
      `Root position chords are stacked in 3rds: each note skips one letter (${tones.map((t) => t.name[0]).join('-')}), so they sit all on ${onLine ? 'lines' : 'spaces'} — the "snowman" shape.`,
    )
  } else if (isSus(quality)) {
    points.push(
      `Sus chords break the snowman: the ${quality.id === 'sus2' ? '2nd sits right next to the root' : '4th sits right next to the 5th'}, so two noteheads are a step apart and print side by side.`,
    )
  } else {
    points.push(
      `In an inversion one gap becomes a 4th (two letters skipped), so the stack is no longer all lines or all spaces. Find the 4th gap — the note above it is the root (${tones[0].name}).`,
    )
  }
  points.push(
    `Letters come from the chord, not the keyboard: ${tones.map((t) => t.name).join(' – ')}. Every ${quality.name.toLowerCase()} chord keeps the same letter pattern, which is why you may see ♭, ♯ or even 𝄫.`,
  )
  points.push('Guitar sheet music writes the same chord one octave higher than it sounds.')
  return { title: 'Staff', points }
}

export function guitarRules(tones: ChordTone[], inversion: number, shape: Shape | null, midis: number[]): RuleSet {
  if (!shape) {
    return {
      title: 'Guitar',
      points: [
        'No comfortable 4-string-or-more shape for this inversion. Play the highlighted notes on the fretboard as an arpeggio instead.',
      ],
    }
  }
  const lowest = shape.frets
    .map((f, i) => ({ f, i }))
    .reverse()
    .find((x) => x.f !== null)!
  const distinct = new Set(midis.map((m) => m % 12)).size
  const points = [
    `Shape ${shapeString(shape)}, read from the low E string to the high E. × = don't play, ○ = open string.`,
    `Start the strum on the ${ordinal(GUITAR_STRINGS[lowest.i].number)} string so the lowest note is ${tones[inversion].name}${inversion ? ` (the ${INVERSIONS[inversion].toLowerCase()})` : ', the root'}.`,
  ]
  if (shape.barre) {
    points.push(
      `Barre: lay your index finger flat across fret ${shape.barre.fret}. Barre shapes are movable — slide the whole shape up 2 frets and you get the same chord type a whole step higher.`,
    )
  } else if (shape.frets.includes(0)) {
    points.push(
      'Open-position shape: it uses open strings, so it only works for this root. For other keys, use a barre shape further up the neck.',
    )
  } else {
    points.push(
      'No open strings, so this shape is movable: slide it along the neck to play the same chord type from another root.',
    )
  }
  points.push(
    `Guitars double notes: ${midis.length} strings sound but only ${distinct} different note names — the root is usually repeated.`,
  )
  return { title: 'Guitar', points }
}

export const intervalLabel = (semis: number) => INTERVAL_NAMES[semis] ?? `${semis} half-steps`
