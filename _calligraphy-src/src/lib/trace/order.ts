// Turning a skeleton graph into strokes a hand would write, in order.
//
// With a guide (the hand's authored ductus, laid over the font's own letter),
// each authored step picks the part of the real letter it runs along, so the
// order and direction come from the teacher and the shape from the font.
// Without one, a plain writing heuristic is used: start at the leftmost free
// end, keep going in the smoothest direction through each junction, write
// closed ovals counterclockwise from the top right, and add dots last.

import { pathLen, type Graph, type Pt } from './skeleton'

export type GuideStep = { pts: Pt[]; name: string; dot?: boolean }
export type RawStroke = { pts: Pt[]; name?: string; dot?: boolean }

type Edge = Graph['edges'][number] & { id: number; done?: boolean }

const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]]
const norm = (v: Pt): Pt => {
  const l = Math.hypot(v[0], v[1]) || 1
  return [v[0] / l, v[1] / l]
}
const angle = (u: Pt, v: Pt) => Math.acos(Math.max(-1, Math.min(1, u[0] * v[0] + u[1] * v[1])))

/** Direction leaving the start of `pts`, over a few pixels. */
const headDir = (pts: Pt[], k = 6): Pt => norm(sub(pts[Math.min(pts.length - 1, k)], pts[0]))
/** Direction arriving at the end of `pts`. */
const tailDir = (pts: Pt[], k = 6): Pt => norm(sub(pts[pts.length - 1], pts[Math.max(0, pts.length - 1 - k)]))

function nearestOnPolyline(p: Pt, line: Pt[], cum: number[]) {
  let best = Infinity
  let at = 0
  for (let i = 0; i < line.length - 1; i++) {
    const a = line[i], b = line[i + 1]
    const ab = sub(b, a)
    const l2 = ab[0] * ab[0] + ab[1] * ab[1] || 1
    const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / l2))
    const q: Pt = [a[0] + ab[0] * t, a[1] + ab[1] * t]
    const d = Math.hypot(p[0] - q[0], p[1] - q[1])
    if (d < best) {
      best = d
      at = cum[i] + t * Math.sqrt(l2)
    }
  }
  if (line.length === 1) best = Math.hypot(p[0] - line[0][0], p[1] - line[0][1])
  return { d: best, s: at }
}

const cumulative = (line: Pt[]) => {
  const c = [0]
  for (let i = 1; i < line.length; i++) c.push(c[i - 1] + Math.hypot(line[i][0] - line[i - 1][0], line[i][1] - line[i - 1][1]))
  return c
}

