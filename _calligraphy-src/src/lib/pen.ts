// The pen case: pens, nibs, inks and papers, and how they put ink on the page.
//
// What a fountain pen feels like, as a model:
// - A round nib lays a near-even line that swells a little on downstrokes
//   (nib spring) and runs wetter, so wider and darker, when you slow down.
// - A stub nib has a flat edge: the line is thick or thin by direction.
// - A flex nib spreads its tines under pressure: hairline up, heavy down.
// - Ink shades (lighter where you moved fast), sheens (a metallic tint where
//   it pools on smooth paper), and iron-gall inks write blue then darken.
// - Paper decides how ink sits: absorbent paper feathers and dries fast,
//   coated paper keeps the line crisp, shows sheen and dries slowly.
//
// All pens and inks here are original designs for this app.

/* ---------------- Nibs ---------------- */

export type NibId = 'ef' | 'f' | 'm' | 'b' | 'stub' | 'flex'

export type Nib = {
  id: NibId
  name: string
  short: string
  feel: string
  /** Line width at an 18px x-height, in CSS px. */
  base: number
  /** How much a downstroke swells the line (0 = rigid). */
  spring: number
  kind: 'round' | 'stub' | 'flex'
  /** Stub only: edge width at an 18px x-height, and the angle the edge is held at (degrees). */
  edge?: number
  angle?: number
  /** How scratchy it sounds and feels on paper (0 smooth – 1 toothy). */
  tooth: number
}

export const NIBS: Nib[] = [
  { id: 'ef', name: 'Extra fine', short: 'EF', feel: 'Needle-fine and crisp, with feedback you can hear.', base: 0.8, spring: 0.08, kind: 'round', tooth: 0.95 },
  { id: 'f', name: 'Fine', short: 'F', feel: 'The everyday nib: precise, a little feedback.', base: 1.3, spring: 0.14, kind: 'round', tooth: 0.6 },
  { id: 'm', name: 'Medium', short: 'M', feel: 'Smooth and generous; shows off shading.', base: 1.95, spring: 0.18, kind: 'round', tooth: 0.35 },
  { id: 'b', name: 'Broad', short: 'B', feel: 'Glassy and wet; lets sheen pool.', base: 2.8, spring: 0.2, kind: 'round', tooth: 0.15 },
  { id: 'stub', name: 'Stub 1.1', short: '1.1', feel: 'Flat edge: thick downstrokes, thin crossings. Made for italic.', base: 0.9, spring: 0, kind: 'stub', edge: 4.4, angle: 40, tooth: 0.3 },
  { id: 'flex', name: 'Flex', short: 'Flex', feel: 'Tines spread under pressure: hairlines up, swells down.', base: 1, spring: 0, kind: 'flex', tooth: 0.5 },
]

/* ---------------- Inks ---------------- */

export type InkId = 'ledger' | 'harbor' | 'persimmon' | 'pine' | 'oxblood' | 'sepia' | 'monsoon' | 'lotus' | 'lacquer'

export type Ink = {
  id: InkId
  name: string
  note: string
  /** Colour on the page once dry. */
  color: string
  /** Iron gall: the colour it goes down in, before it darkens to `color`. */
  wet?: string
  /** Metallic tint where the ink pools. */
  sheen?: string
  /** How much it lightens where you move fast (0 flat – 1 strong). */
  shading: number
  /** Flow: below 1 dry and crisp, above 1 wet and generous. */
  flow: number
}

