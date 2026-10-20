// From a filled letter shape to its centre lines: thin the shape to a
// one-pixel skeleton (Zhang–Suen), measure how far each pixel is from the
// edge, and read the skeleton as a graph of ends, junctions and the lines
// between them. Spurs left by thinning at thick corners are pruned.

export type Pt = [number, number]

export type Graph = {
  w: number
  h: number
  nodes: { x: number; y: number }[]
  /** `a` and `b` are node ids; `pts` runs from a to b in pixel steps. A loop has a === b. */
  edges: { a: number; b: number; pts: Pt[] }[]
  /** Distance to the nearest background pixel, in px. */
  dist: Float32Array
}

const N8: Pt[] = [
  [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1],
]

/** Zhang–Suen thinning, in place on a 0/1 image with a clear one-pixel border. */
export function thin(img: Uint8Array, w: number, h: number) {
  const at = (x: number, y: number) => img[y * w + x]
  const kill: number[] = []
  let changed = true
  while (changed) {
    changed = false
    for (let pass = 0; pass < 2; pass++) {
      kill.length = 0
      for (let y = 1; y < h - 1; y++)
        for (let x = 1; x < w - 1; x++) {
          if (!at(x, y)) continue
          const p = N8.map(([dx, dy]) => at(x + dx, y + dy))
          const b = p.reduce((s, v) => s + v, 0)
          if (b < 2 || b > 6) continue
          let a = 0
          for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++
          if (a !== 1) continue
          // p[0]=N p[2]=E p[4]=S p[6]=W
          if (pass === 0 ? p[0] * p[2] * p[4] || p[2] * p[4] * p[6] : p[0] * p[2] * p[6] || p[0] * p[4] * p[6]) continue
          kill.push(y * w + x)
        }
      if (kill.length) changed = true
      for (const i of kill) img[i] = 0
    }
  }
  // Remove staircase pixels so diagonal runs are one pixel wide.
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      if (!at(x, y)) continue
      const n = at(x, y - 1), e = at(x + 1, y), s = at(x, y + 1), wv = at(x - 1, y)
      const corner = (n && e && !at(x - 1, y + 1)) || (e && s && !at(x - 1, y - 1)) || (s && wv && !at(x + 1, y - 1)) || (wv && n && !at(x + 1, y + 1))
      if (!corner) continue
      // Only remove if it keeps the line connected (crossing number stays 1).
      const p = N8.map(([dx, dy]) => at(x + dx, y + dy))
      let a = 0
      for (let i = 0; i < 8; i++) if (!p[i] && p[(i + 1) % 8]) a++
      const b = p.reduce((q, v) => q + v, 0)
      if (a === 1 && b >= 2 && b <= 3) img[y * w + x] = 0
    }
}

/** Chamfer (3-4) distance to the background, in px. */
export function distance(img: Uint8Array, w: number, h: number) {
  const d = new Float32Array(w * h)
  const BIG = 1e9
  for (let i = 0; i < w * h; i++) d[i] = img[i] ? BIG : 0
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (!d[i]) continue
      let v = d[i]
      if (x > 0) v = Math.min(v, d[i - 1] + 3)
      if (y > 0) {
        v = Math.min(v, d[i - w] + 3)
        if (x > 0) v = Math.min(v, d[i - w - 1] + 4)
        if (x < w - 1) v = Math.min(v, d[i - w + 1] + 4)
      }
      d[i] = v
    }
  for (let y = h - 1; y >= 0; y--)
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x
      if (!d[i]) continue
      let v = d[i]
      if (x < w - 1) v = Math.min(v, d[i + 1] + 3)
      if (y < h - 1) {
        v = Math.min(v, d[i + w] + 3)
        if (x < w - 1) v = Math.min(v, d[i + w + 1] + 4)
        if (x > 0) v = Math.min(v, d[i + w - 1] + 4)
      }
      d[i] = v
    }
  for (let i = 0; i < w * h; i++) d[i] /= 3
  return d
}

const len = (pts: Pt[]) => {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
  return l
}