export function orderStrokes(g: Graph, xh: number, guide?: GuideStep[]): RawStroke[] {
  const edges: Edge[] = g.edges.map((e, id) => ({ ...e, id }))
  const nodes = g.nodes.slice()
  let nextId = edges.length
  const incident = (n: number) => edges.filter((e) => !e.done && (e.a === n || e.b === n))
  const degree = (n: number) => edges.filter((e) => e.a === n || e.b === n).reduce((k, e) => k + (e.a === e.b ? 2 : 1), 0)
  /** The edge's points read from node `from`. */
  const from = (e: Edge, n: number) => (e.a === n ? e.pts : e.pts.slice().reverse())
  const other = (e: Edge, n: number) => (e.a === n ? e.b : e.a)

  // Connected parts of the letter, to find dots and small marks.
  const comp = new Map<number, number>()
  {
    let c = 0
    for (let n = 0; n < nodes.length; n++) {
      if (comp.has(n)) continue
      const stack = [n]
      comp.set(n, c)
      while (stack.length) {
        const m = stack.pop()!
        for (const e of edges)
          for (const [p, q] of [[e.a, e.b], [e.b, e.a]])
            if (p === m && !comp.has(q)) {
              comp.set(q, c)
              stack.push(q)
            }
      }
      c++
    }
  }
  const compOf = (e: Edge) => comp.get(e.a)!
  const compLen = new Map<number, number>()
  for (const e of edges) compLen.set(compOf(e), (compLen.get(compOf(e)) ?? 0) + pathLen(e.pts))
  const maxComp = Math.max(...compLen.values(), 1)
  const isDotComp = (c: number) => (compLen.get(c) ?? 0) < Math.max(xh * 0.35, maxComp * 0.08)

  /** Continue a stroke from node n while a smooth (and, with a guide, matching) way on exists. */
  const extend = (pts: Pt[], n: number, fits?: (cand: Pt[]) => number | null) => {
    for (let guard = 0; guard < 64; guard++) {
      // A crossing often thins into two junctions a pixel or two apart: look through both.
      const here = [n, ...nodes.map((_, m) => m).filter((m) => m !== n && Math.hypot(nodes[m].x - nodes[n].x, nodes[m].y - nodes[n].y) < xh * 0.15)]
      const cands = here.flatMap((m) => incident(m).map((e) => ({ e, at: m })))
      if (!cands.length) return
      const dirIn = tailDir(pts)
      let best: { e: Edge; at: number; cost: number } | null = null
      for (const { e, at } of cands) {
        const p = from(e, at)
        const turn = angle(dirIn, headDir(p))
        let cost = turn
        if (fits) {
          const f = fits(p)
          if (f === null) continue
          cost = f + turn * 0.4
        } else if (turn > (115 * Math.PI) / 180) continue
        if (!best || cost < best.cost) best = { e, at, cost }
      }
      if (!best) return
      const p = from(best.e, best.at)
      best.e.done = true
      pts.push(...(best.at === n ? p.slice(1) : p))
      n = other(best.e, best.at)
    }
  }

  const strokes: (RawStroke & { comp: number; k?: number })[] = []

  // 1. Guided: label every point of the real letter with the authored step it
  //    runs along (near it, and in the same direction), then write each step's
  //    parts in the step's own direction and order.
  if (guide?.length) {
    const fitted = fitGuide(guide, edges.flatMap((e) => e.pts), xh)
    const lines = fitted.map((st) => ({ ...st, cum: cumulative(st.pts) }))
    const K = lines.length
    const tol = xh * 0.85
    type Seg = { k: number; pts: Pt[]; s: number }
    const segs: Seg[] = []
    for (const e of edges.slice()) {
      if (e.done || isDotComp(compOf(e))) continue
      const P = e.pts
      if (P.length < 2) continue
      // Cost of each point under each step (and "none" = K).
      const cost: number[][] = P.map((p, i) => {
        const tan = norm(sub(P[Math.min(P.length - 1, i + 3)], P[Math.max(0, i - 3)]))
        const row = lines.map((ln) => {
          if (ln.dot || ln.pts.length < 2) return Infinity
          const r = nearestOnPolyline(p, ln.pts, ln.cum)
          if (r.d > tol * 1.6) return Infinity
          // Tangent of the step where it is nearest.
          let j = 0
          while (j < ln.cum.length - 2 && ln.cum[j + 1] < r.s) j++
          const lt = norm(sub(ln.pts[j + 1], ln.pts[j]))
          const along = Math.abs(tan[0] * lt[0] + tan[1] * lt[1])
          return r.d / xh + (1 - along) * 0.6
        })
        row.push(tol / xh)
        return row
      })
      // Viterbi along the edge: a change of step costs something, so labels come in clean runs.
      const SWITCH = 0.9
      const n = P.length
      const acc = cost[0].slice()
      const back: Int16Array[] = []
      for (let i = 1; i < n; i++) {
        const bi = new Int16Array(K + 1)
        const next = new Array(K + 1)
        let bestPrev = 0
        for (let k = 1; k <= K; k++) if (acc[k] < acc[bestPrev]) bestPrev = k
        for (let k = 0; k <= K; k++) {
          const stay = acc[k]
          const jump = acc[bestPrev] + SWITCH
          if (stay <= jump) {
            next[k] = stay + cost[i][k] * 0.15
            bi[k] = k
          } else {
            next[k] = jump + cost[i][k] * 0.15
            bi[k] = bestPrev
          }
        }
        back.push(bi)
        for (let k = 0; k <= K; k++) acc[k] = next[k]
      }
      let k = 0
      for (let q = 1; q <= K; q++) if (acc[q] < acc[k]) k = q
      const label = new Int16Array(n)
      for (let i = n - 1; i >= 0; i--) {
        label[i] = k
        if (i > 0) k = back[i - 1][k]
      }
      // Runs of one label become segments, each turned to run the step's way.
      let i0 = 0
      for (let i = 1; i <= n; i++) {
        if (i < n && label[i] === label[i0]) continue
        const lab = label[i0]
        let pts = P.slice(Math.max(0, i0 - (i0 ? 1 : 0)), i)
        if (lab < K && pts.length >= 2) {
          const ln = lines[lab]
          const s0 = nearestOnPolyline(pts[0], ln.pts, ln.cum).s
          const s1 = nearestOnPolyline(pts[pts.length - 1], ln.pts, ln.cum).s
          if (s1 < s0) pts = pts.slice().reverse()
          segs.push({ k: lab, pts, s: Math.min(s0, s1) })
        } else if (pts.length >= 2) {
          // Far from every step: left for the heuristic, as its own little edge.
          const a = nodes.length
          nodes.push({ x: pts[0][0], y: pts[0][1] })
          nodes.push({ x: pts[pts.length - 1][0], y: pts[pts.length - 1][1] })
          comp.set(a, compOf(e))
          comp.set(a + 1, compOf(e))
          edges.push({ id: nextId++, a, b: a + 1, pts })
        }
        i0 = i
      }
      e.done = true
    }
    // Dots: the nearest small mark to each authored dot.
    for (const st of lines) {
      if (!st.dot) continue
      const p = st.pts[0]
      let best: Edge | null = null
      let bd = Infinity
      for (const e of edges) {
        if (e.done || !isDotComp(compOf(e))) continue
        for (const q of e.pts) {
          const d = Math.hypot(q[0] - p[0], q[1] - p[1])
          if (d < bd) {
            bd = d
            best = e
          }
        }
      }
      if (best && bd < xh * 1.5) {
        const c = compOf(best)
        const pts: Pt[] = []
        for (const e of edges) if (!e.done && compOf(e) === c) {
          pts.push(...e.pts)
          e.done = true
        }
        strokes.push({ pts, name: st.name, dot: true, comp: c, k: lines.indexOf(st) })
      }
    }
    // Each step: its segments in the step's order, joined where they meet.
    for (let k = 0; k < K; k++) {
      if (lines[k].dot) continue
      const mine = segs.filter((g) => g.k === k).sort((a, b) => a.s - b.s)
      const min = xh * 0.12
      let cur: Pt[] | null = null
      const flush = () => {
        if (cur && pathLen(cur) >= min) strokes.push({ pts: cur, name: lines[k].name, comp: 0, k })
        cur = null
      }
      for (const g of mine) {
        if (cur) {
          const end = cur[cur.length - 1]
          const gap = Math.hypot(end[0] - g.pts[0][0], end[1] - g.pts[0][1])
          if (gap < xh * 0.35) {
            cur.push(...g.pts)
            continue
          }
          flush()
        }
        cur = g.pts.slice()
      }
      flush()
    }
    strokes.sort((a, b) => (a.k ?? 0) - (b.k ?? 0))
  }

  // 2. Whatever is left: the plain heuristic.
  const leftover: (RawStroke & { comp: number })[] = []
  for (let guard = 0; guard < 200; guard++) {
    const open = edges.filter((e) => !e.done)
    if (!open.length) break
    // Prefer free ends, leftmost and a little toward the top.
    let start: { e: Edge; n: number; key: number } | null = null
    for (const e of open) {
      if (e.a === e.b) continue
      for (const n of [e.a, e.b]) {
        const free = degree(n) === 1
        // A straight bar hanging off the letter (a t or f crossbar) waits for the stroke it crosses.
        const [p0, p1] = [e.pts[0], e.pts[e.pts.length - 1]]
        const dx = Math.abs(p1[0] - p0[0]), dy = Math.abs(p1[1] - p0[1])
        const bar = degree(e.a) + degree(e.b) > 2 && dy < dx * 0.3 && Math.hypot(dx, dy) > pathLen(e.pts) * 0.9
        const key = nodes[n].x + nodes[n].y * 0.25 - (free ? 1e6 : 0) + (bar ? 5e5 : 0)
        if (!start || key < start.key) start = { e, n, key }
      }
    }
    let pts: Pt[]
    let c: number
    if (start) {
      const { e, n } = start
      e.done = true
      pts = from(e, n).slice()
      c = compOf(e)
      extend(pts, other(e, n))
    } else {
      // Only closed loops remain: write each counterclockwise from the top right.
      const e = open[0]
      e.done = true
      c = compOf(e)
      const cx = e.pts.reduce((s, p) => s + p[0], 0) / e.pts.length
      const cy = e.pts.reduce((s, p) => s + p[1], 0) / e.pts.length
      let k = 0
      let bk = -Infinity
      e.pts.forEach((p, i) => {
        const score = (p[0] - cx) * 0.5 + (cy - p[1]) * 0.87
        if (score > bk) {
          bk = score
          k = i
        }
      })
      let ring = [...e.pts.slice(k), ...e.pts.slice(1, k + 1)]
      let area = 0
      for (let i = 0; i < ring.length - 1; i++) area += ring[i][0] * ring[i + 1][1] - ring[i + 1][0] * ring[i][1]
      if (area > 0) ring = ring.slice().reverse() // y points down: positive area is clockwise on screen
      pts = ring
    }
    if (pts.length === 1 || isDotComp(c)) {
      // A mark too small to be a stroke of its own: a dot.
      for (const e of edges) if (!e.done && compOf(e) === c) {
        pts.push(...e.pts)
        e.done = true
      }
      leftover.push({ pts, dot: true, comp: c })
      continue
    }
    // Short bits beside strokes already written: the reveal covers them from their neighbours.
    if (strokes.length + leftover.length > 0 && pathLen(pts) < xh * (guide?.length ? 0.55 : 0.3)) continue
    leftover.push({ pts, comp: c })
  }

  // Leftovers go right after the stroke they touch, if any; dots and the rest after everything.
  const out = strokes.slice()
  const touch = (a: Pt[], b: Pt[]) => {
    const r = Math.max(2.5, xh * 0.06)
    for (const p of [a[0], a[a.length - 1]]) for (const q of b) if (Math.hypot(p[0] - q[0], p[1] - q[1]) <= r) return true
    return false
  }
  const tail: typeof out = []
  for (const s of leftover) {
    if (s.dot || !out.length) {
      tail.push(s)
      continue
    }
    let at = -1
    for (let k = out.length - 1; k >= 0; k--) if (!out[k].dot && touch(s.pts, out[k].pts)) {
      at = k
      break
    }
    if (at >= 0) out.splice(at + 1, 0, s)
    else tail.push(s)
  }
  // Without a guide: parts in reading order, dots after the part they belong to.
  const final = [...out, ...tail]
  if (!guide?.length) {
    const minX = (s: RawStroke) => Math.min(...s.pts.map((p) => p[0]))
    const main = final.filter((s) => !s.dot)
    const dots = final.filter((s) => s.dot)
    const parts = new Map<number, typeof final>()
    for (const s of main) parts.set(s.comp, [...(parts.get(s.comp) ?? []), s])
    const ordered = [...parts.values()].sort((a, b) => minX(a[0]) - minX(b[0])).flat()
    for (const d of dots.sort((a, b) => minX(a) - minX(b))) {
      // After the last stroke that sits under or beside the dot.
      const dx = minX(d)
      let at = ordered.length
      for (let k = ordered.length - 1; k >= 0; k--) if (minX(ordered[k]) <= dx + xh * 0.3) {
        at = k + 1
        break
      }
      ordered.splice(at, 0, d)
    }
    return mergeRuns(ordered, xh)
  }
  return mergeRuns(final, xh)
}