export const INKS: Ink[] = [
  { id: 'ledger', name: 'Ledger Blue-Black', note: 'Iron gall: writes blue, settles into near-black. Permanent.', color: '#1f2638', wet: '#2f56a8', shading: 0.35, flow: 0.95 },
  { id: 'harbor', name: 'Harbor Teal', note: 'Deep teal with a red sheen where it pools.', color: '#0f6670', sheen: '#9b2f45', shading: 0.55, flow: 1.12 },
  { id: 'persimmon', name: 'Persimmon', note: 'Warm orange-red that shades light to dark.', color: '#c24f29', shading: 0.65, flow: 1.05 },
  { id: 'pine', name: 'Pine Shadow', note: 'Forest green with strong shading.', color: '#2d5a3c', shading: 0.7, flow: 0.98 },
  { id: 'oxblood', name: 'Cellar Oxblood', note: 'Dark wine with a gold sheen.', color: '#5f1a27', sheen: '#b8923a', shading: 0.4, flow: 1.1 },
  { id: 'sepia', name: 'Letter Sepia', note: 'Old-letter brown, soft and readable.', color: '#664126', shading: 0.55, flow: 0.98 },
  { id: 'monsoon', name: 'Monsoon Grey', note: 'Rain-cloud grey; shading in every stroke.', color: '#55606a', shading: 0.75, flow: 1.0 },
  { id: 'lotus', name: 'Lotus Violet', note: 'Purple with a gold-green sheen.', color: '#55348a', sheen: '#9aa03a', shading: 0.5, flow: 1.08 },
  { id: 'lacquer', name: 'Lacquer Black', note: 'Saturated, flat black. No fuss.', color: '#161417', shading: 0.12, flow: 1.04 },
]

/* ---------------- Papers ---------------- */

export type PaperId = 'laid' | 'cream' | 'smooth'

export type Paper = {
  id: PaperId
  name: string
  note: string
  /** Colour under the scan (multiplied). */
  tint: string
  /** 0 coated – 1 blotting: feathering and how fast ink sinks in. */
  absorb: number
  /** How much sheen survives on this paper (0 – 1). */
  sheen: number
  /** Time for wet ink to dry, in ms. */
  dry: number
}

export const PAPERS: Paper[] = [
  { id: 'laid', name: 'Aged laid', note: 'Toothy and absorbent: soft edges, dries fast.', tint: '#e9e1d0', absorb: 0.55, sheen: 0.15, dry: 1600 },
  { id: 'cream', name: 'Cream notebook', note: 'The all-rounder: clean lines, some sheen.', tint: '#f3ecdc', absorb: 0.25, sheen: 0.6, dry: 2600 },
  { id: 'smooth', name: 'Smooth coated', note: 'Glassy: crisp lines, full sheen, slow to dry.', tint: '#f6f3ec', absorb: 0.05, sheen: 1, dry: 4200 },
]

/* ---------------- Pens ---------------- */

export type PenId = 'meridian' | 'harbor' | 'saffron' | 'ledger' | 'ashlar' | 'tidewater'

export type Material = 'resin' | 'demonstrator' | 'celluloid' | 'metal' | 'ebonite' | 'faceted'

export type Pen = {
  id: PenId
  name: string
  blurb: string
  nib: NibId
  material: Material
  /** Body colours: base and second tone (for patterns and translucency). */
  body: [string, string]
  trim: 'gold' | 'silver' | 'black' | 'rose'
  ends: 'flat' | 'round' | 'torpedo'
}

export const PENS: Pen[] = [
  { id: 'meridian', name: 'Meridian', blurb: 'Black resin, gold trim, a fine Japanese-style nib.', nib: 'ef', material: 'resin', body: ['#151417', '#3a3840'], trim: 'gold', ends: 'flat' },
  { id: 'harbor', name: 'Harbor', blurb: 'Smoky clear piston filler: watch your ink slosh inside.', nib: 'm', material: 'demonstrator', body: ['#8fa4b4', '#c9d6df'], trim: 'silver', ends: 'round' },
  { id: 'saffron', name: 'Saffron', blurb: 'Amber marbled celluloid, a broad and juicy nib.', nib: 'b', material: 'celluloid', body: ['#b8661c', '#f0b45a'], trim: 'gold', ends: 'torpedo' },
  { id: 'ledger', name: 'Ledger', blurb: 'Matte olive aluminium. The pen you take everywhere.', nib: 'f', material: 'metal', body: ['#5b6247', '#7c8466'], trim: 'black', ends: 'flat' },
  { id: 'ashlar', name: 'Ashlar', blurb: 'Faceted slate resin with a 1.1 stub for italic.', nib: 'stub', material: 'faceted', body: ['#4a5058', '#6c747e'], trim: 'silver', ends: 'flat' },
  { id: 'tidewater', name: 'Tidewater', blurb: 'Mottled red-black ebonite, warm in the hand, with a flex nib.', nib: 'flex', material: 'ebonite', body: ['#2a1412', '#8c2f1f'], trim: 'rose', ends: 'round' },
]

/* ---------------- Settings ---------------- */

