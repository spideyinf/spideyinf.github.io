import { useCallback } from 'react'
import { PracticeShell } from '../components/PracticeShell'
import type { Metrics } from '../lib/hand'
import { LETTERS, letterInfo } from '../lib/letters'
import { go, href } from '../lib/router'
import { ROW_IN_X, stackRows } from '../lib/sheet'
import { usePractice } from '../state/practice'

const fade = (n: number, from: number, to: number) =>
  Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1))

export function AbcScreen({ letter }: { letter: string }) {
  const { savePage } = usePractice()
  const info = letterInfo(letter)
  const i = LETTERS.indexOf(letter)

  const build = useCallback(
    (_ctx: CanvasRenderingContext2D, _m: Metrics, w: number, h: number) => {
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
    <PracticeShell
      pageKey={`abc:${letter}`}
      title={`Letter ${info.upper}`}
      subtitle={`${i + 1} of 26`}
      note={`${info.capTip} ${info.lowerTip}`}
      build={build}
      backTo={href.letters}
      backLabel="Back to all letters"
      prevLabel="Previous letter"
      nextLabel="Next letter"
      onPrev={i > 0 ? () => go(href.abc(LETTERS[i - 1]), true) : undefined}
      onNext={i < 25 ? () => go(href.abc(LETTERS[i + 1]), true) : undefined}
      onSave={(src) => savePage({ kind: 'abc', label: info.upper + info.lower, src }, { letter })}
      savedLabel={`Saved ${info.upper}${info.lower} to today's pages`}
    />
  )
}