/** Join a stroke onto the one before when the pen simply carries on (same step, or an unnamed piece). */
function mergeRuns(list: RawStroke[], xh: number): RawStroke[] {
  const out: RawStroke[] = []
  for (const s of list) {
    const prev = out[out.length - 1]
    if (prev && !prev.dot && !s.dot && (prev.name === s.name || !s.name || !prev.name)) {
      const a = prev.pts[prev.pts.length - 1]
      const b = s.pts[0]
      if (Math.hypot(a[0] - b[0], a[1] - b[1]) < xh * 0.12) {
        out[out.length - 1] = { ...prev, name: prev.name ?? s.name, pts: [...prev.pts, ...s.pts.slice(1)] }
        continue
      }
    }
    out.push(s)
  }
  // Tiny pieces beside a real stroke: let that stroke's reveal cover them.
  const near = (a: Pt[], b: Pt[]) => {
    const r = xh * 0.15
    for (const p of [a[0], a[a.length - 1]]) for (const q of b) if (Math.hypot(p[0] - q[0], p[1] - q[1]) < r) return true
    return false
  }
  return out.filter((s, i) => s.dot || out.length < 2 || pathLen(s.pts) >= xh * 0.45 || !out.some((o, j) => j !== i && !o.dot && pathLen(o.pts) >= xh * 0.45 && near(s.pts, o.pts)))
}

