import { useCallback } from 'react'
import { LetterTutorial } from '../components/LetterTutorial'
import { PracticeShell } from '../components/PracticeShell'
import { measureHand, type Metrics } from '../lib/hand'
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

  // Models to copy onto paper: the letters exactly as the hand's font draws them, then a word.
  const build = useCallback(
    (ctx: CanvasRenderingContext2D, m: Metrics, w: number, h: number) => {
      const md = Math.min(w / 14, (h / ROW_IN_X) * 0.3)
      // As many copies as fit across the row, up to a limit, fading as they go.
      const row = (ch: string, gap: number, max: number): RowSpec => {
        const gw = measureHand(ctx, m, ch, md) / md
        const n = Math.max(1, Math.min(max, Math.floor((w - 28 + gap * md) / ((gw + gap) * md))))
        return { xh: md, gap, segments: fade(n, 0.85, 0.3).map((alpha) => ({ text: ch, alpha })) }
      }
      return stackRows([row(info.upper, 1.1, 4), row(info.lower, 0.9, 6), { xh: md, segments: [{ text: info.word, alpha: 0.85 }] }], w, h, md)
    },
    [info.upper, info.lower, info.word],
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
