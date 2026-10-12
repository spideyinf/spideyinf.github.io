// Text in a script's font, sized by x-height so it sits on the guidelines.
// Each script has one font for capitals and lowercase alike.

/** Font metrics measured once the face has loaded. `xRatio` is x-height per 1px of font size. */
export type Metrics = { font: string; xRatio: number }

const cache = new Map<string, Promise<Metrics>>()

export function loadHand(font: string): Promise<Metrics> {
  let hit = cache.get(font)
  if (!hit) {
    hit = document.fonts.load(`100px "${font}"`).then(() => {
      const ctx = document.createElement('canvas').getContext('2d')!
      ctx.font = `100px "${font}"`
      const xRatio = ctx.measureText('x').actualBoundingBoxAscent / 100 || 0.35
      return { font, xRatio }
    })
    cache.set(font, hit)
  }
  return hit
}

const fontAt = (m: Metrics, xh: number) => `${(xh / m.xRatio).toFixed(2)}px "${m.font}"`

export function measureHand(ctx: CanvasRenderingContext2D, m: Metrics, text: string, xh: number) {
  ctx.font = fontAt(m, xh)
  return ctx.measureText(text).width
}

export function drawHand(
  ctx: CanvasRenderingContext2D,
  m: Metrics,
  text: string,
  x: number,
  baseline: number,
  xh: number,
) {
  ctx.font = fontAt(m, xh)
  ctx.textBaseline = 'alphabetic'
  ctx.fillText(text, x, baseline)
  return ctx.measureText(text).width
}

/** Greedy word wrap at the given x-height. */
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
