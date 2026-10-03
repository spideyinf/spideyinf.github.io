import { useState } from 'react'
import styled from 'styled-components'
import { CLEF_BOTTOM, staffSpelling, stepToMidi, type Clef, type Spelling } from '../lib/music'

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
  midi: number | null
  spelling: Spelling
  color?: string
  /** Clicking picks the natural note on that line/space */
  onPick?: (midi: number) => void
  /** Restrict which picked notes are allowed */
  pickRange?: [number, number]
  /** Visible vertical slice of the drawing, to stack staves tightly */
  crop?: [number, number]
  title: string
}

export function Staff({ clef, midi, spelling, color = 'var(--hot)', onPick, pickRange, crop = [0, H], title }: Props) {
  const [hover, setHover] = useState<number | null>(null)
  const bottom = CLEF_BOTTOM[clef]
  const yOf = (step: number) => BOTTOM_Y - (step - bottom) * STEP

  const ledgers = (step: number) => {
    const ys: number[] = []
    for (let s = bottom - 2; s >= step; s -= 2) ys.push(yOf(s))
    for (let s = bottom + 10; s <= step; s += 2) ys.push(yOf(s))
    return ys
  }

  const stepFromEvent = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const y = crop[0] + ((e.clientY - rect.top) / rect.height) * (crop[1] - crop[0])
    const step = Math.round((BOTTOM_Y - y) / STEP) + bottom
    const m = stepToMidi(step)
    if (pickRange && (m < pickRange[0] || m > pickRange[1])) return null
    return step
  }

  const note = midi == null ? null : staffSpelling(midi, spelling)

  const head = (step: number, fill: string, accidental: string, opacity = 1) => {
    const y = yOf(step)
    const stemUp = step < bottom + 4
    return (
      <g opacity={opacity}>
        {ledgers(step).map((ly) => (
          <line key={ly} className="line" x1={NOTE_X - 15} x2={NOTE_X + 15} y1={ly} y2={ly} />
        ))}
        <ellipse cx={NOTE_X} cy={y} rx={6.6} ry={4.8} fill={fill} transform={`rotate(-22 ${NOTE_X} ${y})`} />
        <line
          x1={stemUp ? NOTE_X + 6 : NOTE_X - 6}
          x2={stemUp ? NOTE_X + 6 : NOTE_X - 6}
          y1={y + (stemUp ? -1 : 1)}
          y2={y + (stemUp ? -34 : 34)}
          stroke={fill}
          strokeWidth={1.4}
        />
        {accidental && (
          <text x={NOTE_X - 18} y={y + 5} textAnchor="middle" fontSize={37} className="clef" style={{ fill }}>
            {accidental}
          </text>
        )}
      </g>
    )
  }

  return (
    <Svg
      viewBox={`0 ${crop[0]} ${W} ${crop[1] - crop[0]}`}
      role="img"
      aria-label={title}
      $interactive={!!onPick}
      onPointerMove={onPick ? (e) => setHover(stepFromEvent(e)) : undefined}
      onPointerLeave={() => setHover(null)}
      onClick={
        onPick
          ? (e) => {
              const s = stepFromEvent(e as unknown as React.PointerEvent<SVGSVGElement>)
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
      {hover != null && (note == null || hover !== note.step) && head(hover, 'var(--ink-faint)', '', 0.6)}
      {note && head(note.step, color, note.accidental)}
    </Svg>
  )
}