/**
 * Fit the authored steps onto the letter's centre lines: a few rounds of
 * matching each step point to its nearest skeleton point, then solving
 * x' = a·x + c·y + b and y' = d·y + e by least squares (scale, slant, shift).
 */
function fitGuide(guide: GuideStep[], skel: Pt[], xh: number): GuideStep[] {
  if (skel.length < 8) return guide
  let cur = guide
  for (let round = 0; round < 4; round++) {
    const src: Pt[] = []
    const dst: Pt[] = []
    const all = cur.flatMap((st) => st.pts)
    const orig = guide.flatMap((st) => st.pts)
    all.forEach((p, i) => {
      let bd = Infinity
      let bq = skel[0]
      for (let j = 0; j < skel.length; j += 2) {
        const q = skel[j]
        const d = (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2
        if (d < bd) {
          bd = d
          bq = q
        }
      }
      if (Math.sqrt(bd) < xh * 1.2) {
        src.push(orig[i])
        dst.push(bq)
      }
    })
    if (src.length < 6) break
    // Solve the two small least-squares systems.
    const solve3 = (rows: number[][], rhs: number[]) => {
      const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
      const B = [0, 0, 0]
      rows.forEach((r, i) => {
        for (let a = 0; a < 3; a++) {
          B[a] += r[a] * rhs[i]
          for (let b = 0; b < 3; b++) A[a][b] += r[a] * r[b]
        }
      })
      for (let a = 0; a < 3; a++) A[a][a] += 1e-6
      // Gaussian elimination.
      for (let c = 0; c < 3; c++) {
        let p = c
        for (let r = c + 1; r < 3; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r
        ;[A[c], A[p]] = [A[p], A[c]]
        ;[B[c], B[p]] = [B[p], B[c]]
        for (let r = 0; r < 3; r++) {
          if (r === c) continue
          const f = A[r][c] / A[c][c]
          for (let k = c; k < 3; k++) A[r][k] -= f * A[c][k]
          B[r] -= f * B[c]
        }
      }
      return B.map((v, i) => v / A[i][i])
    }
    const [a, c, b] = solve3(src.map(([x, y]) => [x, y, 1]), dst.map((q) => q[0]))
    const [d, , e] = solve3(src.map(([, y]) => [y, 0, 1]), dst.map((q) => q[1]))
    // Keep the fit sane: it may stretch and lean a little, never fold.
    const ok = (v: number, lo: number, hi: number) => Number.isFinite(v) && v > lo && v < hi
    const sx0 = spanX(guide), sy0 = spanY(guide)
    const A1 = a, D1 = d
    if (!ok(A1, 0.6, 1.6) || !ok(D1, 0.6, 1.6) || !ok(c / (sy0 / sx0 || 1), -0.8, 0.8)) break
    cur = guide.map((st) => ({ ...st, pts: st.pts.map(([x, y]) => [a * x + c * y + b, d * y + e] as Pt) }))
  }
  return cur
}

const spanX = (g: GuideStep[]) => {
  const xs = g.flatMap((s) => s.pts.map((p) => p[0]))
  return Math.max(...xs) - Math.min(...xs) || 1
}
const spanY = (g: GuideStep[]) => {
  const ys = g.flatMap((s) => s.pts.map((p) => p[1]))
  return Math.max(...ys) - Math.min(...ys) || 1
}
