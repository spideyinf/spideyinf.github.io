// Ductus: how each letter is written, stroke by stroke.
//
// Letters are authored upright in x-height units (baseline y = 0, waistline
// y = 1, capitals and ascenders reach y ≈ 2, descenders y ≈ -1) and slanted
// to 55° when drawn. Each step is one pen movement; `join` means the pen
// keeps moving from the previous step without lifting.

export type P = [number, number]
export type Step = { name: string; pts: P[]; join?: boolean; dot?: boolean }
export type Glyph = { steps: Step[] }

const s = (name: string, pts: P[], join = false): Step => ({ name, pts, join })
const dot = (x: number, y: number): Step => ({ name: 'Dot', pts: [[x, y]], dot: true })

/* ---------- Copperplate capitals ---------- */

// The capital stem: a shaded compound curve that ends in a small oval at the baseline.
const capStem = (x: number, top = 1.95): P[] => [
  [x + 0.05, top],
  [x, top - 0.6],
  [x - 0.08, 0.7],
  [x - 0.22, 0.12],
  [x - 0.5, -0.02],
  [x - 0.72, 0.1],
  [x - 0.62, 0.3],
  [x - 0.32, 0.22],
]

const leadIn = (x: number): P[] => [
  [x - 0.45, 1.35],
  [x - 0.2, 1.85],
  [x + 0.1, 2.0],
  [x + 0.25, 1.82],
]