export type PenSettings = { pen: PenId; nib: NibId; ink: InkId; paper: PaperId; sound: boolean }

const KEY = 'daily-hand:pen'
export const DEFAULT_PEN: PenSettings = { pen: 'harbor', nib: 'm', ink: 'ledger', paper: 'cream', sound: false }

export function loadPen(): PenSettings {
  try {
    const p = { ...DEFAULT_PEN, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') }
    // Settings saved before the pen case existed used other ink ids.
    if (!INKS.some((i) => i.id === p.ink)) p.ink = DEFAULT_PEN.ink
    if (!NIBS.some((n) => n.id === p.nib)) p.nib = DEFAULT_PEN.nib
    if (!PENS.some((n) => n.id === p.pen)) p.pen = DEFAULT_PEN.pen
    if (!PAPERS.some((n) => n.id === p.paper)) p.paper = DEFAULT_PEN.paper
    return p
  } catch {
    return DEFAULT_PEN
  }
}

export function savePen(p: PenSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage unavailable: the choice lasts for this visit */
  }
}

export const nibOf = (id: NibId) => NIBS.find((n) => n.id === id) ?? NIBS[1]
export const inkOf = (id: InkId) => INKS.find((n) => n.id === id) ?? INKS[0]
export const paperOf = (id: PaperId) => PAPERS.find((n) => n.id === id) ?? PAPERS[1]
export const penOf = (id: PenId) => PENS.find((n) => n.id === id) ?? PENS[1]

/* ---------------- Strokes ---------------- */

/** One sampled point: position, line width, and ink density (0 light – 1 full). */
export type InkPoint = { x: number; y: number; w: number; d: number }

/** A stroke and the ink it was written in. `born` is when it was lifted (for drying). */
export type InkStroke = {
  color: string
  pts: InkPoint[]
  wet?: string
  sheen?: string
  shading?: number
  pool?: boolean
  born?: number
}

export const strokeInk = (ink: Ink): Pick<InkStroke, 'color' | 'wet' | 'sheen' | 'shading'> => ({
  color: ink.color,
  wet: ink.wet,
  sheen: ink.sheen,
  shading: ink.shading,
})

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v))

/**
 * Target width and density for the next sample.
 * `xh` scales the line a little with the row so big model letters don't look scratchy.
 */
export function sample(
  nib: Nib,
  ink: Ink,
  paper: Paper,
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
  const spread = 1 + paper.absorb * 0.14 // ink wicks into absorbent paper
  const wet = ink.flow
  // Slow = wetter and darker; fast = drier and lighter. Wet inks shade less.
  // Calibrated to finger and stylus speeds: ~0.1 px/ms slow, ~0.3 typical, ~0.8 a quick flourish.
  const d = clamp(1.08 - speed * 0.55 * (2 - wet), 0.6, 1)

  if (nib.kind === 'flex') {
    const hair = Math.max(1, xh * 0.045)
    const shade = xh * 0.24 * (isPen ? 0.4 + p * 1.2 : 1)
    return { w: (hair + shade * Math.pow(down, 1.4)) * spread, d: clamp(d + 0.05, 0.7, 1) }
  }
  if (nib.kind === 'stub') {
    // Width follows direction against the edge held at `angle`.
    const dir = Math.atan2(-dy, dx)
    const a = ((nib.angle ?? 40) * Math.PI) / 180
    const edge = (nib.edge ?? 4) * scale
    const hair = 0.9 * scale
    return { w: (hair + (edge - hair) * Math.abs(Math.sin(dir - a))) * spread * (0.92 + wet * 0.08), d }
  }
  const flow = clamp(1.14 - speed * 0.14, 0.82, 1.14) * (0.9 + wet * 0.1)
  const press = isPen ? 0.8 + p * 0.45 : 1
  const w = nib.base * scale * (1 + nib.spring * Math.pow(down, 1.5)) * flow * press * spread
  return { w, d }
}

/* ---------------- Painting ---------------- */

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mixRgb(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)
  return `rgb(${Math.round(r1 * t + r2 * (1 - t))},${Math.round(g1 * t + g2 * (1 - t))},${Math.round(b1 * t + b2 * (1 - t))})`
}
function mixHex(a: string, b: string, t: number) {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)
  const h = (v: number) => Math.round(v).toString(16).padStart(2, '0')
  return `#${h(r1 * t + r2 * (1 - t))}${h(g1 * t + g2 * (1 - t))}${h(b1 * t + b2 * (1 - t))}`
}

