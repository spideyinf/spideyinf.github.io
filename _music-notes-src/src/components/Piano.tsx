import { useEffect, useRef } from 'react'
import styled, { css } from 'styled-components'
import { isBlack, noteName, PIANO_HIGH, PIANO_LOW, type Spelling } from '../lib/music'
import type { Mark, MarkFn } from '../lib/types'

const WHITE_W = 34

const markColor = (m: Mark) =>
  m === 'selected' || m === 'answer'
    ? 'var(--hot)'
    : m === 'wrong'
      ? 'var(--bad)'
      : m === 'related'
        ? 'var(--hot-soft)'
        : null

const Key = styled.button<{ $black?: boolean; $mark: Mark; $left?: number }>`
  position: ${(p) => (p.$black ? 'absolute' : 'relative')};
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  border: none;
  font-size: 10px;
  font-weight: 500;
  transition:
    background 0.15s,
    transform 0.08s;
  &:active {
    transform: translateY(2px);
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
          background: ${markColor(p.$mark) ?? 'var(--black-key)'};
          color: ${p.$mark ? 'var(--ink)' : '#d8cfbf'};
          box-shadow: inset 0 -4px 0 rgba(0, 0, 0, 0.35);
        `
      : css`
          width: ${WHITE_W}px;
          height: 100%;
          flex: none;
          border-radius: 0 0 6px 6px;
          background: ${markColor(p.$mark) ?? 'var(--white-key)'};
          color: ${p.$mark === 'selected' || p.$mark === 'answer' || p.$mark === 'wrong' ? '#1f1b16' : '#8c806f'};
          box-shadow:
            inset -1px 0 0 rgba(0, 0, 0, 0.18),
            inset 0 -5px 0 rgba(0, 0, 0, 0.08);
        `}
`

type Props = {
  mark: MarkFn
  spelling: Spelling
  showLabels: boolean
  focus: number | null
  onPress: (midi: number) => void
}

export function Piano({ mark, spelling, showLabels, focus, onPress }: Props) {
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

  return (
    <div ref={scroller} className="overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div
        className="relative mx-auto flex h-40 rounded-b-md border-t-8 border-[var(--wood-dark)]"
        style={{ width: whites.length * WHITE_W }}
      >
        {whites.map((m) => (
          <Key
            key={m}
            $mark={mark(m)}
            onClick={() => onPress(m)}
            aria-label={noteName(m, spelling)}
          >
            {(showLabels || m % 12 === 0 || mark(m)) && noteName(m, spelling, m % 12 === 0 || !!mark(m))}
          </Key>
        ))}
        {blacks.map(({ midi, left }) => (
          <Key
            key={midi}
            $black
            $left={left}
            $mark={mark(midi)}
            onClick={() => onPress(midi)}
            aria-label={noteName(midi, spelling)}
          >
            {(showLabels || mark(midi)) && (
              <span className="text-[9px] leading-none">{noteName(midi, spelling, false)}</span>
            )}
          </Key>
        ))}
      </div>
    </div>
  )
}