/** Read a one-pixel skeleton as a graph. */
export function toGraph(sk: Uint8Array, w: number, h: number, dist: Float32Array): Graph {
  const on = (x: number, y: number) => x >= 0 && y >= 0 && x < w && y < h && sk[y * w + x] === 1
  const nbrs = (x: number, y: number): Pt[] => N8.filter(([dx, dy]) => on(x + dx, y + dy)).map(([dx, dy]) => [x + dx, y + dy])
  // Ends have one neighbour; junctions three or more.
  const kind = new Int8Array(w * h) // 0 line, 1 end, 2 junction
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      if (!on(x, y)) continue
      const n = nbrs(x, y).length
      kind[y * w + x] = n <= 1 ? 1 : n >= 3 ? 2 : 0
    }
  // Neighbouring junction pixels form one node.
  const nodeOf = new Int32Array(w * h).fill(-1)
  const nodes: { x: number; y: number }[] = []
  for (let i = 0; i < w * h; i++) {
    if (!sk[i] || kind[i] === 0 || nodeOf[i] >= 0) continue
    const id = nodes.length
    const stack = [i]
    nodeOf[i] = id
    let sx = 0, sy = 0, n = 0
    while (stack.length) {
      const j = stack.pop()!
      const x = j % w, y = (j / w) | 0
      sx += x; sy += y; n++
      if (kind[j] !== 2) continue
      for (const [nx, ny] of nbrs(x, y)) {
        const k = ny * w + nx
        if (kind[k] === 2 && nodeOf[k] < 0) {
          nodeOf[k] = id
          stack.push(k)
        }
      }
    }
    nodes.push({ x: sx / n, y: sy / n })
  }

  const used = new Uint8Array(w * h)
  const edges: Graph['edges'] = []
  const walkFrom = (start: number, first: number) => {
    // start: a node pixel; first: a neighbouring non-node pixel (or another node pixel).
    const a = nodeOf[start]
    const pts: Pt[] = [[nodes[a].x, nodes[a].y]]
    let prev = start
    let cur = first
    for (let guard = 0; guard < w * h; guard++) {
      const cx = cur % w, cy = (cur / w) | 0
      if (nodeOf[cur] >= 0) {
        const b = nodeOf[cur]
        pts.push([nodes[b].x, nodes[b].y])
        return { a, b, pts }
      }
      used[cur] = 1
      pts.push([cx, cy])
      // Next: an unused neighbour, preferring a node, then side neighbours.
      let next = -1
      const cand = nbrs(cx, cy).map(([x, y]) => y * w + x).filter((k) => k !== prev && !used[k])
      const node = cand.find((k) => nodeOf[k] >= 0 && !(nodeOf[k] === a && pts.length < 4))
      if (node !== undefined) next = node
      else {
        const side = cand.filter((k) => nodeOf[k] < 0)
        next = side.find((k) => Math.abs(k - cur) === 1 || Math.abs(k - cur) === w) ?? side[0] ?? -1
      }
      if (next < 0) {
        // Ran into an end without a node (should not happen); close here.
        return { a, b: a, pts, open: true }
      }
      prev = cur
      cur = next
    }
    return null
  }
  for (let i = 0; i < w * h; i++) {
    if (nodeOf[i] < 0) continue
    const x = i % w, y = (i / w) | 0
    for (const [nx, ny] of nbrs(x, y)) {
      const k = ny * w + nx
      if (nodeOf[k] === nodeOf[i]) continue
      if (nodeOf[k] >= 0) {
        // Two nodes touching directly: one short edge, once.
        if (nodeOf[k] > nodeOf[i] && !edges.some((e) => (e.a === nodeOf[i] && e.b === nodeOf[k]) || (e.b === nodeOf[i] && e.a === nodeOf[k])))
          edges.push({ a: nodeOf[i], b: nodeOf[k], pts: [[nodes[nodeOf[i]].x, nodes[nodeOf[i]].y], [nodes[nodeOf[k]].x, nodes[nodeOf[k]].y]] })
        continue
      }
      if (used[k]) continue
      const e = walkFrom(i, k)
      if (e) edges.push({ a: e.a, b: e.b, pts: e.pts })
    }
  }
  // Closed loops with no ends or junctions (an "o"): anchor a node on them.
  for (let i = 0; i < w * h; i++) {
    if (!sk[i] || used[i] || nodeOf[i] >= 0) continue
    const x = i % w, y = (i / w) | 0
    const id = nodes.length
    nodes.push({ x, y })
    nodeOf[i] = id
    const nb = nbrs(x, y).map(([nx, ny]) => ny * w + nx).filter((k) => !used[k])
    if (!nb.length) {
      edges.push({ a: id, b: id, pts: [[x, y]] })
      continue
    }
    const e = walkFrom(i, nb[0])
    if (e) edges.push({ a: id, b: id, pts: e.pts })
  }
  // Single isolated nodes (a tiny dot that thinned to a point).
  nodes.forEach((n, id) => {
    if (!edges.some((e) => e.a === id || e.b === id)) edges.push({ a: id, b: id, pts: [[n.x, n.y]] })
  })

  const g: Graph = { w, h, nodes, edges, dist }
  prune(g)
  return g
}

const degree = (g: Graph, id: number) => g.edges.reduce((n, e) => n + (e.a === id ? 1 : 0) + (e.b === id ? 1 : 0), 0)
const distAt = (g: Graph, x: number, y: number) => g.dist[Math.round(y) * g.w + Math.round(x)] || 0

/** Remove short spurs at thick corners, then join lines through two-way nodes. */
function prune(g: Graph) {
  for (let round = 0; round < 3; round++) {
    let removed = false
    for (let i = g.edges.length - 1; i >= 0; i--) {
      const e = g.edges[i]
      if (e.a === e.b) continue
      const da = degree(g, e.a), db = degree(g, e.b)
      if (!((da === 1 && db >= 3) || (db === 1 && da >= 3))) continue
      const j = da === 1 ? e.b : e.a
      const r = distAt(g, g.nodes[j].x, g.nodes[j].y)
      if (len(e.pts) < Math.max(3, r * 1.6)) {
        g.edges.splice(i, 1)
        removed = true
      }
    }
    mergeThrough(g)
    if (!removed) break
  }
}

function mergeThrough(g: Graph) {
  for (let id = 0; id < g.nodes.length; id++) {
    const inc = g.edges.filter((e) => e.a === id || e.b === id)
    if (inc.length !== 2 || inc[0] === inc[1]) continue
    const [e1, e2] = inc
    if (e1.a === e1.b || e2.a === e2.b) continue
    const p1 = e1.b === id ? e1.pts : e1.pts.slice().reverse() // ends at id
    const p2 = e2.a === id ? e2.pts : e2.pts.slice().reverse() // starts at id
    const a = e1.b === id ? e1.a : e1.b
    const b = e2.a === id ? e2.b : e2.a
    g.edges.splice(g.edges.indexOf(e1), 1)
    g.edges.splice(g.edges.indexOf(e2), 1)
    g.edges.push({ a, b, pts: [...p1, ...p2.slice(1)] })
  }
}

export const pathLen = len
