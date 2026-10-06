import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { CLEF_BOTTOM, ordinal, stepToMidi, type Clef } from '../lib/music'
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
  .tip,
  .name {
    font-family: var(--font-sans);
    pointer-events: none;
  }
`

const LETTERS = 'CDEFGAB'
/** Letters of the lines and spaces, bottom to top, for the memory hint */
const PATTERN: Record<Clef, { lines: string[]; spaces: string[] }> = {
  treble: { lines: ['E', 'G', 'B', 'D', 'F'], spaces: ['F', 'A', 'C', 'E'] },
  bass: { lines: ['G', 'B', 'D', 'F', 'A'], spaces: ['A', 'C', 'E', 'G'] },
}

const stepName = (step: number, accidental = '') => LETTERS[((step % 7) + 7) % 7] + accidental + Math.floor(step / 7)

/** Where a step sits, in words: "2nd line", "3rd space", "1st ledger line below"… */
function whereOnStaff(step: number, bottom: number) {
  const off = step - bottom
  if (off >= 0 && off <= 8) {
    return off % 2 === 0
      ? { text: `${ordinal(off / 2 + 1)} line`, kind: 'lines' as const, index: off / 2 }
      : { text: `${ordinal((off + 1) / 2)} space`, kind: 'spaces' as const, index: (off - 1) / 2 }
  }
  if (off === -1) return { text: 'below the staff', kind: null, index: -1 }
  if (off === 9) return { text: 'above the staff', kind: null, index: -1 }
  const below = off < 0
  const n = below ? Math.floor(-off / 2) : Math.floor((off - 8) / 2)
  const onLine = off % 2 === 0
  return {
    text: onLine ? `ledger line ${n} ${below ? 'below' : 'above'}` : `${below ? 'below' : 'above'} ledger line ${n}`,
    kind: null,
    index: -1,
  }
}

type Props = {
  clef: Clef
  /** One note, or several stacked as a chord */
  notes: StaffNote[]
  /** Clicking picks the natural note on that line/space */
  onPick?: (midi: number) => void
  /** Restrict which picked notes are allowed */
  pickRange?: [number, number]
  /** Show the name of each note on the staff */
  showNames?: boolean
  /** Hovering a line or space shows its name (off while a quiz asks you to read it) */
  tips?: boolean
  /** Visible vertical slice of the drawing, to stack staves tightly */
  crop?: [number, number]
  title: string
}

export function Staff({ clef, notes, onPick, pickRange, crop = [0, H], title, showNames = false, tips = true }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const touchTimer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(touchTimer.current), [])
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
    // Names of notes a step apart would overlap, so every other one moves right
    const crowded: boolean[] = ns.map(() => false)
    for (let i = 1; i < ns.length; i++) crowded[i] = ns[i].step - ns[i - 1].step <= 1 && !crowded[i - 1]
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
              {showNames && opacity === 1 && (
                <text
                  className="name"
                  x={NOTE_X + (anyShift ? 13 : 0) + (stemUp ? 14 : 12) + (crowded[i] ? 20 : 0)}
                  y={y + 3.5}
                  fontSize={10}
                  fontWeight={600}
                  style={{ fill: n.color }}
                >
                  {stepName(n.step, n.accidental)}
                </text>
              )}
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

  /** Small card beside the hovered line or space: its name, place and memory hint */
  const tip = (step: number) => {
    const placed = sorted.find((n) => n.step === step)
    const name = stepName(step, placed?.accidental ?? '')
    const where = whereOnStaff(step, bottom)
    const hint = where.kind ? PATTERN[clef][where.kind] : null
    const w = 92
    const h = hint ? 46 : 33
    // Sits between the clef and the notes, so it never covers note names or stems
    const x = 44
    const y = Math.min(Math.max(yOf(step) - h / 2, view[0] + 2), view[1] - h - 2)
    return (
      <g className="tip">
        <line x1={x + w} x2={NOTE_X - 22} y1={yOf(step)} y2={yOf(step)} stroke="var(--hot)" strokeDasharray="2 2" />
        <rect x={x} y={y} width={w} height={h} rx={7} fill="var(--ink)" />
        <text x={x + 8} y={y + 15} fontSize={12} fontWeight={700} style={{ fill: 'var(--card)' }}>
          {name}
        </text>
        <text x={x + 8} y={y + 27} fontSize={8.5} style={{ fill: 'var(--card)', opacity: 0.75 }}>
          {where.text}
        </text>
        {hint && (
          <text x={x + 8} y={y + 39} fontSize={8.5} letterSpacing={1.5} style={{ fill: 'var(--card)', opacity: 0.55 }}>
            {hint.map((l, i) => (
              <tspan
                key={i}
                fontWeight={i === where.index ? 800 : 400}
                style={i === where.index ? { fill: 'var(--hot)', opacity: 1 } : undefined}
              >
                {l}
                {i < hint.length - 1 ? ' ' : ''}
              </tspan>
            ))}
          </text>
        )}
      </g>
    )
  }

  return (
    <Svg
      viewBox={`0 ${view[0]} ${W} ${view[1] - view[0]}`}
      role="img"
      aria-label={title}
      $interactive={!!onPick}
      onPointerMove={onPick || tips ? (e) => setHover(stepFromEvent(e)) : undefined}
      onPointerDown={(e) => {
        window.clearTimeout(touchTimer.current)
        if (onPick || tips) setHover(stepFromEvent(e))
      }}
      onPointerLeave={(e) => {
        // On touch screens keep the tip up for a moment after lifting the finger
        if (e.pointerType === 'touch') touchTimer.current = window.setTimeout(() => setHover(null), 1800)
        else setHover(null)
      }}
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
      {tips && hover != null && tip(hover)}
    </Svg>
  )
}