/** How a stroke looks `age` ms after it was written on this paper: iron gall darkens, wet ink glistens. */
export function inkAt(s: InkStroke, paper: Paper, age: number) {
  const t = clamp(age / paper.dry, 0, 1)
  const base = s.wet ? mixHex(s.color, s.wet, Math.pow(t, 0.8)) : s.color
  // Wet ink sits a touch darker and more saturated than dry ink.
  return { color: mixHex(base, '#000000', 1 - (1 - t) * 0.1), dryness: t }
}

export type PaintOpts = { paper: Paper; color?: string; from?: number }

/** Paint a stroke opaque; the caller composites it so ink layers like real ink. */
export function paintStroke(ctx: CanvasRenderingContext2D, s: InkStroke, paperOrHex: Paper | string, from = 0, colorOverride?: string) {
  const paper: Paper = typeof paperOrHex === 'string' ? { ...PAPERS[1], tint: paperOrHex } : paperOrHex
  const pts = s.pts
  const color = colorOverride ?? s.color
  const shading = s.shading ?? 0.5
  ctx.lineCap = ctx.lineJoin = 'round'
  // A wet edge: a hair of blur in the ink's own colour, more on absorbent paper.
  ctx.shadowColor = color
  ctx.shadowBlur = 0.6 + paper.absorb * 1.4
  const tone = (d: number) => mixRgb(color, paper.tint, 1 - shading * (1 - d) * 1.15)

  if (from === 0 && pts.length) {
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

/** The last little piece of a stroke, a pool if the nib rested, and sheen where ink is thickest. */
export function finishStroke(ctx: CanvasRenderingContext2D, s: InkStroke, paperOrHex: Paper | string, colorOverride?: string) {
  const paper: Paper = typeof paperOrHex === 'string' ? { ...PAPERS[1], tint: paperOrHex } : paperOrHex
  const pts = s.pts
  const color = colorOverride ?? s.color
  if (pts.length >= 2) {
    const b = pts[pts.length - 2]
    const c = pts[pts.length - 1]
    ctx.lineCap = 'round'
    ctx.strokeStyle = mixRgb(color, paper.tint, 1 - (s.shading ?? 0.5) * (1 - c.d) * 1.15)
    ctx.lineWidth = c.w
    ctx.beginPath()
    ctx.moveTo((b.x + c.x) / 2, (b.y + c.y) / 2)
    ctx.lineTo(c.x, c.y)
    ctx.stroke()
  }
  const end = pts[pts.length - 1]
  if (s.pool && end) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(end.x, end.y, end.w * 0.6, 0, Math.PI * 2)
    ctx.fill()
  }

  // Sheen: a metallic tint on top of the ink, only where it ran slow and wet.
  const strength = (s.sheen ? 1 : 0) * paper.sheen
  if (!strength || !s.sheen) return
  ctx.save()
  ctx.globalCompositeOperation = 'source-atop'
  ctx.lineCap = 'round'
  for (let i = 1; i < pts.length; i++) {
    const b = pts[i - 1]
    const c = pts[i]
    const wetness = clamp((Math.min(b.d, c.d) - 0.9) / 0.1, 0, 1)
    if (!wetness) continue
    ctx.globalAlpha = 0.55 * strength * wetness
    ctx.strokeStyle = s.sheen
    ctx.lineWidth = Math.max(0.8, c.w * 0.5)
    ctx.beginPath()
    // Sheen gathers along one edge of the line, where the ink film is thickest.
    ctx.moveTo(b.x + c.w * 0.2, b.y + c.w * 0.2)
    ctx.lineTo(c.x + c.w * 0.2, c.y + c.w * 0.2)
    ctx.stroke()
  }
  for (const p of [pts[0], s.pool ? end : null]) {
    if (!p) continue
    ctx.globalAlpha = 0.7 * strength
    ctx.fillStyle = s.sheen
    ctx.beginPath()
    ctx.arc(p.x + p.w * 0.12, p.y + p.w * 0.12, p.w * 0.38, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.restore()
}

/** How opaque a dried stroke is when layered onto the page. */
export const INK_OPACITY = 0.9
