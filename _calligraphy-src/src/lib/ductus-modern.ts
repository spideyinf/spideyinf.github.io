// Stroke data for the modern hands: Modern print and Italic.
// Same conventions as ductus.ts: upright x-height units, baseline y = 0,
// waistline y = 1; each step is one pen movement, `join` = pen keeps moving.

import type { Glyph, P, Step } from './ductus'

const s = (name: string, pts: P[], join = false): Step => ({ name, pts, join })
const dot = (x: number, y: number): Step => ({ name: 'Dot', pts: [[x, y]], dot: true })
const line = (name: string, a: P, b: P, join = false) => s(name, [a, b], join)

/** Points on an ellipse from angle a0 to a1 (degrees, counterclockwise is increasing, y up). */
function arc(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 12): P[] {
  const out: P[] = []
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180
    out.push([+(cx + rx * Math.cos(a)).toFixed(3), +(cy + ry * Math.sin(a)).toFixed(3)])
  }
  return out
}

/* ---------------- Modern print: upright, monoline, ball and stick ---------------- */

const CAP = 1.75 // capital height
const ASC = 1.8 // ascender height
const DESC = -0.8

const circle = (cx: number) => arc(cx, 0.5, 0.4, 0.5, 40, 400, 16)
const archFrom = (x: number, w = 0.75, down = true): P[] => [
  [x, 0.6],
  [x + w * 0.25, 0.94],
  [x + w * 0.55, 1.0],
  [x + w * 0.9, 0.86],
  [x + w, 0.55],
  ...(down ? ([[x + w, 0]] as P[]) : []),
]

export const PRINT_LOWERCASE: Record<string, Glyph> = {
  a: { steps: [s('Circle', circle(0.45)), line('Stick', [0.85, 1], [0.85, 0])] },
  b: { steps: [line('Tall stick', [0.1, ASC], [0.1, 0]), s('Bowl', arc(0.52, 0.5, 0.42, 0.5, 168, -180, 16))] },
  c: { steps: [s('Curve', arc(0.5, 0.5, 0.42, 0.5, 45, 315, 14))] },
  d: { steps: [s('Circle', circle(0.45)), line('Tall stick', [0.85, ASC], [0.85, 0])] },
  e: { steps: [line('Line', [0.08, 0.5], [0.92, 0.5]), s('Curve', arc(0.5, 0.5, 0.42, 0.5, 0, 320, 16), true)] },
  f: { steps: [s('Hook and stem', [[0.85, 1.62], [0.65, 1.8], [0.45, 1.72], [0.37, 1.35], [0.37, 0]]), line('Crossbar', [0.08, 1], [0.7, 1])] },
  g: { steps: [s('Circle', circle(0.45)), s('Stick and hook', [[0.85, 1], [0.85, -0.45], [0.72, -0.75], [0.42, -0.82], [0.15, -0.66]])] },
  h: { steps: [line('Tall stick', [0.1, ASC], [0.1, 0]), s('Arch', archFrom(0.1))] },
  i: { steps: [line('Stick', [0.3, 1], [0.3, 0]), dot(0.3, 1.45)] },
  j: { steps: [s('Stick and hook', [[0.55, 1], [0.55, -0.5], [0.42, -0.78], [0.15, -0.72]]), dot(0.55, 1.45)] },
  k: { steps: [line('Tall stick', [0.1, ASC], [0.1, 0]), line('Arm', [0.75, 1], [0.1, 0.42]), line('Leg', [0.36, 0.62], [0.8, 0])] },
  l: { steps: [line('Tall stick', [0.2, ASC], [0.2, 0])] },
  m: { steps: [line('Stick', [0.1, 1], [0.1, 0]), s('First arch', archFrom(0.1, 0.55)), s('Second arch', archFrom(0.65, 0.55))] },
  n: { steps: [line('Stick', [0.1, 1], [0.1, 0]), s('Arch', archFrom(0.1))] },
  o: { steps: [s('Circle', arc(0.48, 0.5, 0.42, 0.5, 80, 440, 18))] },
  p: { steps: [line('Long stick', [0.1, 1], [0.1, DESC]), s('Bowl', arc(0.52, 0.5, 0.42, 0.5, 168, -180, 16))] },
  q: { steps: [s('Circle', circle(0.45)), s('Long stick', [[0.85, 1], [0.85, DESC], [1.0, -0.66]])] },
  r: { steps: [line('Stick', [0.1, 1], [0.1, 0]), s('Shoulder', [[0.1, 0.6], [0.3, 0.92], [0.55, 1.0], [0.75, 0.9]])] },
  s: { steps: [s('S curve', [[0.8, 0.85], [0.55, 1.0], [0.25, 0.95], [0.12, 0.75], [0.3, 0.55], [0.7, 0.45], [0.88, 0.25], [0.7, 0.03], [0.4, 0.0], [0.1, 0.15]])] },
  t: { steps: [s('Stick and turn', [[0.35, 1.5], [0.35, 0.18], [0.46, 0.0], [0.66, 0.05]]), line('Crossbar', [0.08, 1], [0.7, 1])] },
  u: { steps: [s('Cup', [[0.1, 1], [0.1, 0.35], [0.25, 0.05], [0.5, 0.0], [0.72, 0.15], [0.85, 0.45]]), line('Stick', [0.85, 1], [0.85, 0])] },
  v: { steps: [line('Down', [0.05, 1], [0.45, 0]), line('Up', [0.45, 0], [0.85, 1], true)] },
  w: {
    steps: [line('Down', [0.05, 1], [0.3, 0]), line('Up', [0.3, 0], [0.55, 0.78], true), line('Down', [0.55, 0.78], [0.8, 0], true), line('Up', [0.8, 0], [1.05, 1], true)],
  },
  x: { steps: [line('Down right', [0.1, 1], [0.8, 0]), line('Down left', [0.8, 1], [0.1, 0])] },
  y: { steps: [line('Short down', [0.1, 1], [0.48, 0.08]), line('Long down', [0.86, 1], [0.2, DESC])] },
  z: { steps: [line('Top', [0.1, 1], [0.85, 1]), line('Diagonal', [0.85, 1], [0.1, 0], true), line('Base', [0.1, 0], [0.88, 0], true)] },
}