export const CAPITALS: Record<string, Glyph> = {
  A: {
    steps: [
      s('Hairline upstroke', [[-0.1, 0.15], [0.1, 0.05], [0.45, 0.7], [0.8, 1.45], [1.05, 2.0]]),
      s('Shaded stem', [[1.05, 2.0], [1.08, 1.2], [1.12, 0.25], [1.25, 0.0], [1.45, 0.12], [1.55, 0.3]], true),
      s('Crossbar', [[0.35, 0.8], [0.8, 0.95], [1.35, 0.95], [1.6, 0.85]]),
    ],
  },
  B: {
    steps: [
      s('Shaded stem', capStem(0.75)),
      s('Upper bowl', [[0.55, 1.55], [0.75, 1.95], [1.25, 2.05], [1.55, 1.8], [1.4, 1.3], [0.95, 1.08], [0.8, 1.15], [0.95, 1.12]]),
      s('Lower bowl', [[0.95, 1.12], [1.5, 0.95], [1.65, 0.45], [1.35, 0.06], [0.85, 0.0], [0.5, 0.12]], true),
    ],
  },
  C: {
    steps: [
      s('Entry loop', [[1.2, 1.55], [1.42, 1.85], [1.2, 2.05], [0.75, 1.95]]),
      s('Shaded oval side', [[0.75, 1.95], [0.3, 1.55], [0.1, 0.9], [0.22, 0.25], [0.6, 0.0]], true),
      s('Hairline finish', [[0.6, 0.0], [1.05, 0.08], [1.35, 0.4]], true),
    ],
  },
  D: {
    steps: [
      s('Shaded stem', [[0.85, 1.95], [0.8, 1.2], [0.7, 0.45], [0.5, 0.08], [0.2, 0.0], [0.05, 0.15], [0.25, 0.28]]),
      s('Base loop', [[0.25, 0.28], [0.6, 0.18], [1.1, 0.0], [1.55, 0.2]], true),
      s('Bowl', [[1.55, 0.2], [1.85, 0.8], [1.8, 1.6], [1.35, 2.02], [0.75, 2.0], [0.4, 1.75]], true),
    ],
  },
  E: {
    steps: [
      s('Top curve', [[1.5, 1.62], [1.42, 2.0], [0.95, 2.1], [0.55, 1.85], [0.55, 1.4], [0.95, 1.15], [1.1, 1.26], [0.85, 1.16]]),
      s('Lower oval', [[0.8, 1.16], [0.3, 0.98], [0.05, 0.48], [0.32, 0.0], [0.95, 0.0], [1.38, 0.38]], true),
    ],
  },
  F: {
    steps: [
      s('Cap stroke', [[0.2, 1.7], [0.45, 2.0], [1.0, 1.88], [1.45, 1.98], [1.85, 2.08]]),
      s('Shaded stem', capStem(1.05, 1.9)),
      s('Crossbar', [[0.55, 1.0], [0.95, 1.08], [1.35, 1.02]]),
    ],
  },
  G: {
    steps: [
      s('Entry loop', [[1.2, 1.55], [1.42, 1.85], [1.2, 2.05], [0.75, 1.95]]),
      s('Shaded oval side', [[0.75, 1.95], [0.3, 1.55], [0.1, 0.9], [0.22, 0.25], [0.6, 0.0]], true),
      s('Hairline turn', [[0.6, 0.0], [1.05, 0.15], [1.3, 0.7], [1.4, 1.1]], true),
      s('Shaded stem', [[1.4, 1.1], [1.32, 0.3], [1.15, -0.05], [0.9, -0.05], [0.85, 0.12]], true),
    ],
  },
  H: {
    steps: [
      s('Left stem', [...leadIn(0.55), ...capStem(0.7, 1.75)]),
      s('Right stem', [[1.65, 2.0], [1.6, 1.0], [1.55, 0.25], [1.68, 0.0], [1.9, 0.15]]),
      s('Crossbar loop', [[0.75, 0.95], [1.2, 1.05], [1.65, 1.15], [1.75, 1.0], [1.55, 0.98]]),
    ],
  },
  I: {
    steps: [
      s('Hairline upstroke', [[0.15, 1.3], [0.55, 1.85], [1.0, 2.05], [1.12, 1.92]]),
      s('Shaded stem', [[1.12, 1.92], [1.02, 1.2], [0.92, 0.45], [0.72, 0.05], [0.4, 0.0], [0.25, 0.18], [0.5, 0.3]], true),
    ],
  },
  J: {
    steps: [
      s('Hairline upstroke', [[0.15, 1.3], [0.55, 1.85], [1.0, 2.05], [1.12, 1.92]]),
      s('Shaded stem', [[1.12, 1.92], [1.05, 0.9], [0.98, 0.0], [0.85, -0.65]], true),
      s('Lower loop', [[0.85, -0.65], [0.6, -0.95], [0.38, -0.78], [0.55, -0.35], [1.0, 0.1], [1.25, 0.35]], true),
    ],
  },
  K: {
    steps: [
      s('Shaded stem', [...leadIn(0.6), ...capStem(0.75, 1.75)]),
      s('Arm', [[1.75, 1.95], [1.5, 1.6], [1.15, 1.15], [0.95, 1.0], [1.2, 0.95]]),
      s('Leg', [[1.2, 0.95], [1.4, 0.75], [1.45, 0.25], [1.6, 0.0], [1.85, 0.15]], true),
    ],
  },
  L: {
    steps: [
      s('Top loop', [[1.1, 1.55], [1.4, 1.9], [1.25, 2.06], [0.95, 1.85]]),
      s('Shaded stem', [[0.95, 1.85], [0.85, 1.0], [0.68, 0.3], [0.45, 0.04], [0.15, 0.02], [0.08, 0.18], [0.35, 0.22]], true),
      s('Base tail', [[0.35, 0.22], [0.8, 0.04], [1.35, 0.0], [1.7, 0.18]], true),
    ],
  },
  M: {
    steps: [
      s('Lead-in and first stem', [[-0.15, 1.3], [0.1, 1.85], [0.4, 2.0], [0.55, 1.7], [0.5, 0.8], [0.45, 0.0]]),
      s('Second arch', [[0.48, 1.0], [0.72, 1.75], [1.05, 2.02], [1.28, 1.8], [1.25, 0.8], [1.2, 0.0]]),
      s('Third arch and exit', [[1.23, 1.0], [1.48, 1.75], [1.8, 2.02], [2.02, 1.8], [1.96, 0.3], [2.08, 0.0], [2.3, 0.15]]),
    ],
  },
  N: {
    steps: [
      s('Lead-in and stem', [[-0.15, 1.3], [0.1, 1.85], [0.4, 2.0], [0.55, 1.7], [0.5, 0.8], [0.45, 0.0]]),
      s('Hairline diagonal', [[0.45, 0.0], [0.85, 0.75], [1.2, 1.5], [1.4, 2.0]], true),
      s('Finishing turn', [[1.4, 2.0], [1.6, 2.06], [1.72, 1.9]], true),
    ],
  },
  O: {
    steps: [
      s('Shaded left side', [[1.1, 1.85], [0.8, 2.02], [0.38, 1.85], [0.1, 1.2], [0.15, 0.4], [0.55, 0.0]]),
      s('Hairline right side', [[0.55, 0.0], [1.0, 0.15], [1.25, 0.9], [1.2, 1.65], [0.92, 1.98]], true),
      s('Inner loop', [[0.92, 1.98], [0.62, 1.88], [0.65, 1.6], [0.95, 1.7]], true),
    ],
  },
  P: {
    steps: [
      s('Shaded stem', capStem(0.8)),
      s('Bowl', [[0.45, 1.5], [0.7, 1.95], [1.3, 2.05], [1.62, 1.75], [1.45, 1.22], [0.95, 1.0], [0.75, 1.1]]),
    ],
  },
  Q: {
    steps: [
      s('Shaded left side', [[1.1, 1.85], [0.8, 2.02], [0.38, 1.85], [0.1, 1.2], [0.15, 0.4], [0.55, 0.0]]),
      s('Hairline right side', [[0.55, 0.0], [1.0, 0.15], [1.25, 0.9], [1.2, 1.65], [0.92, 1.98]], true),
      s('Tail', [[0.15, 0.3], [0.5, 0.05], [1.05, -0.18], [1.5, -0.1], [1.75, 0.08]]),
    ],
  },
  R: {
    steps: [
      s('Shaded stem', capStem(0.8)),
      s('Bowl', [[0.45, 1.5], [0.7, 1.95], [1.3, 2.05], [1.62, 1.75], [1.45, 1.22], [0.95, 1.0], [0.82, 1.12], [1.0, 1.08]]),
      s('Leg', [[1.0, 1.08], [1.3, 0.85], [1.4, 0.3], [1.55, 0.0], [1.8, 0.15]], true),
    ],
  },
  S: {
    steps: [
      s('Hairline upstroke', [[0.05, 0.3], [0.5, 1.0], [1.0, 1.75], [1.3, 2.05]]),
      s('Top turn', [[1.3, 2.05], [1.0, 2.0], [0.82, 1.7]], true),
      s('Shaded compound curve', [[0.82, 1.7], [1.0, 1.25], [1.18, 0.75], [1.12, 0.25], [0.75, 0.0], [0.35, 0.05], [0.2, 0.28], [0.42, 0.35]], true),
    ],
  },
  T: {
    steps: [
      s('Cap stroke', [[0.2, 1.7], [0.45, 2.0], [1.0, 1.88], [1.45, 1.98], [1.85, 2.08]]),
      s('Shaded stem', capStem(1.05, 1.9)),
    ],
  },
  U: {
    steps: [
      s('Lead-in and first stem', [...leadIn(0.35), [0.5, 1.4], [0.45, 0.45], [0.6, 0.05], [0.95, 0.0], [1.25, 0.3], [1.38, 1.0], [1.42, 2.0]]),
      s('Second stem', [[1.42, 2.0], [1.38, 0.3], [1.5, 0.0], [1.7, 0.15]], true),
    ],
  },
  V: {
    steps: [
      s('Lead-in and stem', [...leadIn(0.35), [0.5, 1.4], [0.55, 0.6], [0.65, 0.0]]),
      s('Hairline upstroke', [[0.65, 0.0], [1.05, 0.7], [1.38, 1.5], [1.5, 2.0]], true),
      s('Finishing turn', [[1.5, 2.0], [1.68, 2.05], [1.78, 1.88]], true),
    ],
  },
  W: {
    steps: [
      s('Lead-in and stem', [...leadIn(0.35), [0.5, 1.4], [0.55, 0.6], [0.65, 0.0]]),
      s('Hairline up', [[0.65, 0.0], [0.95, 0.85], [1.15, 1.6]], true),
      s('Second stem', [[1.15, 1.6], [1.18, 0.8], [1.25, 0.0]], true),
      s('Hairline and finish', [[1.25, 0.0], [1.65, 0.8], [1.95, 1.6], [2.05, 2.0], [2.22, 1.92]], true),
    ],
  },
  X: {
    steps: [
      s('Shaded overturn', [[0.15, 1.6], [0.42, 2.0], [0.72, 1.92], [0.85, 1.3], [0.98, 0.45], [1.2, 0.02], [1.5, 0.05], [1.65, 0.25]]),
      s('Crossing hairline', [[0.0, 0.25], [0.2, 0.0], [0.6, 0.3], [1.15, 1.35], [1.45, 1.95], [1.7, 2.0]]),
    ],
  },
  Y: {
    steps: [
      s('Lead-in and first stem', [...leadIn(0.35), [0.5, 1.4], [0.45, 0.45], [0.6, 0.05], [0.95, 0.0], [1.25, 0.3], [1.38, 1.0], [1.42, 2.0]]),
      s('Descending loop', [[1.42, 2.0], [1.38, 0.6], [1.28, -0.5], [1.05, -0.95], [0.78, -0.82], [0.92, -0.4], [1.5, 0.1], [1.7, 0.3]], true),
    ],
  },
  Z: {
    steps: [
      s('Top stroke', [[0.15, 1.65], [0.5, 2.0], [1.05, 1.85], [1.45, 2.0]]),
      s('Shaded diagonal', [[1.45, 2.0], [1.05, 1.35], [0.55, 0.55], [0.25, 0.05]], true),
      s('Base stroke', [[0.25, 0.05], [0.65, 0.12], [1.2, -0.02], [1.65, 0.18]], true),
    ],
  },
}

