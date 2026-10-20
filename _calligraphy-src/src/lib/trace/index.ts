// Tracing, the app's key feature: show how a letter is written, stroke by
// stroke, with ink that is exactly the letter itself, whether it comes from
// a font or from any SVG.
//
// 1. Draw the source (a character in a font, or an SVG) onto a small grid.
// 2. Find its strokes: an SVG made of stroked paths already says them, in
//    document order; a filled shape (any font glyph) is thinned to its centre
//    lines and ordered (see order.ts), guided by the hand's ductus if given.
// 3. Give every inked pixel a time: the moment the pen passes its nearest
//    point on a stroke. Playing the tutorial reveals the true glyph pixel by
//    pixel in that order, so the shape on screen is the source, exactly.

import { loadHand } from '../hand'
import { spline, type Glyph, type Style } from '../ductus'
import { distance, pathLen, thin, toGraph, type Pt } from './skeleton'
import { orderStrokes, type GuideStep, type RawStroke } from './order'

export type TraceSource =
  | { kind: 'font'; font: string; text: string }
  | { kind: 'svg'; svg: string }

/** Draws the source in its own units: origin on the baseline, `xh` px per x-height. */
export type Painter = (ctx: CanvasRenderingContext2D, x: number, baseline: number, xh: number) => void

export type TraceStroke = {
  /** Centre line in grid px, smoothed. */
  pts: Pt[]
  /** Arc length of the reveal, in grid px (a little longer than the line, for the edges). */
  dur: number
  len: number
  name: string
  dot: boolean
  /** The pen doesn't lift between the previous stroke and this one. */
  join: boolean
}

export type Trace = {
  w: number
  h: number
  /** Grid px per x-height, and where the origin and baseline sit on the grid. */
  xh: number
  ox: number
  base: number
  /** Ink extent in x-height units, x right and y up from the origin. */
  box: { minX: number; maxX: number; top: number; bottom: number }
  strokes: TraceStroke[]
  /** Per grid pixel: which stroke reveals it (-1 for none) and when, in px along that stroke. */
  owner: Int16Array
  at: Float32Array
  /** 'paths' when the SVG's own stroke order was used. */
  from: 'paths' | 'outline' | 'guided'
  paint: Painter
}

const XH = 84 // grid px per x-height: fine enough for Copperplate hairlines

/* ---------- Sources ---------- */

type Drawn = { alpha: Uint8ClampedArray; w: number; h: number; ox: number; base: number; paint: Painter; paths?: RawStroke[] }

function grid(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c.getContext('2d', { willReadFrequently: true })!
}

async function drawFont(font: string, text: string): Promise<Drawn> {
  const m = await loadHand(font)
  const ctx = grid(4, 4)
  const size = XH / m.xRatio
  ctx.font = `${size}px "${font}"`
  const tm = ctx.measureText(text)
  const pad = Math.ceil(XH * 0.3)
  const left = Math.ceil(tm.actualBoundingBoxLeft)
  const right = Math.ceil(tm.actualBoundingBoxRight)
  const asc = Math.ceil(tm.actualBoundingBoxAscent)
  const desc = Math.ceil(tm.actualBoundingBoxDescent)
  const w = Math.max(8, left + right + pad * 2)
  const h = Math.max(8, asc + desc + pad * 2)
  const g = grid(w, h)
  const ox = pad + left
  const base = pad + asc
  g.font = `${size}px "${font}"`
  g.textBaseline = 'alphabetic'
  g.fillStyle = '#000'
  g.fillText(text, ox, base)
  const paint: Painter = (c, x, baseline, xh) => {
    c.font = `${xh / m.xRatio}px "${font}"`
    c.textBaseline = 'alphabetic'
    c.fillStyle = '#000'
    c.fillText(text, x, baseline)
  }
  return { alpha: alphaOf(g, w, h), w, h, ox, base, paint }
}

