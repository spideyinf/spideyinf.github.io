import { useCallback } from 'react'
import { LetterTutorial } from '../components/LetterTutorial'
import { PracticeShell } from '../components/PracticeShell'
import { bounds, type Glyph } from '../lib/ductus'
import type { Metrics } from '../lib/hand'
import { LETTERS, letterInfo } from '../lib/letters'
import { go, href } from '../lib/router'
import { ROW_IN_X, stackRows, type RowSpec } from '../lib/sheet'
import { usePractice } from '../state/practice'

const fade = (n: number, from: number, to: number) =>
  Array.from({ length: n }, (_, i) => from + ((to - from) * i) / Math.max(1, n - 1))

export function AbcScreen({ letter }: { letter: string }) {
  const { savePage, markWritten, lettersToday, script } = usePractice()
  const info = letterInfo(letter)
  const i = LETTERS.indexOf(letter)

  // Models to copy onto paper: the letters as the tutorial writes them, then a word in the hand's font.
  const build = useCallback(
    (_ctx: CanvasRenderingContext2D, _m: Metrics, w: number, h: number) => {
      const { style } = script
      const md = Math.min(w / 14, (h / ROW_IN_X) * 0.3)
      // As many copies as fit across the row, up to a limit.
      const row = (g: Glyph | undefined, gap: number, max: number, from: number): RowSpec => {
        if (!g?.steps.length) return { xh: md, segments: [] }
        const gw = bounds(g, style.slant).width
        const n = Math.max(1, Math.min(max, Math.floor((w - 28 + gap * md) / ((gw + gap) * md))))
        return { xh: md, gap, segments: fade(n, from, 0.3).map((alpha) => ({ glyph: g, alpha, style })) }
      }
      return stackRows(
        [
          row(script.capitals[info.upper], 1.3, 3, 0.85),
          row(script.lowercase[info.lower], 1.0, 5, 0.85),
          { xh: md, segments: [{ text: info.word, alpha: 0.85 }] },
        ],
        w,
        h,
        md,
      )
    },
    [info.upper, info.lower, info.word, script],
  )

  return (
    <PracticeShell
      title={`Letter ${info.upper}`}
      subtitle={`${script.name}, ${i + 1} of 26`}
      lead={<LetterTutorial key={`${script.id}:${letter}`} letter={letter} />}
      build={build}
      backTo={href.letters}
      backLabel="Back to all letters"
      prevLabel="Previous letter"
      nextLabel="Next letter"
      onPrev={i > 0 ? () => go(href.abc(LETTERS[i - 1]), true) : undefined}
      onNext={i < 25 ? () => go(href.abc(LETTERS[i + 1]), true) : undefined}
      written={lettersToday.includes(letter)}
      onWritten={() => markWritten({ letter })}
      onPhoto={(src) => savePage({ kind: 'abc', label: info.upper + info.lower, src }, { letter })}
    />
  )
}
