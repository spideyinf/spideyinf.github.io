import styled from 'styled-components'
import type { Shape } from '../lib/chords'
import { GUITAR_STRINGS } from '../lib/music'

const COL = 30
const ROW = 34
const LEFT = 40
const TOP = 46
const FRETS_SHOWN = 5

const Svg = styled.svg`
  display: block;
  width: 100%;
  max-width: 260px;
  height: auto;
  margin: 0 auto;
  text {
    font-family: var(--font-sans);
  }
`

type Props = {
  shape: Shape
  /** Fill + label for the note on each string (string 1 first) */
  dot: (stringIdx: number) => { fill: string; label: string; name: string } | null
}

/** Classic chord-chart view: strings vertical (low E on the left), frets horizontal */
export function ChordChart({ shape, dot }: Props) {
  const fretted = shape.frets.filter((f): f is number => f !== null && f > 0)
  const maxF = fretted.length ? Math.max(...fretted) : 0
  const start = maxF <= FRETS_SHOWN ? 1 : Math.min(...fretted)
  // Columns left→right: string 6 … string 1
  const colX = (stringIdx: number) => LEFT + (5 - stringIdx) * COL
  const rowY = (fret: number) => TOP + (fret - start + 0.5) * ROW
  const width = LEFT + 5 * COL + 34
  const height = TOP + FRETS_SHOWN * ROW + 34

  return (
    <Svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Chord chart">
      {/* nut or position marker */}
      {start === 1 ? (
        <rect x={LEFT - 2} y={TOP - 5} width={5 * COL + 4} height={6} rx={1} fill="var(--ink)" />
      ) : (
        <text
          x={LEFT - 10}
          y={TOP + ROW * 0.5 + 5}
          textAnchor="end"
          fontSize={13}
          fontWeight={600}
          fill="var(--ink-soft)"
        >
          {start}fr
        </text>
      )}
      {Array.from({ length: FRETS_SHOWN + 1 }, (_, i) => (
        <line
          key={i}
          x1={LEFT}
          x2={LEFT + 5 * COL}
          y1={TOP + i * ROW}
          y2={TOP + i * ROW}
          stroke="var(--ink-faint)"
          strokeWidth={1.2}
        />
      ))}
      {GUITAR_STRINGS.map((s, i) => (
        <line
          key={s.number}
          x1={colX(i)}
          x2={colX(i)}
          y1={TOP}
          y2={TOP + FRETS_SHOWN * ROW}
          stroke="var(--ink-soft)"
          strokeWidth={0.8 + (5 - i) * 0.3}
        />
      ))}
      {shape.barre && shape.barre.fret >= start && (
        <rect
          x={colX(shape.barre.to) - 12}
          y={rowY(shape.barre.fret) - 12}
          width={colX(shape.barre.from) - colX(shape.barre.to) + 24}
          height={24}
          rx={12}
          fill="var(--ink)"
          opacity={0.18}
        />
      )}
      {shape.frets.map((f, i) => {
        const x = colX(i)
        const d = dot(i)
        if (f === null)
          return (
            <text key={i} x={x} y={TOP - 14} textAnchor="middle" fontSize={16} fill="var(--ink-soft)">
              ×
            </text>
          )
        if (f === 0)
          return (
            <g key={i}>
              <circle cx={x} cy={TOP - 19} r={8} fill="none" stroke={d?.fill ?? 'var(--ink-soft)'} strokeWidth={2.2} />
            </g>
          )
        return (
          <g key={i}>
            <circle cx={x} cy={rowY(f)} r={12} fill={d?.fill ?? 'var(--ink)'} />
            <text x={x} y={rowY(f) + 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1f1b16">
              {d?.label}
            </text>
          </g>
        )
      })}
      {GUITAR_STRINGS.map((s, i) => {
        const d = dot(i)
        return (
          <text key={s.number} x={colX(i)} y={height - 12} textAnchor="middle" fontSize={11} fill="var(--ink-soft)">
            {shape.frets[i] === null ? '' : d?.name}
          </text>
        )
      })}
    </Svg>
  )
}
