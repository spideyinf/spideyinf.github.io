import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { PracticeShell } from '../components/PracticeShell'
import { Hand, IconButton, Icons } from '../components/ui'
import type { Metrics } from '../lib/hand'
import { LETTERS, letterInfo } from '../lib/letters'
import { go, href } from '../lib/router'
import { ROW_IN_X, stackRows } from '../lib/sheet'
import { usePractice } from '../state/practice'

const fade = (n: number, from: number, to: number) =>
  Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1))

const Picker = styled.div`
  position: fixed;
  inset: 0;
  z-index: 20;
  background: ${({ theme }) => theme.color.paper};
  padding: calc(14px + env(safe-area-inset-top)) 16px 24px;
  overflow-y: auto;
`
const Cell = styled.button<{ $done: boolean; $current: boolean }>`
  aspect-ratio: 1;
  border: 1px solid ${({ $current, theme }) => ($current ? theme.color.vermilion : theme.color.rule)};
  border-radius: 14px;
  background: ${({ $done, theme }) => ($done ? theme.color.paperDeep : 'transparent')};
  display: grid;
  place-items: center;
  position: relative;
  &::after {
    content: '';
    display: ${({ $done }) => ($done ? 'block' : 'none')};
    position: absolute;
    top: 7px;
    right: 7px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.cobalt};
  }
`

export function AbcScreen({ letter }: { letter: string }) {
  const { today, savePage } = usePractice()
  const [picking, setPicking] = useState(false)
  const info = letterInfo(letter)
  const i = LETTERS.indexOf(letter)

  const build = useCallback(
    (ctx: CanvasRenderingContext2D, _m: Metrics, w: number, h: number) => {
      void ctx
      const big = Math.min(w / 7.2, (h / ROW_IN_X) * 0.34)
      const md = Math.min(w / 15, (h / ROW_IN_X) * 0.2)
      return stackRows(
        [
          { xh: big, align: 'center', segments: [{ text: info.upper + info.lower, alpha: 0.3 }] },
          { xh: md, gap: 2, segments: fade(3, 0.3, 0.07).map((alpha) => ({ text: info.upper, alpha })) },
          { xh: md, gap: 1.6, segments: fade(5, 0.32, 0.06).map((alpha) => ({ text: info.lower, alpha })) },
          { xh: md, segments: [{ text: info.word, alpha: 0.28 }] },
        ],
        w,
        h,
        md,
      )
    },
    [info.upper, info.lower, info.word],
  )

  return (
    <>
      <PracticeShell
        pageKey={`abc:${letter}`}
        title={
          <button type="button" onClick={() => setPicking(true)} className="flex items-baseline gap-2 border-0 bg-transparent p-0 text-left">
            <span>Letter {info.upper}</span>
            <span className="font-sans text-[12.5px] text-cobalt underline underline-offset-2">all letters</span>
          </button>
        }
        subtitle="Copperplate capital, cursive lowercase"
        note={
          <>
            {info.capTip} {info.lowerTip}
          </>
        }
        segments={LETTERS.map((l) => (l === letter ? 'current' : today.letters.includes(l) ? 'done' : 'empty'))}
        segmentsLabel={`Letter ${i + 1} of 26. ${today.letters.length} practised today.`}
        build={build}
        prevLabel="Previous letter"
        nextLabel="Next letter"
        onPrev={i > 0 ? () => go(href.abc(LETTERS[i - 1]), true) : undefined}
        onNext={i < 25 ? () => go(href.abc(LETTERS[i + 1]), true) : undefined}
        onSave={(src) => savePage({ kind: 'abc', label: info.upper + info.lower, src }, { letter })}
        savedLabel={`Saved ${info.upper}${info.lower} to today's pages`}
      />
      {picking && (
        <Picker role="dialog" aria-modal="true" aria-label="Choose a letter">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="m-0 text-[22px] font-normal">Choose a letter</h2>
            <IconButton label="Close" onClick={() => setPicking(false)}>
              {Icons.close}
            </IconButton>
          </div>
          <p className="mt-0 mb-4 font-sans text-[13px] text-ink-soft">A blue dot marks letters you practised today.</p>
          <div className="grid grid-cols-4 gap-2.5">
            {LETTERS.map((l) => (
              <Cell
                key={l}
                type="button"
                $done={today.letters.includes(l)}
                $current={l === letter}
                aria-label={`Letter ${l}`}
                onClick={() => {
                  setPicking(false)
                  go(href.abc(l), true)
                }}
              >
                <Hand text={l + l.toLowerCase()} size={13} />
              </Cell>
            ))}
          </div>
        </Picker>
      )}
    </>
  )
}
