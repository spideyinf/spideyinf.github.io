export type Mark = 'selected' | 'related' | 'wrong' | 'answer' | undefined
export type MarkFn = (midi: number) => Mark

/** How a key / fret cell is highlighted */
export type Paint = {
  fill: string
  /** Solid highlight (vs. a faint hint) */
  strong: boolean
  /** Main text, defaults to the note name */
  label?: string
  /** Small secondary text, e.g. the chord degree */
  sub?: string
}

export type PaintFn = (midi: number, at?: { string: number; fret: number }) => Paint | undefined

export const markPaint = (m: Mark): Paint | undefined =>
  m === 'selected' || m === 'answer'
    ? { fill: 'var(--hot)', strong: true }
    : m === 'wrong'
      ? { fill: 'var(--bad)', strong: true }
      : m === 'related'
        ? { fill: 'var(--hot-soft)', strong: false }
        : undefined

/** A note to draw on a staff */
export type StaffNote = { step: number; accidental: string; color: string; key: string | number }