/* ---------- Business cursive lowercase ---------- */

const entry = (x: number, top = 1): P[] => [
  [x - 0.32, 0.0],
  [x - 0.15, top * 0.45],
  [x, top],
]
const exitFrom = (x: number): P[] => [
  [x, 0.3],
  [x + 0.08, 0.02],
  [x + 0.28, 0.06],
  [x + 0.45, 0.35],
]
const ovalAt = (cx: number): P[] => [
  [cx + 0.28, 0.85],
  [cx + 0.05, 1.0],
  [cx - 0.25, 0.85],
  [cx - 0.35, 0.4],
  [cx - 0.15, 0.02],
  [cx + 0.15, 0.08],
  [cx + 0.3, 0.5],
  [cx + 0.34, 1.0],
]
const ascLoop = (x: number): P[] => [
  [x - 0.35, 0.0],
  [x, 0.75],
  [x + 0.3, 1.55],
  [x + 0.3, 2.0],
  [x + 0.12, 2.05],
  [x, 1.8],
]
const overturn = (x: number): P[] => [
  [x + 0.02, 0.3],
  [x + 0.15, 0.82],
  [x + 0.35, 1.0],
  [x + 0.48, 0.82],
  [x + 0.45, 0.0],
]

export const LOWERCASE: Record<string, Glyph> = {
  a: {
    steps: [
      s('Oval', ovalAt(0.4)),
      s('Stem and exit', [[0.74, 1.0], [0.72, 0.6], ...exitFrom(0.72)], true),
    ],
  },
  b: {
    steps: [
      s('Ascending loop', ascLoop(0.35)),
      s('Stem', [[0.35, 1.8], [0.3, 0.9], [0.25, 0.0]], true),
      s('Bowl and tie', [[0.26, 0.1], [0.38, 0.6], [0.6, 0.98], [0.78, 0.82], [0.7, 0.3], [0.45, 0.02], [0.4, 0.2], [0.55, 0.9], [0.95, 0.9]], true),
    ],
  },
  c: {
    steps: [
      s('Entry and hook', [[0.0, 0.0], [0.35, 0.55], [0.68, 1.0], [0.78, 0.9], [0.65, 0.82]]),
      s('Curve', [[0.65, 0.82], [0.42, 1.0], [0.18, 0.75], [0.1, 0.35], [0.3, 0.02], [0.6, 0.05], [0.88, 0.35]], true),
    ],
  },
  d: {
    steps: [
      s('Oval', ovalAt(0.4)),
      s('Hairline up', [[0.74, 1.0], [0.8, 1.55], [0.88, 2.0]], true),
      s('Stem and exit', [[0.88, 2.0], [0.8, 1.0], ...exitFrom(0.75)], true),
    ],
  },
  e: {
    steps: [
      s('Entry', [[0.0, 0.05], [0.3, 0.38], [0.66, 0.68]]),
      s('Loop and curve', [[0.66, 0.68], [0.72, 0.95], [0.5, 1.03], [0.24, 0.82], [0.12, 0.4], [0.32, 0.0], [0.65, 0.04], [0.95, 0.35]], true),
    ],
  },
  f: {
    steps: [
      s('Ascending loop', ascLoop(0.35)),
      s('Long stem', [[0.35, 1.8], [0.3, 0.6], [0.22, -0.9]], true),
      s('Lower loop', [[0.22, -0.9], [0.45, -0.85], [0.5, -0.35], [0.32, 0.02], [0.65, 0.12], [0.9, 0.35]], true),
    ],
  },
  g: {
    steps: [
      s('Oval', ovalAt(0.4)),
      s('Descending loop', [[0.74, 1.0], [0.72, 0.2], [0.62, -0.65], [0.38, -0.98], [0.12, -0.82], [0.28, -0.4], [0.75, -0.05], [1.0, 0.3]], true),
    ],
  },
  h: {
    steps: [
      s('Ascending loop', ascLoop(0.35)),
      s('Stem', [[0.35, 1.8], [0.3, 0.9], [0.25, 0.0]], true),
      s('Overturn and exit', [[0.27, 0.25], [0.42, 0.8], [0.65, 1.0], [0.8, 0.85], [0.78, 0.4], ...exitFrom(0.78).slice(1)]),
    ],
  },
  i: {
    steps: [
      s('Entry', entry(0.42)),
      s('Stem and exit', [[0.42, 1.0], [0.4, 0.6], ...exitFrom(0.38)], true),
      dot(0.55, 1.45),
    ],
  },
  j: {
    steps: [
      s('Entry', entry(0.42)),
      s('Descending loop', [[0.42, 1.0], [0.38, 0.0], [0.28, -0.72], [0.08, -0.98], [-0.1, -0.8], [0.08, -0.4], [0.55, 0.0], [0.8, 0.3]], true),
      dot(0.55, 1.45),
    ],
  },
  k: {
    steps: [
      s('Ascending loop', ascLoop(0.35)),
      s('Stem', [[0.35, 1.8], [0.3, 0.9], [0.25, 0.0]], true),
      s('Arm and leg', [[0.27, 0.25], [0.45, 0.82], [0.72, 1.0], [0.82, 0.78], [0.55, 0.52], [0.42, 0.5], [0.62, 0.42], ...exitFrom(0.72)]),
    ],
  },
  l: {
    steps: [
      s('Ascending loop', ascLoop(0.35)),
      s('Stem and exit', [[0.35, 1.8], [0.3, 0.9], ...exitFrom(0.27)], true),
    ],
  },
  m: {
    steps: [
      s('Entry overturn', [[0.0, 0.0], [0.08, 0.55], [0.22, 0.98], [0.38, 0.85], [0.36, 0.0]]),
      s('Second overturn', overturn(0.36)),
      s('Third overturn and exit', [...overturn(0.81).slice(0, 4), [0.78 + 0.48, 0.4], ...exitFrom(1.26).slice(1)]),
    ],
  },
  n: {
    steps: [
      s('Entry overturn', [[0.0, 0.0], [0.08, 0.55], [0.22, 0.98], [0.38, 0.85], [0.36, 0.0]]),
      s('Overturn and exit', [...overturn(0.36).slice(0, 4), [0.82, 0.4], ...exitFrom(0.82).slice(1)]),
    ],
  },
  o: {
    steps: [
      s('Oval', [[0.62, 0.9], [0.4, 1.02], [0.12, 0.8], [0.02, 0.38], [0.22, 0.0], [0.52, 0.08], [0.7, 0.5], [0.66, 0.95], [0.55, 0.82]]),
      s('Tie', [[0.55, 0.82], [0.8, 0.85], [1.05, 0.95]], true),
    ],
  },
  p: {
    steps: [
      s('Entry', [[0.0, 0.0], [0.2, 0.55], [0.38, 1.2]]),
      s('Long stem', [[0.38, 1.2], [0.32, 0.0], [0.26, -1.0]], true),
      s('Bowl and exit', [[0.3, 0.2], [0.42, 0.75], [0.68, 1.0], [0.85, 0.75], [0.72, 0.18], [0.45, 0.0], [0.38, 0.12], [0.7, 0.12], [0.98, 0.35]]),
    ],
  },
  q: {
    steps: [
      s('Oval', ovalAt(0.4)),
      s('Long stem', [[0.74, 1.0], [0.7, 0.0], [0.64, -0.95]], true),
      s('Return loop', [[0.64, -0.95], [0.84, -0.75], [0.8, -0.25], [0.76, 0.02], [1.0, 0.18], [1.15, 0.4]], true),
    ],
  },
  r: {
    steps: [
      s('Entry', [[0.0, 0.0], [0.25, 0.6], [0.42, 1.15]]),
      s('Shoulder', [[0.42, 1.15], [0.58, 1.02], [0.72, 1.0], [0.7, 0.8]], true),
      s('Stem and exit', [[0.7, 0.8], [0.68, 0.4], ...exitFrom(0.68).slice(1)], true),
    ],
  },
  s: {
    steps: [
      s('Entry', [[0.0, 0.0], [0.28, 0.6], [0.48, 1.12]]),
      s('Body and exit', [[0.48, 1.12], [0.66, 0.65], [0.7, 0.22], [0.5, 0.0], [0.25, 0.05], [0.22, 0.2], [0.48, 0.12], [0.78, 0.18], [1.0, 0.38]], true),
    ],
  },
  t: {
    steps: [
      s('Entry', [[0.0, 0.0], [0.28, 0.8], [0.48, 1.6]]),
      s('Stem and exit', [[0.48, 1.6], [0.42, 0.8], ...exitFrom(0.4)], true),
      s('Crossbar', [[0.15, 1.05], [0.5, 1.1], [0.82, 1.08]]),
    ],
  },
  u: {
    steps: [
      s('Entry', entry(0.32)),
      s('First stem', [[0.32, 1.0], [0.27, 0.25], [0.4, 0.0], [0.62, 0.15], [0.75, 0.6], [0.8, 1.0]], true),
      s('Second stem and exit', [[0.8, 1.0], [0.75, 0.55], ...exitFrom(0.74).slice(1)], true),
    ],
  },
  v: {
    steps: [
      s('Entry and stem', [[0.0, 0.0], [0.1, 0.6], [0.28, 1.0], [0.42, 0.85], [0.45, 0.3], [0.55, 0.0]]),
      s('Upstroke and tie', [[0.55, 0.0], [0.8, 0.4], [0.9, 0.9], [0.82, 1.0], [0.75, 0.85], [0.95, 0.85], [1.15, 0.95]], true),
    ],
  },
  w: {
    steps: [
      s('Entry', entry(0.32)),
      s('First stem', [[0.32, 1.0], [0.27, 0.25], [0.4, 0.0], [0.62, 0.2], [0.72, 0.6], [0.75, 1.0]], true),
      s('Second stem and tie', [[0.75, 1.0], [0.7, 0.25], [0.85, 0.0], [1.05, 0.2], [1.15, 0.6], [1.18, 0.95], [1.08, 0.88], [1.3, 0.85], [1.5, 0.95]], true),
    ],
  },
  x: {
    steps: [
      s('Overturn', [[0.0, 0.0], [0.12, 0.6], [0.3, 1.0], [0.45, 0.85], [0.52, 0.25], [0.68, 0.0], [0.9, 0.15]]),
      s('Crossing hairline', [[0.85, 0.98], [0.5, 0.5], [0.15, 0.02]]),
    ],
  },
  y: {
    steps: [
      s('Entry and first stem', [[0.0, 0.0], [0.12, 0.6], [0.3, 1.0], [0.42, 0.85], [0.38, 0.25], [0.5, 0.0], [0.7, 0.2], [0.82, 0.6], [0.85, 1.0]]),
      s('Descending loop', [[0.85, 1.0], [0.78, 0.0], [0.65, -0.7], [0.42, -0.98], [0.2, -0.8], [0.35, -0.4], [0.8, -0.05], [1.05, 0.3]], true),
    ],
  },
  z: {
    steps: [
      s('Entry and body', [[0.0, 0.0], [0.12, 0.6], [0.35, 1.0], [0.6, 0.92], [0.62, 0.6], [0.42, 0.32], [0.32, 0.25]]),
      s('Descending loop', [[0.32, 0.25], [0.6, 0.2], [0.66, -0.3], [0.48, -0.85], [0.24, -0.95], [0.14, -0.75], [0.45, -0.35], [0.85, 0.0], [1.05, 0.3]], true),
    ],
  },
}