const o = (cx: number) => arc(cx, CAP / 2, 0.8, CAP / 2, 95, 455, 22)

export const PRINT_CAPITALS: Record<string, Glyph> = {
  A: { steps: [line('Left side', [0.6, CAP], [0, 0]), line('Right side', [0.6, CAP], [1.2, 0]), line('Crossbar', [0.25, 0.7], [0.95, 0.7])] },
  B: {
    steps: [
      line('Stem', [0.1, CAP], [0.1, 0]),
      s('Top bump', [[0.1, CAP], [0.7, CAP], [0.95, 1.55], [0.95, 1.15], [0.7, 0.92], [0.1, 0.9]]),
      s('Bottom bump', [[0.1, 0.9], [0.8, 0.9], [1.05, 0.65], [1.05, 0.25], [0.8, 0.0], [0.1, 0]], true),
    ],
  },
  C: { steps: [s('Curve', arc(0.85, CAP / 2, 0.8, CAP / 2, 50, 310, 20))] },
  D: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), s('Bowl', [[0.1, CAP], [0.6, CAP], [1.05, 1.4], [1.15, 0.875], [1.05, 0.35], [0.6, 0], [0.1, 0]])] },
  E: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), line('Top', [0.1, CAP], [0.95, CAP]), line('Middle', [0.1, 0.9], [0.8, 0.9]), line('Base', [0.1, 0], [0.95, 0])] },
  F: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), line('Top', [0.1, CAP], [0.95, CAP]), line('Middle', [0.1, 0.9], [0.8, 0.9])] },
  G: { steps: [s('Curve', arc(0.85, CAP / 2, 0.8, CAP / 2, 50, 345, 20)), s('Bar', [[1.62, 0.65], [1.62, 0.8], [1.05, 0.8]], true)] },
  H: { steps: [line('Left stem', [0.1, CAP], [0.1, 0]), line('Right stem', [1.1, CAP], [1.1, 0]), line('Bar', [0.1, 0.9], [1.1, 0.9])] },
  I: { steps: [line('Stem', [0.3, CAP], [0.3, 0])] },
  J: { steps: [s('Stem and hook', [[0.9, CAP], [0.9, 0.45], [0.75, 0.08], [0.45, 0.0], [0.15, 0.15], [0.05, 0.4]])] },
  K: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), line('Arm', [1.0, CAP], [0.1, 0.75]), line('Leg', [0.45, 1.05], [1.05, 0])] },
  L: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), line('Base', [0.1, 0], [0.9, 0], true)] },
  M: {
    steps: [line('Up', [0.1, 0], [0.1, CAP]), line('Down', [0.1, CAP], [0.7, 0.45], true), line('Up', [0.7, 0.45], [1.3, CAP], true), line('Down', [1.3, CAP], [1.3, 0], true)],
  },
  N: { steps: [line('Up', [0.1, 0], [0.1, CAP]), line('Diagonal', [0.1, CAP], [1.1, 0], true), line('Up', [1.1, 0], [1.1, CAP], true)] },
  O: { steps: [s('Oval', o(0.85))] },
  P: { steps: [line('Stem', [0.1, CAP], [0.1, 0]), s('Bowl', [[0.1, CAP], [0.75, CAP], [1.0, 1.55], [1.0, 1.1], [0.75, 0.85], [0.1, 0.85]])] },
  Q: { steps: [s('Oval', o(0.85)), line('Tail', [0.95, 0.35], [1.55, -0.15])] },
  R: {
    steps: [
      line('Stem', [0.1, CAP], [0.1, 0]),
      s('Bowl', [[0.1, CAP], [0.75, CAP], [1.0, 1.55], [1.0, 1.1], [0.75, 0.85], [0.1, 0.85]]),
      line('Leg', [0.55, 0.85], [1.05, 0]),
    ],
  },
  S: { steps: [s('S curve', [[1.0, 1.5], [0.7, CAP], [0.3, 1.68], [0.12, 1.4], [0.35, 1.0], [0.85, 0.8], [1.05, 0.45], [0.85, 0.05], [0.45, 0.0], [0.08, 0.25]])] },
  T: { steps: [line('Top', [0, CAP], [1.1, CAP]), line('Stem', [0.55, CAP], [0.55, 0])] },
  U: { steps: [s('Cup', [[0.1, CAP], [0.1, 0.5], [0.3, 0.07], [0.6, 0.0], [0.9, 0.07], [1.1, 0.5], [1.1, CAP]])] },
  V: { steps: [line('Down', [0, CAP], [0.6, 0]), line('Up', [0.6, 0], [1.2, CAP], true)] },
  W: {
    steps: [line('Down', [0, CAP], [0.4, 0]), line('Up', [0.4, 0], [0.8, 1.3], true), line('Down', [0.8, 1.3], [1.2, 0], true), line('Up', [1.2, 0], [1.6, CAP], true)],
  },
  X: { steps: [line('Down right', [0.05, CAP], [1.1, 0]), line('Down left', [1.1, CAP], [0.05, 0])] },
  Y: { steps: [line('Left arm', [0, CAP], [0.6, 0.85]), line('Right arm', [1.2, CAP], [0.6, 0.85]), line('Stem', [0.6, 0.85], [0.6, 0], true)] },
  Z: { steps: [line('Top', [0.1, CAP], [1.1, CAP]), line('Diagonal', [1.1, CAP], [0.1, 0], true), line('Base', [0.1, 0], [1.1, 0], true)] },
}

