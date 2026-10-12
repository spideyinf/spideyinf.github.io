// Recording your own hand: strokes written on the recorder's guidelines are
// turned into the same upright x-height units the built-in letters use, and
// kept as a draft on this device until you download them as hand.json.

import type { Glyph, P, Step } from './ductus'
import type { HandFile } from './scripts'

const KEY = 'daily-hand:recording'

export type Draft = Required<Pick<HandFile, 'name' | 'blurb' | 'slant' | 'shade' | 'font'>> & {
  capitals: Record<string, Glyph>
  lowercase: Record<string, Glyph>
}

export const NEW_DRAFT: Draft = {
  name: 'My hand',
  blurb: 'My own handwriting.',
  slant: 55,
  shade: 0.4,
  font: 'font.woff2',
  capitals: {},
  lowercase: {},
}

export function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? { ...NEW_DRAFT, ...JSON.parse(raw) } : null
  } catch {
    return null
  }
}

export function saveDraft(d: Draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify(d))
  } catch {
    /* storage full or blocked: the draft lasts for this visit */
  }
}

export function discardDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* nothing to remove */
  }
}

export const recordedCount = (d: Draft) =>
  Object.values(d.capitals).filter((g) => g.steps.length).length +
  Object.values(d.lowercase).filter((g) => g.steps.length).length

/** Screen point → upright x-height units (undo the slant), relative to the frame. */
export function toUnits(px: number, py: number, frame: { ox: number; baseline: number; xh: number; slant: number }): P {
  const y = (frame.baseline - py) / frame.xh
  const k = 1 / Math.tan((frame.slant * Math.PI) / 180)
  const x = (px - frame.ox) / frame.xh - y * k
  return [x, y]
}

/** Ramer–Douglas–Peucker: keep the points that carry the shape. */
function simplify(pts: P[], eps: number): P[] {
  if (pts.length < 3) return pts
  const [a, b] = [pts[0], pts[pts.length - 1]]
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy) || 1
  let worst = 0
  let at = 0
  for (let i = 1; i < pts.length - 1; i++) {
    const d = Math.abs(dy * pts[i][0] - dx * pts[i][1] + b[0] * a[1] - b[1] * a[0]) / len
    if (d > worst) {
      worst = d
      at = i
    }
  }
  if (worst <= eps) return [a, b]
  return [...simplify(pts.slice(0, at + 1), eps).slice(0, -1), ...simplify(pts.slice(at), eps)]
}

const r3 = (n: number) => Math.round(n * 1000) / 1000

/** One pen-down-to-pen-up movement, as a tutorial step. Tiny marks become dots. */
export function strokeToStep(pts: P[], index: number): Step {
  const xs = pts.map((p) => p[0])
  const ys = pts.map((p) => p[1])
  const extent = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys))
  if (extent < 0.12) {
    const cx = xs.reduce((a, b) => a + b, 0) / xs.length
    const cy = ys.reduce((a, b) => a + b, 0) / ys.length
    return { name: 'Dot', pts: [[r3(cx), r3(cy)]], dot: true }
  }
  const kept = simplify(pts, 0.025).map(([x, y]) => [r3(x), r3(y)] as P)
  return { name: `Stroke ${index + 1}`, pts: kept }
}

/** The file to drop into src/hands/<id>/hand.json. */
export function toHandFile(d: Draft): HandFile {
  const clean = (set: Record<string, Glyph>) =>
    Object.fromEntries(Object.entries(set).filter(([, g]) => g.steps.length))
  return {
    name: d.name,
    blurb: d.blurb,
    slant: d.slant,
    shade: d.shade,
    font: d.font,
    capitals: clean(d.capitals),
    lowercase: clean(d.lowercase),
  }
}
