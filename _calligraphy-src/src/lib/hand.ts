// The "combined hand": Copperplate capitals (Pinyon Script) with
// business-cursive lowercase (Ephesis). Text is split into runs so
// each case gets its own face, both in the DOM and on canvas.

export const CAPS_FONT = 'Pinyon Script'
export const CURSIVE_FONT = 'Ephesis'

export type Run = { text: string; caps: boolean }

const isCap = (c: string) => c !== c.toLowerCase() && c === c.toUpperCase()

export function splitRuns(text: string): Run[] {
  const runs: Run[] = []
  for (const ch of text) {
    const caps = isCap(ch)
    const last = runs[runs.length - 1]
    if (last && last.caps === caps) last.text += ch
    else runs.push({ text: ch, caps })
  }
  return runs
}

/** Font metrics measured once the faces have loaded. Ratios are per 1px of font size. */
export type Metrics = { xRatio: number; capRatio: number }

let metrics: Metrics | null = null

export async function loadHand(): Promise<Metrics> {
  if (metrics) return metrics
  await Promise.all([
    document.fonts.load(`100px "${CAPS_FONT}"`),
    document.fonts.load(`100px "${CURSIVE_FONT}"`),
  ])
  const ctx = document.createElement('canvas').getContext('2d')!
  ctx.font = `100px "${CURSIVE_FONT}"`
  const xRatio = ctx.measureText('x').actualBoundingBoxAscent / 100 || 0.28
  ctx.font = `100px "${CAPS_FONT}"`
  const capRatio = ctx.measureText('H').actualBoundingBoxAscent / 100 || 0.6
  metrics = { xRatio, capRatio }
  return metrics
}

/** Typical metrics (per em) for the DOM renderer; the canvas measures them live. */
export const CAPS_CAP_EM = 0.69
export const CURSIVE_X_EM = 0.35

/** How tall capitals stand, in x-heights. Copperplate caps reach ~2× the x-height. */
export const CAP_IN_X = 2.1

export function fonts(m: Metrics, xh: number) {
  return {
    cursive: `${(xh / m.xRatio).toFixed(2)}px "${CURSIVE_FONT}"`,
    caps: `${((xh * CAP_IN_X) / m.capRatio).toFixed(2)}px "${CAPS_FONT}"`,
  }
}

export function measureHand(ctx: CanvasRenderingContext2D, m: Metrics, text: string, xh: number) {
  const f = fonts(m, xh)
  let w = 0
  for (const r of splitRuns(text)) {
    ctx.font = r.caps ? f.caps : f.cursive
    w += ctx.measureText(r.text).width
  }
  return w
}

export function drawHand(
  ctx: CanvasRenderingContext2D,
  m: Metrics,
  text: string,
  x: number,
  baseline: number,
  xh: number,
) {
  const f = fonts(m, xh)
  ctx.textBaseline = 'alphabetic'
  let cx = x
  for (const r of splitRuns(text)) {
    ctx.font = r.caps ? f.caps : f.cursive
    ctx.fillText(r.text, cx, baseline)
    cx += ctx.measureText(r.text).width
  }
  return cx - x
}

/** Greedy word wrap using the mixed-face widths. */
export function wrapHand(
  ctx: CanvasRenderingContext2D,
  m: Metrics,
  text: string,
  xh: number,
  maxWidth: number,
) {
  const lines: string[] = []
  for (const para of text.split(/\n+/)) {
    let line = ''
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const next = line ? `${line} ${word}` : word
      if (line && measureHand(ctx, m, next, xh) > maxWidth) {
        lines.push(line)
        line = word
      } else line = next
    }
    if (line) lines.push(line)
  }
  return lines
}
