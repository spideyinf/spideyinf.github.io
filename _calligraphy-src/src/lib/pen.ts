// Fountain-pen model for the ink canvas.
//
// A round fountain-pen nib lays down a near-constant line: it widens a
// little on downstrokes (nib spring) and when you slow down (more ink
// flows), thins when you move fast, and pools at the start and end of a
// stroke. Ink is translucent, so overlapping strokes get darker, and fast
// strokes look lighter ("shading" in fountain-pen inks).

export type NibId = 'ef' | 'f' | 'm' | 'flex'
export type InkId = 'black' | 'blueblack' | 'blue' | 'sepia'

export type Nib = {
  id: NibId
  name: string
  /** Line width at a 18px x-height, in CSS px. */
  base: number
  /** How much a downstroke swells the line (0 = rigid). */
  spring: number
  /** Pointed-pen behaviour: hairline up, heavy down. */
  flex?: boolean
}

export const NIBS: Nib[] = [
  { id: 'ef', name: 'Extra fine', base: 1.05, spring: 0.12 },
  { id: 'f', name: 'Fine', base: 1.55, spring: 0.18 },
  { id: 'm', name: 'Medium', base: 2.25, spring: 0.22 },
  { id: 'flex', name: 'Flex', base: 1, spring: 0, flex: true },
]

export type Ink = { id: InkId; name: string; color: string }

export const INKS: Ink[] = [
  { id: 'black', name: 'Black', color: '#1f1b22' },
  { id: 'blueblack', name: 'Blue-black', color: '#1f2f52' },
  { id: 'blue', name: 'Blue', color: '#1d5fa6' },
  { id: 'sepia', name: 'Sepia', color: '#5b3a24' },
]

export type PenSettings = { nib: NibId; ink: InkId }

const KEY = 'daily-hand:pen'
export const DEFAULT_PEN: PenSettings = { nib: 'f', ink: 'blueblack' }

export function loadPen(): PenSettings {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    if (p && NIBS.some((n) => n.id === p.nib) && INKS.some((i) => i.id === p.ink)) return p
  } catch {
    /* fall through */
  }
  return DEFAULT_PEN
}

export function savePen(p: PenSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
}

/** One sampled point: position, line width, and ink density (0 light – 1 full). */
export type InkPoint = { x: number; y: number; w: number; d: number }
/** `pool` marks a stroke where the nib rested before lifting. */
export type InkStroke = { color: string; pts: InkPoint[]; pool?: boolean }

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Target width and density for the next sample.
 * `xh` scales the line a little with the row so big model letters don't look scratchy.
 */
export function sample(
  nib: Nib,
  xh: number,
  dx: number,
  dy: number,
  dt: number,
  pressure: number,
  isPen: boolean,
) {
  const len = Math.hypot(dx, dy) || 1
  const down = Math.max(0, dy / len)
  const speed = len / Math.max(dt, 4) // px per ms
  const scale = clamp(xh / 18, 1, 2.2)
  const p = isPen && pressure > 0 ? pressure : 0.5

  if (nib.flex) {
    const hair = Math.max(1, xh * 0.045)
    const shade = xh * 0.24 * (isPen ? 0.4 + p * 1.2 : 1)
    return { w: hair + shade * Math.pow(down, 1.4), d: clamp(1.05 - speed * 0.12, 0.7, 1) }
  }

  const flow = clamp(1.14 - speed * 0.14, 0.82, 1.14) // slow = wetter, fast = drier
  const press = isPen ? 0.8 + p * 0.45 : 1
  const w = nib.base * scale * (1 + nib.spring * Math.pow(down, 1.5)) * flow * press
  const d = clamp(1.08 - speed * 0.16, 0.62, 1)
  return { w, d }
}

function mix(hex: string, paper: string, t: number) {
  const a = parseInt(hex.slice(1), 16)
  const b = parseInt(paper.slice(1), 16)
  const ch = (s: number) => Math.round(((a >> s) & 255) * t + ((b >> s) & 255) * (1 - t))
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`
}

/** Paint a stroke opaque; the caller composites it so ink layers like real ink. */
export function paintStroke(ctx: CanvasRenderingContext2D, s: InkStroke, paper: string, from = 0) {
  const pts = s.pts
  ctx.lineCap = ctx.lineJoin = 'round'
  // A wet edge: a hair of blur in the ink's own colour.
  ctx.shadowColor = s.color
  ctx.shadowBlur = 0.7
  const tone = (d: number) => mix(s.color, paper, 0.72 + 0.28 * d)

  if (from === 0) {
    // Ink pools where the nib first touches.
    const p = pts[0]
    ctx.fillStyle = tone(1)
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.w * 0.58, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = Math.max(1, from); i < pts.length; i++) {
    const a = pts[i - 2] ?? pts[i - 1]
    const b = pts[i - 1]
    const c = pts[i]
    ctx.strokeStyle = tone((b.d + c.d) / 2)
    ctx.lineWidth = (b.w + c.w) / 2
    ctx.beginPath()
    ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
    ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2)
    ctx.stroke()
  }
  ctx.shadowBlur = 0
}

/** The last little piece of a stroke, plus a pool if the pen rested before lifting. */
export function finishStroke(ctx: CanvasRenderingContext2D, s: InkStroke, paper: string) {
  const pts = s.pts
  if (pts.length < 2) return
  const b = pts[pts.length - 2]
  const c = pts[pts.length - 1]
  ctx.lineCap = 'round'
  ctx.strokeStyle = mix(s.color, paper, 0.72 + 0.28 * c.d)
  ctx.lineWidth = c.w
  ctx.beginPath()
  ctx.moveTo((b.x + c.x) / 2, (b.y + c.y) / 2)
  ctx.lineTo(c.x, c.y)
  ctx.stroke()
  if (s.pool) {
    ctx.fillStyle = s.color
    ctx.beginPath()
    ctx.arc(c.x, c.y, c.w * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** How opaque a dried stroke is when layered onto the page. */
export const INK_OPACITY = 0.9