/* ---------- Business cursive capitals ---------- */
// Simpler, faster capitals in the Palmer tradition: plain stems instead of
// Copperplate's shaded stem-and-oval, written with an ordinary pen.

const firstArch: P[] = [[0.0, 0.0], [0.12, 1.1], [0.38, 1.95], [0.62, 1.82], [0.6, 0.9], [0.55, 0.0]]
const plainStem = (x: number): P[] => [[x - 0.35, 1.7], [x - 0.1, 2.0], [x + 0.05, 1.8], [x - 0.05, 0.9], [x - 0.18, 0.0]]
const entryTop = (x: number): P[] => [[x - 0.4, 1.6], [x - 0.15, 2.0], [x + 0.05, 1.8]]

export const BUSINESS_CAPITALS: Record<string, Glyph> = {
  A: {
    steps: [
      s('Oval', [[1.25, 1.75], [0.85, 2.0], [0.32, 1.6], [0.1, 0.7], [0.35, 0.0], [0.85, 0.2], [1.2, 1.0], [1.35, 2.0]]),
      s('Stem and exit', [[1.35, 2.0], [1.3, 0.6], [1.32, 0.12], [1.48, 0.0], [1.72, 0.25]], true),
    ],
  },
  B: {
    steps: [
      s('Stem', plainStem(0.75)),
      s('Upper lobe', [[0.8, 2.0], [1.3, 2.05], [1.5, 1.7], [1.25, 1.2], [0.9, 1.08], [1.15, 1.08]]),
      s('Lower lobe', [[1.15, 1.08], [1.55, 0.8], [1.48, 0.25], [1.0, 0.0], [0.6, 0.1], [0.8, 0.28]], true),
    ],
  },
  C: {
    steps: [
      s('Top loop', [[1.0, 1.55], [1.12, 1.95], [0.85, 2.04], [0.55, 1.75]]),
      s('Curve and exit', [[0.55, 1.75], [0.25, 1.25], [0.15, 0.55], [0.42, 0.02], [0.9, 0.05], [1.22, 0.38]], true),
    ],
  },
  D: {
    steps: [
      s('Stem', [[1.0, 2.0], [0.9, 1.0], [0.75, 0.1]]),
      s('Base loop', [[0.75, 0.1], [0.45, 0.0], [0.42, 0.16], [0.78, 0.15], [1.2, 0.0]], true),
      s('Bowl', [[1.2, 0.0], [1.7, 0.4], [1.75, 1.4], [1.35, 2.0], [0.8, 2.02], [0.55, 1.78], [0.78, 1.62]], true),
    ],
  },
  E: CAPITALS.E,
  F: {
    steps: [
      s('Cap stroke', [[0.4, 1.82], [0.8, 2.02], [1.3, 1.9], [1.75, 2.02]]),
      s('Stem', [[1.05, 1.95], [0.95, 1.0], [0.75, 0.12], [0.45, 0.0], [0.25, 0.22]]),
      s('Crossbar', [[0.62, 1.0], [0.95, 1.06], [1.28, 1.02]]),
    ],
  },
  G: CAPITALS.G,
  H: {
    steps: [
      s('Left stem', plainStem(0.65)),
      s('Right stem', [[1.62, 2.0], [1.52, 1.0], [1.42, 0.2], [1.56, 0.0], [1.78, 0.16]]),
      s('Crossbar loop', [[0.55, 0.92], [1.05, 1.05], [1.6, 1.12], [1.7, 0.98], [1.5, 0.96]]),
    ],
  },
  I: CAPITALS.I,
  J: CAPITALS.J,
  K: {
    steps: [
      s('Stem', plainStem(0.65)),
      s('Arm and leg', [[1.62, 1.95], [1.15, 1.25], [0.82, 1.02], [1.08, 0.95], [1.3, 0.5], [1.4, 0.05], [1.66, 0.16]]),
    ],
  },
  L: CAPITALS.L,
  M: {
    steps: [
      s('First arch', firstArch),
      s('Second arch', [[0.58, 0.8], [0.85, 1.8], [1.1, 2.0], [1.27, 1.72], [1.2, 0.0]]),
      s('Third arch and exit', [[1.22, 0.8], [1.5, 1.8], [1.76, 2.0], [1.92, 1.72], [1.86, 0.3], [1.97, 0.0], [2.17, 0.16]]),
    ],
  },
  N: {
    steps: [
      s('First arch', firstArch),
      s('Second arch and exit', [[0.58, 0.8], [0.85, 1.8], [1.1, 2.0], [1.27, 1.72], [1.22, 0.3], [1.32, 0.0], [1.52, 0.16]]),
    ],
  },
  O: CAPITALS.O,
  P: {
    steps: [
      s('Stem', plainStem(0.72)),
      s('Bowl', [[0.42, 1.6], [0.72, 2.0], [1.3, 2.05], [1.55, 1.7], [1.3, 1.15], [0.82, 1.0], [0.66, 1.1]]),
    ],
  },
  Q: {
    steps: [
      s('Top curve', [[0.3, 1.4], [0.55, 1.95], [1.0, 2.02], [1.22, 1.62], [1.0, 1.0], [0.5, 0.3], [0.2, 0.05]]),
      s('Base loop and exit', [[0.2, 0.05], [0.36, 0.22], [0.58, 0.1], [1.0, 0.0], [1.42, 0.2]], true),
    ],
  },
  R: {
    steps: [
      s('Stem', plainStem(0.72)),
      s('Bowl', [[0.42, 1.6], [0.72, 2.0], [1.3, 2.05], [1.55, 1.7], [1.3, 1.15], [0.9, 1.0], [0.78, 1.12], [0.98, 1.06]]),
      s('Leg', [[0.98, 1.06], [1.25, 0.8], [1.35, 0.2], [1.5, 0.0], [1.72, 0.16]], true),
    ],
  },
  S: CAPITALS.S,
  T: {
    steps: [
      s('Cap stroke', [[0.4, 1.82], [0.8, 2.02], [1.3, 1.9], [1.75, 2.02]]),
      s('Stem', [[1.05, 1.95], [0.95, 1.0], [0.75, 0.12], [0.45, 0.0], [0.25, 0.22]]),
    ],
  },
  U: {
    steps: [
      s('Entry and first stem', [...entryTop(0.45), [0.42, 0.5], [0.55, 0.05], [0.9, 0.0], [1.2, 0.4], [1.35, 1.2], [1.4, 2.0]]),
      s('Second stem and exit', [[1.4, 2.0], [1.35, 0.3], [1.45, 0.0], [1.66, 0.16]], true),
    ],
  },
  V: {
    steps: [
      s('Entry and stem', [...entryTop(0.45), [0.5, 0.8], [0.65, 0.0]]),
      s('Upstroke and finish', [[0.65, 0.0], [1.1, 0.8], [1.4, 1.6], [1.5, 2.0], [1.3, 1.86]], true),
    ],
  },
  W: {
    steps: [
      s('Entry and stem', [...entryTop(0.45), [0.5, 0.8], [0.62, 0.0]]),
      s('Hairline up', [[0.62, 0.0], [0.92, 0.85], [1.12, 1.55]], true),
      s('Second stem', [[1.12, 1.55], [1.15, 0.8], [1.24, 0.0]], true),
      s('Upstroke and finish', [[1.24, 0.0], [1.65, 0.8], [1.95, 1.6], [2.03, 2.0], [1.85, 1.86]], true),
    ],
  },
  X: CAPITALS.X,
  Y: {
    steps: [
      s('Entry and first stem', [...entryTop(0.45), [0.42, 0.5], [0.55, 0.05], [0.9, 0.0], [1.2, 0.4], [1.35, 1.2], [1.4, 2.0]]),
      s('Descending loop', [[1.4, 2.0], [1.36, 0.6], [1.26, -0.5], [1.03, -0.95], [0.76, -0.82], [0.9, -0.4], [1.48, 0.1], [1.68, 0.3]], true),
    ],
  },
  Z: CAPITALS.Z,
}

