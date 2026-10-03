import { useMemo, useState } from 'react'
import {
  chordSymbol,
  chordTones,
  guitarShapes,
  pianoVoicing,
  QUALITIES,
  shapeMidis,
  spellOnStaff,
  type ChordTone,
  type Role,
} from '../lib/chords'
import { pitchClass, type Spelling } from '../lib/music'
import type { PaintFn, StaffNote } from '../lib/types'

export const ROLE_COLOR: Record<Role, string> = {
  R: 'var(--role-r)',
  '3': 'var(--role-3)',
  '5': 'var(--role-5)',
  '7': 'var(--role-7)',
  '2': 'var(--role-sus)',
  '4': 'var(--role-sus)',
}

export const faint = (color: string) => `color-mix(in srgb, ${color} 45%, var(--card))`

export function useChord(spelling: Spelling) {
  const [rootPc, setRootPcRaw] = useState(0)
  const [qualityId, setQualityRaw] = useState('maj')
  const [inversion, setInversion] = useState(0)
  const [shapeIdx, setShapeIdx] = useState(0)
  const [build, setBuild] = useState<number | null>(null)
  const [everywhere, setEverywhere] = useState(false)

  const quality = QUALITIES.find((q) => q.id === qualityId)!
  const inv = Math.min(inversion, quality.tones.length - 1)
  const shown = build ?? quality.tones.length

  const setRootPc = (pc: number) => {
    setRootPcRaw(pc)
    setShapeIdx(0)
    setBuild(null)
  }
  const setQuality = (id: string) => {
    setQualityRaw(id)
    setShapeIdx(0)
    setBuild(null)
  }
  const setInv = (i: number) => {
    setInversion(i)
    setShapeIdx(0)
  }

  const d = useMemo(() => {
    const tones = chordTones(rootPc, quality, spelling)
    const symbol = chordSymbol(tones, quality, inv)
    const visible = tones.slice(0, shown)
    const toneOf = (midi: number): ChordTone | undefined => visible.find((t) => t.pc === pitchClass(midi))
    const voicing = pianoVoicing(rootPc, quality, inv)
    const shapes = guitarShapes(rootPc, quality, inv)
    const shape = shapes[Math.min(shapeIdx, shapes.length - 1)] ?? null
    const guitarMidis = shape ? shapeMidis(shape) : []

    const staffNotes = (midis: number[], shift = 0): StaffNote[] =>
      midis.flatMap((m) => {
        const t = toneOf(m)
        if (!t) return []
        const s = spellOnStaff(m + shift, t)
        return [{ ...s, color: ROLE_COLOR[t.role], key: m }]
      })

    const paint: PaintFn = (midi, at) => {
      const t = toneOf(midi)
      if (!t) return undefined
      const color = ROLE_COLOR[t.role]
      const inShape = at ? shape?.frets[at.string] === at.fret : voicing.includes(midi)
      if (inShape) return { fill: color, strong: true, label: at ? t.degree : t.name, sub: at ? undefined : t.degree }
      if (everywhere) return { fill: faint(color), strong: false, label: t.name }
      return undefined
    }

    return {
      tones,
      visible,
      symbol,
      voicing,
      voicingShown: voicing.filter((m) => toneOf(m)),
      shapes,
      shape,
      guitarMidis,
      guitarShown: guitarMidis.filter((m) => toneOf(m)),
      toneOf,
      paint,
      staffNotes,
      muted: shape ? shape.frets.map((f) => f === null) : undefined,
    }
  }, [rootPc, quality, inv, spelling, shown, shapeIdx, everywhere])

  return {
    rootPc,
    setRootPc,
    quality,
    setQuality,
    inversion: inv,
    setInversion: setInv,
    shapeIdx: Math.min(shapeIdx, Math.max(0, d.shapes.length - 1)),
    setShapeIdx,
    shown,
    setBuild,
    everywhere,
    setEverywhere,
    ...d,
  }
}

export type ChordState = ReturnType<typeof useChord>