/* ---------------- Italic: oval, branching, written with a broad edge ---------------- */

const IASC = 1.7
const IDESC = -0.75

// The italic bowl (a, d, g, q): from the top right, counterclockwise into a pointed oval.
const ibowl: P[] = [[0.55, 0.88], [0.32, 1.0], [0.08, 0.78], [0.02, 0.35], [0.15, 0.03], [0.38, 0.08], [0.58, 0.45], [0.62, 1.0]]
const iexit = (x: number): P[] => [[x, 0.15], [x + 0.08, 0.0], [x + 0.25, 0.1]]
// Branching arch (h, m, n, r): springs from inside the stem, rises, and comes straight down.
const ibranch = (x: number, w = 0.55, exit = true): P[] => [
  [x + 0.01, 0.5],
  [x + w * 0.3, 0.88],
  [x + w * 0.62, 1.0],
  [x + w * 0.92, 0.85],
  [x + w * 0.95, 0.4],
  ...(exit ? iexit(x + w * 0.95) : ([[x + w * 0.93, 0]] as P[])),
]

export const ITALIC_LOWERCASE: Record<string, Glyph> = {
  a: { steps: [s('Bowl', ibowl), s('Stem and exit', [[0.62, 1.0], ...iexit(0.6)], true)] },
  b: { steps: [line('Ascender', [0.12, IASC], [0.08, 0.05]), s('Branch and bowl', [[0.1, 0.35], [0.3, 0.85], [0.55, 1.0], [0.72, 0.8], [0.68, 0.3], [0.45, 0.02], [0.12, 0.08]])] },
  c: { steps: [s('Curve', [[0.6, 0.85], [0.38, 1.0], [0.12, 0.78], [0.05, 0.35], [0.18, 0.03], [0.45, 0.03], [0.62, 0.2]])] },
  d: { steps: [s('Bowl', ibowl), line('Up', [0.62, 1.0], [0.66, IASC], true), s('Stem and exit', [[0.66, IASC], ...iexit(0.6)], true)] },
  e: { steps: [s('Loop and curve', [[0.1, 0.45], [0.55, 0.62], [0.6, 0.88], [0.38, 1.0], [0.12, 0.78], [0.05, 0.35], [0.18, 0.03], [0.45, 0.03], [0.65, 0.2]])] },
  f: { steps: [s('Hook and stem', [[0.78, 1.58], [0.58, 1.72], [0.4, 1.55], [0.33, 1.0], [0.28, 0.0], [0.23, -0.55], [0.08, -0.75], [-0.08, -0.65]]), line('Crossbar', [0.05, 1.0], [0.6, 1.0])] },
  g: { steps: [s('Bowl', ibowl), s('Descender', [[0.62, 1.0], [0.6, 0.0], [0.55, -0.55], [0.35, -0.78], [0.08, -0.7]], true)] },
  h: { steps: [line('Ascender', [0.12, IASC], [0.08, 0]), s('Branch and exit', ibranch(0.08))] },
  i: { steps: [s('Stem and exit', [[0.1, 0.9], [0.24, 1.0], [0.24, 0.15], [0.32, 0.0], [0.5, 0.1]]), dot(0.28, 1.38)] },
  j: { steps: [s('Stem and hook', [[0.1, 0.9], [0.24, 1.0], [0.24, 0.0], [0.2, -0.55], [0.05, -0.78], [-0.15, -0.68]]), dot(0.28, 1.38)] },
  k: {
    steps: [
      line('Ascender', [0.12, IASC], [0.08, 0]),
      s('Branch and loop', [[0.1, 0.45], [0.3, 0.88], [0.52, 1.0], [0.62, 0.8], [0.42, 0.55], [0.15, 0.5]]),
      s('Leg', [[0.35, 0.55], [0.52, 0.2], [0.62, 0.0], [0.8, 0.1]]),
    ],
  },
  l: { steps: [s('Ascender and exit', [[0.12, IASC], [0.1, 0.15], [0.18, 0.0], [0.36, 0.1]])] },
  m: { steps: [line('Stem', [0.08, 1.0], [0.06, 0]), s('First branch', ibranch(0.06, 0.46, false)), s('Second branch and exit', ibranch(0.5, 0.46))] },
  n: { steps: [line('Stem', [0.08, 1.0], [0.06, 0]), s('Branch and exit', ibranch(0.06))] },
  o: { steps: [s('Oval', [[0.55, 0.9], [0.33, 1.0], [0.1, 0.78], [0.03, 0.35], [0.15, 0.03], [0.38, 0.0], [0.58, 0.25], [0.62, 0.65], [0.55, 0.9]])] },
  p: {
    steps: [
      s('Long stem', [[0.04, 0.85], [0.17, 1.0], [0.16, IDESC]]),
      s('Bowl', [[0.17, 0.5], [0.35, 0.88], [0.55, 1.0], [0.72, 0.78], [0.68, 0.3], [0.45, 0.02], [0.18, 0.1]]),
    ],
  },
  q: { steps: [s('Bowl', ibowl), s('Long stem', [[0.62, 1.0], [0.58, IDESC], [0.74, -0.6]], true)] },
  r: { steps: [line('Stem', [0.08, 1.0], [0.06, 0]), s('Branch', [[0.07, 0.5], [0.22, 0.88], [0.42, 1.0], [0.6, 0.9]])] },
  s: { steps: [s('S curve', [[0.55, 0.88], [0.35, 1.0], [0.12, 0.85], [0.15, 0.62], [0.45, 0.45], [0.58, 0.2], [0.4, 0.0], [0.12, 0.05], [0.02, 0.18]])] },
  t: { steps: [s('Stem and exit', [[0.25, 1.42], [0.22, 0.15], [0.3, 0.0], [0.5, 0.1]]), line('Crossbar', [0.02, 1.0], [0.55, 1.0])] },
  u: {
    steps: [
      s('Cup', [[0.04, 0.9], [0.14, 1.0], [0.12, 0.3], [0.22, 0.03], [0.4, 0.02], [0.6, 0.4], [0.62, 1.0]]),
      s('Stem and exit', [[0.62, 1.0], ...iexit(0.6)], true),
    ],
  },
  v: { steps: [s('Down', [[0.0, 0.9], [0.12, 1.0], [0.32, 0.0]]), s('Up', [[0.32, 0.0], [0.55, 0.65], [0.66, 1.0]], true)] },
  w: {
    steps: [
      s('Down', [[0.0, 0.9], [0.12, 1.0], [0.3, 0.0]]),
      line('Up', [0.3, 0.0], [0.48, 0.72], true),
      line('Down', [0.48, 0.72], [0.64, 0.0], true),
      line('Up', [0.64, 0.0], [0.86, 1.0], true),
    ],
  },
  x: { steps: [s('Down right', [[0.0, 0.9], [0.15, 1.0], [0.55, 0.0], [0.7, 0.06]]), line('Down left', [0.66, 1.0], [0.05, 0.0])] },
  y: {
    steps: [
      s('Cup', [[0.04, 0.9], [0.14, 1.0], [0.12, 0.3], [0.22, 0.03], [0.4, 0.02], [0.6, 0.4], [0.62, 1.0]]),
      s('Descender', [[0.62, 1.0], [0.6, 0.0], [0.55, -0.55], [0.35, -0.78], [0.08, -0.7]], true),
    ],
  },
  z: { steps: [line('Top', [0.05, 1.0], [0.62, 1.0]), line('Diagonal', [0.62, 1.0], [0.05, 0.0], true), line('Base', [0.05, 0.0], [0.66, 0.0], true)] },
}

/** Italic capitals: the print capitals, a little smaller, written with the broad edge. */
const scale = (g: Glyph, k: number): Glyph => ({
  steps: g.steps.map((st) => ({ ...st, pts: st.pts.map(([x, y]) => [+(x * k).toFixed(3), +(y * k).toFixed(3)] as P) })),
})
export const ITALIC_CAPITALS: Record<string, Glyph> = Object.fromEntries(
  Object.entries(PRINT_CAPITALS).map(([ch, g]) => [ch, scale(g, 1.6 / CAP)]),
)