function alphaOf(g: CanvasRenderingContext2D, w: number, h: number) {
  const d = g.getImageData(0, 0, w, h).data
  const a = new Uint8ClampedArray(w * h)
  for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3]
  return a
}

/**
 * An SVG letter. Its height maps to the hand's guidelines like this:
 * `data-baseline` and `data-xheight` on the root (in viewBox units) place it
 * exactly; without them the drawing's bottom sits on the baseline and it
 * stands two x-heights tall, like a capital.
 */
async function drawSvg(svgText: string): Promise<Drawn> {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const root = doc.documentElement
  if (root.nodeName.toLowerCase() !== 'svg' || doc.querySelector('parsererror')) throw new Error('That file is not an SVG drawing.')
  const vb = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number)
  const num = (v: string | null) => parseFloat(v ?? '') || 0
  let [vx, vy, vw, vh] = vb.length === 4 && vb.every(Number.isFinite) ? vb : [0, 0, num(root.getAttribute('width')) || 100, num(root.getAttribute('height')) || 100]
  if (!(vw > 0 && vh > 0)) [vx, vy, vw, vh] = [0, 0, 100, 100]
  root.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`)
  root.setAttribute('width', String(vw))
  root.setAttribute('height', String(vh))
  root.setAttribute('preserveAspectRatio', 'none')
  const text = new XMLSerializer().serializeToString(root)
  const url = URL.createObjectURL(new Blob([text], { type: 'image/svg+xml' }))
  const img = new Image()
  img.src = url
  try {
    await img.decode()
  } catch {
    URL.revokeObjectURL(url)
    throw new Error('That SVG could not be drawn.')
  }

  // Live copy in the page, to read stroked paths and their transforms.
  const host = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  host.setAttribute('viewBox', `${vx} ${vy} ${vw} ${vh}`)
  host.setAttribute('width', String(vw))
  host.setAttribute('height', String(vh))
  host.style.cssText = 'position:absolute;left:-99999px;top:0;opacity:0;pointer-events:none'
  for (const n of Array.from(root.childNodes)) host.appendChild(document.importNode(n, true))
  host.querySelectorAll('script, foreignObject').forEach((n) => n.remove())
  document.body.appendChild(host)

  try {
    // Units: from data attributes, or by the drawing's ink.
    const probeH = 400
    const ps = probeH / vh
    const pw = Math.ceil(vw * ps)
    const pg = grid(pw, probeH)
    pg.drawImage(img, 0, 0, pw, probeH)
    const pa = alphaOf(pg, pw, probeH)
    let minX = pw, maxX = -1, minY = probeH, maxY = -1
    for (let y = 0; y < probeH; y++)
      for (let x = 0; x < pw; x++)
        if (pa[y * pw + x] > 40) {
          minX = Math.min(minX, x); maxX = Math.max(maxX, x)
          minY = Math.min(minY, y); maxY = Math.max(maxY, y)
        }
    if (maxX < 0) throw new Error('That SVG has nothing drawn in it.')
    const dataBase = root.getAttribute('data-baseline')
    const dataXh = root.getAttribute('data-xheight')
    // vb units → x-heights, and the baseline in vb units.
    const unit = dataXh ? num(dataXh) : (maxY - minY + 1) / ps / 2
    const baseVb = dataBase ? num(dataBase) : vy + (maxY + 1) / ps
    const s = XH / unit // grid px per vb unit
    const pad = Math.ceil(XH * 0.3)
    const ix0 = vx + minX / ps, ix1 = vx + (maxX + 1) / ps
    const iy0 = vy + minY / ps, iy1 = vy + (maxY + 1) / ps
    const w = Math.ceil((ix1 - ix0) * s) + pad * 2
    const h = Math.ceil((iy1 - iy0) * s) + pad * 2
    // Grid position of vb point (x, y).
    const gx = (x: number) => pad + (x - ix0) * s
    const gy = (y: number) => pad + (y - iy0) * s
    const g = grid(w, h)
    g.drawImage(img, gx(vx), gy(vy), vw * s, vh * s)
    const ox = gx(vx) // origin: the viewBox's left edge
    const base = gy(baseVb)
    const paint: Painter = (c, x, baseline, xh) => {
      const k = xh / unit
      c.drawImage(img, x, baseline - (baseVb - vy) * k, vw * k, vh * k)
    }

    // Stroked paths with no fill: the author's own strokes, in order.
    const shapes = Array.from(host.querySelectorAll<SVGGeometryElement>('path, line, polyline, polygon, circle, ellipse, rect'))
    const visible = shapes.filter((el) => {
      const cs = getComputedStyle(el)
      return cs.display !== 'none' && cs.visibility !== 'hidden' && (cs.fill !== 'none' || cs.stroke !== 'none')
    })
    let paths: RawStroke[] | undefined
    if (visible.length && visible.every((el) => getComputedStyle(el).fill === 'none' && getComputedStyle(el).stroke !== 'none')) {
      paths = visible.map((el) => {
        const L = el.getTotalLength()
        const m = el.getCTM()
        const n = Math.max(1, Math.ceil((L * s) / 0.75))
        const pts: Pt[] = []
        for (let i = 0; i <= n; i++) {
          let p = el.getPointAtLength((L * i) / n)
          if (m) p = p.matrixTransform(m)
          // getCTM maps to the host's viewport, which is the viewBox shifted to 0,0.
          pts.push([gx(p.x + vx), gy(p.y + vy)])
        }
        const title = el.getAttribute('data-name') ?? el.querySelector('title')?.textContent ?? undefined
        return { pts, name: title || undefined, dot: L * s < XH * 0.12 }
      })
    }
    return { alpha: alphaOf(g, w, h), w, h, ox, base, paint, paths }
  } finally {
    host.remove()
  }
}

/* ---------- Strokes and timing ---------- */

function smooth(pts: Pt[], r = 3): Pt[] {
  if (pts.length < 5) return pts.slice()
  return pts.map((_, i) => {
    if (i === 0 || i === pts.length - 1) return pts[i]
    let sx = 0, sy = 0, n = 0
    for (let k = Math.max(0, i - r); k <= Math.min(pts.length - 1, i + r); k++) {
      sx += pts[k][0]; sy += pts[k][1]; n++
    }
    return [sx / n, sy / n] as Pt
  })
}

function nameOf(pts: Pt[], dot: boolean, xh: number) {
  if (dot) return 'Dot'
  const [x0, y0] = pts[0]
  const [x1, y1] = pts[pts.length - 1]
  const L = pathLen(pts)
  if (Math.hypot(x1 - x0, y1 - y0) < xh * 0.3 && L > xh * 1.2) return 'Oval'
  const dx = x1 - x0
  const dy = y1 - y0
  const straight = Math.hypot(dx, dy) / (L || 1)
  if (Math.abs(dx) > Math.abs(dy) * 1.6) return straight > 0.85 ? 'Crossbar' : dx > 0 ? 'Curve to the right' : 'Curve to the left'
  if (dy > 0) return straight > 0.85 ? 'Downstroke' : 'Curving downstroke'
  return straight > 0.85 ? 'Upstroke' : 'Curving upstroke'
}

/** Lay a hand's ductus over the grid, fitted to the letter's ink. */
function guideFor(glyph: Glyph, style: Style, d: Drawn): GuideStep[] {
  const k = 1 / Math.tan((style.slant * Math.PI) / 180)
  const steps = glyph.steps.map((st) => ({ name: st.name, dot: st.dot, pts: (st.dot ? st.pts : spline(st.pts, 8)).map(([x, y]) => [x + y * k, y] as Pt) }))
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
  for (const st of steps) for (const [x, y] of st.pts) {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y)
  }
  // Ink bounds on the grid.
  let gx0 = d.w, gx1 = 0, gy0 = d.h, gy1 = 0
  for (let y = 0; y < d.h; y++)
    for (let x = 0; x < d.w; x++)
      if (d.alpha[y * d.w + x] > 100) {
        gx0 = Math.min(gx0, x); gx1 = Math.max(gx1, x); gy0 = Math.min(gy0, y); gy1 = Math.max(gy1, y)
      }
  const clamp = (v: number) => Math.max(0.7, Math.min(1.45, v))
  const sx = clamp((gx1 - gx0) / XH / Math.max(0.2, maxX - minX))
  const sy = clamp((gy1 - gy0) / XH / Math.max(0.2, maxY - minY))
  const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2
  const gcx = (gx0 + gx1) / 2, gcy = (gy0 + gy1) / 2
  return steps.map((st) => ({ ...st, pts: st.pts.map(([x, y]) => [gcx + (x - cx) * sx * XH, gcy - (y - cy) * sy * XH] as Pt) }))
}

function build(d: Drawn, guide?: { glyph: Glyph; style: Style }): Trace {
  const { w, h, alpha } = d
  let raw: RawStroke[]
  let from: Trace['from']
  if (d.paths?.length) {
    raw = d.paths
    from = 'paths'
  } else {
    const img = new Uint8Array(w * h)
    for (let i = 0; i < w * h; i++) img[i] = alpha[i] >= 110 ? 1 : 0
    for (let x = 0; x < w; x++) img[x] = img[(h - 1) * w + x] = 0
    for (let y = 0; y < h; y++) img[y * w] = img[y * w + w - 1] = 0
    const dist = distance(img, w, h)
    thin(img, w, h)
    const graph = toGraph(img, w, h, dist)
    const steps = guide?.glyph.steps.length ? guideFor(guide.glyph, guide.style, d) : undefined
    const plain = orderStrokes(graph, XH)
    raw = plain
    from = 'outline'
    if (steps) {
      // The guide wins unless it found too little of the letter or broke it into more pieces.
      const guided = orderStrokes(graph, XH, steps)
      const total = graph.edges.reduce((s, e) => s + pathLen(e.pts), 0)
      const named = guided.filter((s) => s.name).reduce((s, r) => s + pathLen(r.pts), 0)
      const pieces = (l: RawStroke[]) => l.filter((s) => !s.dot).length
      if (named >= total * 0.55 && pieces(guided) <= Math.max(steps.filter((s) => !s.dot).length + 1, pieces(plain))) {
        raw = guided
        from = 'guided'
      }
    }
  }

  // Reveal times: spread out from each stroke's centre line through the ink.
  const owner = new Int16Array(w * h).fill(-1)
  const at = new Float32Array(w * h)
  const geo = new Float32Array(w * h)
  const qx: number[] = []
  const qy: number[] = []
  raw.forEach((s, k) => {
    let arc = 0
    for (let i = 0; i < s.pts.length; i++) {
      if (i) arc += Math.hypot(s.pts[i][0] - s.pts[i - 1][0], s.pts[i][1] - s.pts[i - 1][1])
      const x = Math.round(s.pts[i][0])
      const y = Math.round(s.pts[i][1])
      if (x < 0 || y < 0 || x >= w || y >= h) continue
      const j = y * w + x
      if (owner[j] >= 0) continue
      owner[j] = k
      at[j] = s.dot ? 0 : arc
      qx.push(x)
      qy.push(y)
    }
  })
  // Also a couple of pixels past the ink, so the edges stay crisp when the mask is scaled up.
  const outside = new Uint8Array(w * h)
  for (let q = 0; q < qx.length; q++) {
    const x = qx[q], y = qy[q], j = y * w + x
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= w || ny >= h) continue
        const k = ny * w + nx
        if (owner[k] >= 0) continue
        const ink = alpha[k] >= 6
        if (!ink && outside[j] >= 2) continue
        outside[k] = ink ? 0 : outside[j] + 1
        owner[k] = owner[j]
        at[k] = at[j]
        geo[k] = geo[j] + (dx && dy ? 1.414 : 1)
        qx.push(nx)
        qy.push(ny)
      }
  }
  // Smooth the borders between strokes: each pixel takes the stroke most of its neighbours have.
  for (let pass = 0; pass < 2; pass++) {
    const prev = owner.slice()
    const count = new Map<number, number>()
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const j = y * w + x
        const o = prev[j]
        if (o < 0) continue
        count.clear()
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) {
            const yy = y + dy, xx = x + dx
            if (yy < 0 || xx < 0 || yy >= h || xx >= w) continue
            const q = prev[yy * w + xx]
            if (q >= 0) count.set(q, (count.get(q) ?? 0) + 1)
          }
        let best = o
        let bc = count.get(o) ?? 0
        for (const [q, c] of count) if (c > bc) {
          best = q
          bc = c
        }
        if (best !== o && !raw[best].dot && !raw[o].dot) {
          owner[j] = best
          // Take the time of the nearest pixel that already belongs to that stroke.
          let bt = Infinity
          for (let dy = -2; dy <= 2; dy++)
            for (let dx = -2; dx <= 2; dx++) {
              const k = (y + dy) * w + (x + dx)
              if (k >= 0 && k < w * h && prev[k] === best) bt = Math.min(bt, at[k])
            }
          if (Number.isFinite(bt)) at[j] = bt
        }
      }
  }

  // The pen's edge: pixels further from the centre line show a moment later.
  const dur = raw.map((s) => (s.dot ? 0 : pathLen(s.pts)))
  for (let j = 0; j < w * h; j++) {
    if (owner[j] < 0 || outside[j]) continue
    at[j] += geo[j] * (raw[owner[j]].dot ? 1 : 0.35)
    dur[owner[j]] = Math.max(dur[owner[j]], at[j])
  }

  const strokes: TraceStroke[] = raw.map((s, k) => {
    const pts = smooth(s.pts)
    const prev = raw[k - 1]
    const join = !!prev && !s.dot && !prev.dot && Math.hypot(prev.pts[prev.pts.length - 1][0] - s.pts[0][0], prev.pts[prev.pts.length - 1][1] - s.pts[0][1]) < XH * 0.08
    return { pts, len: pathLen(pts), dur: Math.max(1, dur[k]), name: s.name ?? nameOf(s.pts, !!s.dot, XH), dot: !!s.dot, join }
  })

  // Ink extent, in x-height units.
  let gx0 = w, gx1 = 0, gy0 = h, gy1 = 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (alpha[y * w + x] > 20) {
        gx0 = Math.min(gx0, x); gx1 = Math.max(gx1, x); gy0 = Math.min(gy0, y); gy1 = Math.max(gy1, y)
      }
  const box = { minX: (gx0 - d.ox) / XH, maxX: (gx1 + 1 - d.ox) / XH, top: (d.base - gy0) / XH, bottom: (d.base - gy1 - 1) / XH }
  return { w, h, xh: XH, ox: d.ox, base: d.base, box, strokes, owner, at, from, paint: d.paint }
}

const cache = new Map<string, Promise<Trace>>()

/**
 * Trace a source. `guide` is the hand's authored ductus for this letter: it
 * sets the order and direction; the shape always comes from the source.
 */
export function traceOf(source: TraceSource, guide?: { glyph: Glyph; style: Style; key: string }): Promise<Trace> {
  const key = source.kind === 'font' ? `f|${source.font}|${source.text}|${guide?.key ?? ''}` : `s|${hash(source.svg)}`
  let hit = cache.get(key)
  if (!hit) {
    hit = (source.kind === 'font' ? drawFont(source.font, source.text) : drawSvg(source.svg)).then((d) => build(d, source.kind === 'font' ? guide : undefined))
    hit.catch(() => cache.delete(key))
    cache.set(key, hit)
  }
  return hit
}

function hash(s: string) {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return (h >>> 0).toString(36) + s.length
}
