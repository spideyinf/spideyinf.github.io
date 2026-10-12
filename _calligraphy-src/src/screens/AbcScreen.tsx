import { useCallback } from 'react'
import { LetterTutorial } from '../components/LetterTutorial'
import { PracticeShell } from '../components/PracticeShell'
import { bounds, CAPITALS, LOWERCASE } from '../lib/ductus'
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

  // Trace the same stroke-built letters the tutorial demonstrates, then the word in the hand.
  const build = useCallback(
    (_ctx: CanvasRenderingContext2D, _m: Metrics, w: number, h: number) => {
      const cap = CAPITALS[info.upper]
      const low = LOWERCASE[info.lower]
      const md = Math.min(w / 14, (h / ROW_IN_X) * 0.3)
      // As many copies as fit across the row, up to a limit.
      const fit = (gw: number, gap: number, max: number) =>
        Math.max(1, Math.min(max, Math.floor((w - 28 + gap * md) / ((gw + gap) * md))))
      const nCap = fit(bounds(cap).width, 1.3, 3)
      const nLow = fit(bounds(low).width, 1.0, 5)
      return stackRows(
        [
          { xh: md, gap: 1.3, segments: fade(nCap, 0.34, 0.1).map((alpha) => ({ glyph: cap, alpha })) },
          { xh: md, gap: 1.0, segments: fade(nLow, 0.36, 0.08).map((alpha) => ({ glyph: low, alpha, weight: 0.85 })) },
          { xh: md, segments: [{ text: info.word, alpha: 0.3 }] },
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
      lead={<LetterTutorial key={letter} letter={letter} />}
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
