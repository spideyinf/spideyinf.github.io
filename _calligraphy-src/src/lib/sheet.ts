import { theme } from '../theme'
import { drawHand, measureHand, wrapHand, type Metrics } from './hand'

// A practice sheet is a stack of ruled rows. Each row has its own
// x-height; guidelines follow a Copperplate-style ratio around it.
const ASC = 2.2 // ascender line, in x-heights above the baseline
const DESC = 1.7 // descender line, below the baseline
const PAD = 0.35
export const ROW_IN_X = ASC + DESC + PAD * 2
const SLANT = (55 * Math.PI) / 180

export type Segment = { text: string; alpha: number }
export type RowSpec = { xh: number; segments: Segment[]; align?: 'left' | 'center'; gap?: number }
export type Row = RowSpec & { top: number; baseline: number; height: number }

export type SheetLayout = { rows: Row[]; width: number; height: number }

// Rules run edge to edge; written text keeps a small inset from the screen edge.
export const MARGIN = 0
export const TEXT_INSET = 14

export function stackRows(specs: RowSpec[], width: number, height: number, fillXh?: number): SheetLayout {
  const rows: Row[] = []
  let y = 6
  for (const s of specs) {
    const h = s.xh * ROW_IN_X
    if (y + h > height && rows.length) break
    rows.push({ ...s, top: y, height: h, baseline: y + (PAD + ASC) * s.xh })
    y += h
  }
  if (fillXh) {
    const h = fillXh * ROW_IN_X
    while (y + h <= height) {
      rows.push({ xh: fillXh, segments: [], top: y, height: h, baseline: y + (PAD + ASC) * fillXh })
      y += h
    }
  }
  return { rows, width, height }
}

/** Split long text into pages of wrapped rows that fit the sheet height. */
export function paginateText(
  ctx: CanvasRenderingContext2D,
  m: Metrics,
  text: string,
  xh: number,
  width: number,
  height: number,
  alpha = 0.3,
): RowSpec[][] {
  const lines = wrapHand(ctx, m, text, xh, width - TEXT_INSET * 2 - xh * 0.5)
  const perPage = Math.max(1, Math.floor((height - 6) / (xh * ROW_IN_X)) - 1)
  const pages: RowSpec[][] = []
  for (let i = 0; i < lines.length; i += perPage) {
    pages.push(lines.slice(i, i + perPage).map((t) => ({ xh, segments: [{ text: t, alpha }] })))
  }
  return pages.length ? pages : [[]]
}

function rgba(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16)
  return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`
}

export function drawSheet(
  ctx: CanvasRenderingContext2D,
  m: Metrics,
  layout: SheetLayout,
  showModel: boolean,
  guideStrength = 1,
) {
  const { width } = layout
  const { cobalt, ink } = theme.color
  ctx.lineCap = 'butt'
  for (const r of layout.rows) {
    const x0 = MARGIN
    const x1 = width - MARGIN
    const line = (y: number, a: number, dash: number[] = []) => {
      ctx.setLineDash(dash)
      ctx.strokeStyle = rgba(cobalt, a * guideStrength)
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x0, Math.round(y) + 0.5)
      ctx.lineTo(x1, Math.round(y) + 0.5)
      ctx.stroke()
    }
    // Slant lines first so the horizontal rules sit on top of them.
    const ascY = r.baseline - ASC * r.xh
    const descY = r.baseline + DESC * r.xh
    const run = (descY - ascY) / Math.tan(SLANT)
    const step = r.xh * 2.4
    ctx.setLineDash([])
    ctx.strokeStyle = rgba(cobalt, 0.075 * guideStrength)
    ctx.lineWidth = 1
    ctx.save()
    ctx.beginPath()
    ctx.rect(x0, ascY, x1 - x0, descY - ascY)
    ctx.clip()
    for (let x = x0 - run; x < x1 + run; x += step) {
      ctx.beginPath()
      ctx.moveTo(x, descY)
      ctx.lineTo(x + run, ascY)
      ctx.stroke()
    }
    ctx.restore()

    line(ascY, 0.16, [3, 4])
    line(r.baseline - r.xh, 0.28)
    line(r.baseline, 0.55)
    line(descY, 0.16, [3, 4])

    if (!showModel || !r.segments.length) continue
    const gap = (r.gap ?? 1.4) * r.xh
    const total =
      r.segments.reduce((w, s) => w + measureHand(ctx, m, s.text, r.xh), 0) + gap * (r.segments.length - 1)
    let x = r.align === 'center' ? (width - total) / 2 : TEXT_INSET + r.xh * 0.3
    for (const s of r.segments) {
      ctx.fillStyle = rgba(ink, s.alpha)
      x += drawHand(ctx, m, s.text, x, r.baseline, r.xh) + gap
    }
  }
  ctx.setLineDash([])
}

export function rowAt(layout: SheetLayout | null, y: number) {
  if (!layout) return null
  return layout.rows.find((r) => y >= r.top && y < r.top + r.height) ?? layout.rows[layout.rows.length - 1] ?? null
}