/* ---------- Geometry and ink ---------- */

/** How a script is written: slant of the downstrokes, and how much they swell. */
export type Style = {
  /** Degrees from horizontal (55 for Copperplate). */
  slant: number
  /** Shading on downstrokes: 1 = pointed pen, ~0.25 = an ordinary pen. */
  shade: number
}
export const COPPERPLATE_STYLE: Style = { slant: 55, shade: 1 }

const shear = (deg: number) => 1 / Math.tan((deg * Math.PI) / 180)

/** Centripetal Catmull-Rom through the points, sampled densely. */
export function spline(pts: P[], per = 14): P[] {
  if (pts.length < 2) return pts.slice()
  const out: P[] = []
  const ext = [pts[0], ...pts, pts[pts.length - 1]]
  for (let i = 1; i < ext.length - 2; i++) {
    const [p0, p1, p2, p3] = [ext[i - 1], ext[i], ext[i + 1], ext[i + 2]]
    for (let k = 0; k < per; k++) {
      const t = k / per
      const t2 = t * t
      const t3 = t2 * t
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3)
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[pts.length - 1])
  return out
}

type Bounds = { minX: number; maxX: number; width: number }
const boundsCache = new WeakMap<Glyph, Map<number, Bounds>>()

/** Bounds of a glyph after slanting, in x-height units. */
export function bounds(g: Glyph, slant = 55): Bounds {
  let perSlant = boundsCache.get(g)
  if (!perSlant) boundsCache.set(g, (perSlant = new Map()))
  const hit = perSlant.get(slant)
  if (hit) return hit
  const k = shear(slant)
  let minX = Infinity
  let maxX = -Infinity
  for (const st of g.steps)
    for (const [x, y] of spline(st.pts, 6)) {
      const sx = x + y * k
      minX = Math.min(minX, sx)
      maxX = Math.max(maxX, sx)
    }
  const b = { minX, maxX, width: maxX - minX }
  perSlant.set(slant, b)
  return b
}

