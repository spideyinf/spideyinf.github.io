import styled from 'styled-components'
import { FRETS, GUITAR_STRINGS, midiAt, noteName, type Spelling } from '../lib/music'
import type { PaintFn } from '../lib/types'

const NUT_X = 64
const END_X = 892
const SCALE = (END_X - NUT_X) / (1 - 2 ** (-FRETS / 12))
const fretX = (f: number) => NUT_X + SCALE * (1 - 2 ** (-f / 12))
const cellX = (f: number) => (f === 0 ? NUT_X - 26 : (fretX(f - 1) + fretX(f)) / 2)
const TOP = 34
const GAP = 30
const stringY = (i: number) => TOP + i * GAP
const BOARD_BOTTOM = stringY(5) + 16
const H = BOARD_BOTTOM + 34
const INLAYS = [3, 5, 7, 9, 15]

const Svg = styled.svg`
  display: block;
  min-width: 760px;
  width: 100%;
  height: auto;
  .cell {
    fill: transparent;
    cursor: pointer;
  }
  .cell:hover + .hover-dot {
    opacity: 0.55;
  }
  .hover-dot {
    opacity: 0;
    transition: opacity 0.12s;
    pointer-events: none;
  }
  .lbl {
    font-family: var(--font-sans);
    font-weight: 600;
    pointer-events: none;
  }
`

type Props = {
  paint: PaintFn
  /** Strings not played in the current chord shape (string 1 first) */
  muted?: boolean[]
  spelling: Spelling
  showLabels: boolean
  onPress: (midi: number, stringIdx: number, fret: number) => void
}

export function Fretboard({ paint, muted, spelling, showLabels, onPress }: Props) {
  return (
    <div className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <Svg viewBox={`0 0 ${END_X + 20} ${H}`} role="img" aria-label="Guitar fretboard, standard tuning">
        <rect x={NUT_X} y={TOP - 16} width={END_X - NUT_X} height={BOARD_BOTTOM - TOP + 16} rx={3} fill="var(--wood)" />
        {INLAYS.map((f) => (
          <circle
            key={f}
            cx={cellX(f)}
            cy={(stringY(2) + stringY(3)) / 2}
            r={6}
            fill="var(--wood-dark)"
            opacity={0.9}
          />
        ))}
        <circle cx={cellX(12)} cy={(stringY(1) + stringY(2)) / 2} r={6} fill="var(--wood-dark)" />
        <circle cx={cellX(12)} cy={(stringY(3) + stringY(4)) / 2} r={6} fill="var(--wood-dark)" />
        {Array.from({ length: FRETS }, (_, i) => i + 1).map((f) => (
          <g key={f}>
            <line x1={fretX(f)} x2={fretX(f)} y1={TOP - 16} y2={BOARD_BOTTOM} stroke="var(--fret)" strokeWidth={2.5} />
            <text x={cellX(f)} y={H - 10} textAnchor="middle" fontSize={12} fill="var(--ink-faint)" className="lbl">
              {f}
            </text>
          </g>
        ))}
        <rect x={NUT_X - 5} y={TOP - 16} width={7} height={BOARD_BOTTOM - TOP + 16} fill="var(--nut)" />
        <text x={cellX(0)} y={H - 10} textAnchor="middle" fontSize={11} fill="var(--ink-faint)" className="lbl">
          open
        </text>

        {GUITAR_STRINGS.map((s, i) => (
          <g key={s.number}>
            <line
              x1={NUT_X}
              x2={END_X}
              y1={stringY(i)}
              y2={stringY(i)}
              stroke="var(--string)"
              strokeWidth={0.8 + i * 0.45}
            />
            <text x={6} y={stringY(i) + 4} fontSize={12} fill="var(--ink-soft)" className="lbl">
              {s.label}
              <tspan fontSize={9} fill="var(--ink-faint)" dx={2}>
                {s.number}
              </tspan>
            </text>
          </g>
        ))}

        {muted?.map(
          (m, i) =>
            m && (
              <text
                key={`x${i}`}
                x={cellX(0)}
                y={stringY(i) + 5}
                textAnchor="middle"
                fontSize={15}
                className="lbl"
                fill="var(--ink-soft)"
              >
                ×
              </text>
            ),
        )}

        {GUITAR_STRINGS.map((_, i) =>
          Array.from({ length: FRETS + 1 }, (_, f) => {
            const midi = midiAt(i, f)
            const p = paint(midi, { string: i, fret: f })
            const fill = p?.fill
            const x = cellX(f)
            const y = stringY(i)
            const w = f === 0 ? 40 : fretX(f) - fretX(f - 1)
            const strong = !!p?.strong
            return (
              <g key={`${i}-${f}`}>
                <rect
                  className="cell"
                  x={x - w / 2}
                  y={y - GAP / 2}
                  width={w}
                  height={GAP}
                  onClick={() => onPress(midi, i, f)}
                  role="button"
                  aria-label={`${noteName(midi, spelling)}, string ${i + 1}, ${f === 0 ? 'open' : `fret ${f}`}`}
                />
                <circle className="hover-dot" cx={x} cy={y} r={11} fill="var(--white-key)" />
                {fill && <circle cx={x} cy={y} r={strong ? 12 : 10.5} fill={fill} pointerEvents="none" />}
                {(fill || showLabels) && (
                  <text
                    x={x}
                    y={y + 4}
                    textAnchor="middle"
                    fontSize={strong ? 11 : 10}
                    className="lbl"
                    fill={strong ? '#1f1b16' : fill ? 'var(--ink)' : '#e5e7eb'}
                    opacity={fill ? 1 : 0.75}
                  >
                    {p?.label ?? noteName(midi, spelling, false)}
                  </text>
                )}
              </g>
            )
          }),
        )}
      </Svg>
    </div>
  )
}
