import { useState } from 'react'
import styled from 'styled-components'
import { CLEF_BOTTOM, stepToMidi, type Clef } from '../lib/music'
import type { StaffNote } from '../lib/types'

const W = 280
const H = 170
const GAP = 10
const STEP = GAP / 2
const BOTTOM_Y = 105
const NOTE_X = 168

const Svg = styled.svg<{ $interactive: boolean }>`
  width: 100%;
  height: auto;
  display: block;
  cursor: ${(p) => (p.$interactive ? 'pointer' : 'default')};
  touch-action: manipulation;
  .line {
    stroke: var(--ink-soft);
    stroke-width: 1;
  }
  .clef {
    font-family: var(--font-music);
    fill: var(--ink);
  }
`

type Props = {
  clef: Clef
  /** One note, or several stacked as a chord */
  notes: StaffNote[]
  /** Clicking picks the natural note on that line/space */
  onPick?: (midi: number) => void
  /** Restrict which picked notes are allowed */
  pickRange?: [number, number]
  /** Visible vertical slice of the drawing, to stack staves tightly */
  crop?: [number, number]
  title: string
}

export function Staff({ clef, notes, onPick, pickRange, crop = [0, H], title }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const bottom = CLEF_BOTTOM[clef]
  const yOf = (step: number) => BOTTOM_Y - (step - bottom) * STEP

  const sorted = [...notes].sort((a, b) => a.step - b.step)
  const lowY = sorted.length ? yOf(sorted[0].step) : 0
  const highY = sorted.length ? yOf(sorted[sorted.length - 1].step) : 0

  // Grow the visible area for notes far above or below the staff (e.g. A0, C8)
  const view: [number, number] = sorted.length ? [Math.min(crop[0], highY - 42), Math.max(crop[1], lowY + 42)] : crop

  const stepFromEvent = (e: React.PointerEvent<SVGSVGElement> | React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = view[0] + ((e.clientY - rect.top) / rect.height) * (view[1] - view[0])
    const step = Math.round((BOTTOM_Y - y) / STEP) + bottom
    const m = stepToMidi(step)
    if (pickRange && (m < pickRange[0] || m > pickRange[1])) return null
    return step
  }

  const ledgerYs = (lo: number, hi: number) => {
    const ys: number[] = []
    for (let s = bottom - 2; s >= lo; s -= 2) ys.push(yOf(s))
    for (let s = bottom + 10; s <= hi; s += 2) ys.push(yOf(s))
    return ys
  }

  /** Draws one or more noteheads sharing a stem, like printed music */
  const chord = (ns: StaffNote[], opacity = 1, key = 'chord') => {
    if (!ns.length) return null
    const lo = ns[0].step
    const hi = ns[ns.length - 1].step
    const mid = bottom + 4
    const stemUp = (lo + hi) / 2 < mid
    // Notes a step apart sit on opposite sides of the stem: with the stem up the
    // upper note of the pair moves right, with the stem down the lower one moves left
    const shifted: boolean[] = ns.map(() => false)
    if (stemUp) {
      for (let i = 1; i < ns.length; i++) shifted[i] = ns[i].step - ns[i - 1].step === 1 && !shifted[i - 1]
    } else {
      for (let i = ns.length - 2; i >= 0; i--) shifted[i] = ns[i + 1].step - ns[i].step === 1 && !shifted[i + 1]
    }
    const anyShift = shifted.some(Boolean)
    const headX = (i: number) => (stemUp ? NOTE_X + (shifted[i] ? 13 : 0) : NOTE_X + (anyShift && !shifted[i] ? 13 : 0))
    const stemX = stemUp ? NOTE_X + 6 : NOTE_X - 6 + (anyShift ? 13 : 0)
    const stemFrom = stemUp ? yOf(lo) : yOf(hi)
    const stemTo = stemUp ? yOf(hi) - 34 : yOf(lo) + 34
    // Accidentals stagger leftward so they never collide
    const cols: { step: number; col: number }[] = []
    const accX: Record<number, number> = {}
    for (let i = ns.length - 1; i >= 0; i--) {
      if (!ns[i].accidental) continue
      let col = 0
      while (cols.some((c) => c.col === col && Math.abs(c.step - ns[i].step) < 6)) col++
      cols.push({ step: ns[i].step, col })
      accX[i] = NOTE_X - 17 - col * 12
    }
    const stemColor = ns.length === 1 ? ns[0].color : 'var(--ink)'
    return (
      <g opacity={opacity} key={key}>
        {ledgerYs(lo, hi).map((ly) => (
          <line key={ly} className="line" x1={NOTE_X - 15} x2={NOTE_X + 15 + (anyShift ? 13 : 0)} y1={ly} y2={ly} />
        ))}
        <line x1={stemX} x2={stemX} y1={stemFrom} y2={stemTo} stroke={stemColor} strokeWidth={1.4} />
        {ns.map((n, i) => {
          const y = yOf(n.step)
          const x = headX(i)
          return (
            <g key={n.key}>
              <ellipse cx={x} cy={y} rx={6.6} ry={4.8} fill={n.color} transform={`rotate(-22 ${x} ${y})`} />
              {n.accidental && (
                <text
                  x={accX[i]}
                  y={y + 5}
                  textAnchor="middle"
                  fontSize={n.accidental.length > 1 || /[𝄫𝄪]/u.test(n.accidental) ? 30 : 37}
                  className="clef"
                  style={{ fill: n.color }}
                >
                  {n.accidental}
                </text>
              )}
            </g>
          )
        })}
      </g>
    )
  }

  return (
    <Svg
      viewBox={`0 ${view[0]} ${W} ${view[1] - view[0]}`}
      role="img"
      aria-label={title}
      $interactive={!!onPick}
      onPointerMove={onPick ? (e) => setHover(stepFromEvent(e)) : undefined}
      onPointerLeave={() => setHover(null)}
      onClick={
        onPick
          ? (e) => {
              const s = stepFromEvent(e)
              if (s != null) onPick(stepToMidi(s))
            }
          : undefined
      }
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line key={i} className="line" x1={8} x2={W - 8} y1={BOTTOM_Y - i * GAP} y2={BOTTOM_Y - i * GAP} />
      ))}
      <line className="line" x1={8} x2={8} y1={BOTTOM_Y - 4 * GAP} y2={BOTTOM_Y} />
      {clef === 'treble' ? (
        <text className="clef" x={12} y={BOTTOM_Y} fontSize={40}>
          𝄞
        </text>
      ) : (
        <text className="clef" x={12} y={BOTTOM_Y + 1} fontSize={46}>
          𝄢
        </text>
      )}
      {hover != null &&
        !sorted.some((n) => n.step === hover) &&
        chord([{ step: hover, accidental: '', color: 'var(--ink-faint)', key: 'h' }], 0.6, 'hover')}
      {chord(sorted)}
    </Svg>
  )
}