export type InkPt = { x: number; y: number; w: number; d: number }

/**
 * Turn one step into screen-space ink points.
 * Downstrokes (moving down the slant) swell; everything else is a hairline.
 */
export function inkStep(st: Step, ox: number, baseline: number, xh: number, style: Style = COPPERPLATE_STYLE): InkPt[] {
  const k = shear(style.slant)
  const hair = Math.max(0.9, xh * 0.035)
  const shade = xh * 0.17 * style.shade
  if (st.dot) {
    const [x, y] = st.pts[0]
    const r = Math.max(1.6, xh * 0.08)
    return [{ x: ox + (x + y * k) * xh, y: baseline - y * xh, w: r * 2, d: 1 }]
  }
  const line = spline(st.pts)
  const out: InkPt[] = []
  let w = hair
  for (let i = 0; i < line.length; i++) {
    const [x, y] = line[i]
    const [px, py] = line[Math.max(0, i - 1)]
    const [nx, ny] = line[Math.min(line.length - 1, i + 1)]
    const dx = nx - px
    const dy = ny - py
    const len = Math.hypot(dx, dy) || 1
    const down = Math.max(0, -dy / len)
    const target = hair + shade * Math.pow(down, 1.8)
    w += (target - w) * 0.35
    out.push({ x: ox + (x + y * k) * xh, y: baseline - y * xh, w, d: 1 })
  }
  // Swell in and taper out, as the nib opens and closes.
  if (out.length > 2) out[out.length - 1].w = Math.max(hair, out[out.length - 1].w * 0.7)
  return out
}

/** Length of a step's ink path, in px (for timing the animation). */
export function pathLength(pts: InkPt[]) {
  let l = 0
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
  return l
}
