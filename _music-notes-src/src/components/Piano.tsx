import { useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'
import { isBlack, noteName, PIANO_HIGH, PIANO_LOW, type Spelling } from '../lib/music'
import type { Paint, PaintFn } from '../lib/types'

const WHITE_W = 34
const DARK_TEXT = '#1f1b16'

const Key = styled.button<{ $black?: boolean; $paint?: Paint; $left?: number }>`
  position: ${(p) => (p.$black ? 'absolute' : 'relative')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 2px;
  padding-bottom: 8px;
  border: none;
  font-size: 10px;
  font-weight: 500;
  line-height: 1;
  transition:
    background 0.15s,
    transform 0.08s;
  &:active {
    transform: translateY(2px);
  }
  .sub {
    font-size: 9px;
    font-weight: 700;
    padding: 2px 3px;
    border-radius: 4px;
    background: rgba(255, 255, 255, 0.55);
    color: ${DARK_TEXT};
  }
  ${(p) =>
    p.$black
      ? css`
          top: 0;
          left: ${p.$left}px;
          width: ${WHITE_W * 0.62}px;
          height: 62%;
          z-index: 2;
          border-radius: 0 0 4px 4px;
          padding-bottom: 6px;
          background: ${p.$paint?.fill ?? 'var(--black-key)'};
          color: ${p.$paint?.strong ? DARK_TEXT : p.$paint ? 'var(--ink)' : '#9ca3af'};
          box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.35);
        `
      : css`
          width: ${WHITE_W}px;
          height: 100%;
          flex: none;
          border-radius: 0 0 6px 6px;
          background: ${p.$paint?.fill ?? 'var(--white-key)'};
          color: ${p.$paint?.strong ? DARK_TEXT : p.$paint ? 'var(--ink)' : '#6b7280'};
          box-shadow:
            inset -1px 0 0 rgba(0, 0, 0, 0.18),
            inset 0 -5px 0 rgba(0, 0, 0, 0.08);
        `}
`

type Props = {
  paint: PaintFn
  spelling: Spelling
  showLabels: boolean
  /** Keep this note (or the middle of these notes) scrolled into view */
  focus: number | null
  onPress: (midi: number) => void
}

export function Piano({ paint, spelling, showLabels, focus, onPress }: Props) {
  const scroller = useRef<HTMLDivElement>(null)
  const whites: number[] = []
  const blacks: { midi: number; left: number }[] = []
  for (let m = PIANO_LOW; m <= PIANO_HIGH; m++) {
    if (isBlack(m)) blacks.push({ midi: m, left: whites.length * WHITE_W - WHITE_W * 0.31 })
    else whites.push(m)
  }

  useEffect(() => {
    const el = scroller.current
    if (!el || focus == null) return
    const idx = whites.indexOf(isBlack(focus) ? focus - 1 : focus)
    const target = idx * WHITE_W - el.clientWidth / 2 + WHITE_W / 2
    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])

  const content = (m: number, p: Paint | undefined, black: boolean) => {
    if (p) {
      return (
        <>
          {p.sub && <span className="sub">{p.sub}</span>}
          <span>{p.label ?? noteName(m, spelling, !black)}</span>
        </>
      )
    }
    if (black) return showLabels ? <span className="text-[9px]">{noteName(m, spelling, false)}</span> : null
    return showLabels || m % 12 === 0 ? noteName(m, spelling, m % 12 === 0) : null
  }

  return (
    <div ref={scroller} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div
        className="relative mx-auto flex h-40 rounded-b-md border-t-8 border-[var(--wood-dark)]"
        style={{ width: whites.length * WHITE_W }}
      >
        {whites.map((m) => {
          const p = paint(m)
          return (
            <Key key={m} $paint={p} onClick={() => onPress(m)} aria-label={noteName(m, spelling)}>
              {content(m, p, false)}
            </Key>
          )
        })}
        {blacks.map(({ midi, left }) => {
          const p = paint(midi)
          return (
            <Key
              key={midi}
              $black
              $left={left}
              $paint={p}
              onClick={() => onPress(midi)}
              aria-label={noteName(midi, spelling)}
            >
              {content(midi, p, true)}
            </Key>
          )
        })}
      </div>
    </div>
  )
}
