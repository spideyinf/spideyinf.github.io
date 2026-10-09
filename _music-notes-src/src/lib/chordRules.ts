import type { T } from '../i18n'
import type { MessageId } from '../i18n/en'
import { shapeString, type ChordTone, type Quality, type Shape } from './chords'
import { GUITAR_STRINGS } from './music'
import type { StaffNote } from './types'

export type RuleSet = { title: string; points: string[] }

const isSus = (q: Quality) => q.id.startsWith('sus')

export const qualityName = (q: Quality, t: T) => t(`quality.${q.id}.name` as MessageId)
export const qualityText = (q: Quality, part: 'sound' | 'rule', t: T) => t(`quality.${q.id}.${part}` as MessageId)
export const inversionName = (i: number, t: T) => t(`inv.${i}` as MessageId)

export function intervalLabel(semis: number, t: T) {
  const id = `interval.${semis}` as MessageId
  return [2, 3, 4, 5, 6, 7, 8, 10, 11].includes(semis) ? t(id) : t('interval.other', { n: semis })
}

export function pianoRules(tones: ChordTone[], quality: Quality, inversion: number, t: T): RuleSet {
  const walk = tones
    .slice(1)
    .map((tone, i) => t('rules.piano.walkStep', { n: tone.semis - tones[i].semis, note: tone.name }))
    .join(t('rules.then'))
  const four = tones.length === 4
  const points = [
    t('rules.piano.count', { root: tones[0].name, walk }),
    t('rules.piano.fingers', { rh: four ? '1-2-3-5' : '1-3-5', lh: four ? '5-3-2-1' : '5-3-1' }),
    t('rules.piano.pattern', { quality: qualityName(quality, t).toLowerCase() }),
  ]
  if (inversion > 0) {
    points.push(
      t('rules.piano.inversion', { inv: inversionName(inversion, t), count: inversion, note: tones[inversion].name }),
    )
  } else if (!isSus(quality)) {
    points.push(t('rules.piano.white'))
  }
  return { title: t('piano.title'), points }
}

export function staffRules(tones: ChordTone[], quality: Quality, inversion: number, notes: StaffNote[], t: T): RuleSet {
  const points: string[] = []
  const low = notes[0]
  if (!isSus(quality) && inversion === 0 && low) {
    // Staff lines (and ledger lines) all fall on even diatonic steps in both clefs
    points.push(
      t('rules.staff.snowman', {
        letters: tones.map((tone) => tone.name[0]).join('-'),
        where: low.step % 2 === 0 ? 'lines' : 'spaces',
      }),
    )
  } else if (isSus(quality)) {
    points.push(t('rules.staff.sus', { which: quality.id }))
  } else {
    points.push(t('rules.staff.inversion', { root: tones[0].name }))
  }
  points.push(
    t('rules.staff.letters', {
      names: tones.map((tone) => tone.name).join(' – '),
      quality: qualityName(quality, t).toLowerCase(),
    }),
  )
  points.push(t('rules.staff.guitar'))
  return { title: t('staff.title'), points }
}

export function guitarRules(
  tones: ChordTone[],
  inversion: number,
  shape: Shape | null,
  midis: number[],
  t: T,
): RuleSet {
  if (!shape) return { title: t('guitar.title'), points: [t('rules.guitar.none')] }
  const lowest = shape.frets
    .map((f, i) => ({ f, i }))
    .reverse()
    .find((x) => x.f !== null)!
  const distinct = new Set(midis.map((m) => m % 12)).size
  const ord = t('ord', { n: GUITAR_STRINGS[lowest.i].number })
  const note = tones[inversion].name
  const points = [
    t('rules.guitar.shape', { shape: shapeString(shape) }),
    inversion
      ? t('rules.guitar.startInv', { ord, note, inv: inversionName(inversion, t).toLowerCase() })
      : t('rules.guitar.startRoot', { ord, note }),
  ]
  if (shape.barre) points.push(t('rules.guitar.barre', { fret: shape.barre.fret }))
  else if (shape.frets.includes(0)) points.push(t('rules.guitar.open'))
  else points.push(t('rules.guitar.movable'))
  points.push(t('rules.guitar.double', { strings: midis.length, distinct }))
  return { title: t('guitar.title'), points }
}
