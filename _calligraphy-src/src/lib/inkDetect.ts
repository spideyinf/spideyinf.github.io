// Is there handwriting in the frame, and where are its lines?
//
// A fast, approximate look at a small grey copy of the camera frame, a few
// times a second: ink is a pixel clearly darker than its neighbourhood;
// a line of writing is a band of rows that cross ink many times (ruled
// lines cross it once; blank paper not at all). Returns boxes in 0..1 units.

export type Box = { x0: number; y0: number; x1: number; y1: number }

export function detectLines(img: ImageData): Box[] {
  const { width: W, height: H, data } = img
  const gray = new Float32Array(W * H)
  for (let i = 0; i < W * H; i++) gray[i] = data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114
  // Integral image for a local mean over a square window.
  const S = new Float64Array((W + 1) * (H + 1))
  for (let y = 0; y < H; y++) {
    let row = 0
    for (let x = 0; x < W; x++) {
      row += gray[y * W + x]
      S[(y + 1) * (W + 1) + x + 1] = S[y * (W + 1) + x + 1] + row
    }
  }
  const r = Math.max(6, Math.round(W / 24))
  const ink = new Uint8Array(W * H)
  for (let y = 0; y < H; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(H, y + r + 1)
    for (let x = 0; x < W; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(W, x + r + 1)
      const sum = S[y1 * (W + 1) + x1] - S[y0 * (W + 1) + x1] - S[y1 * (W + 1) + x0] + S[y0 * (W + 1) + x0]
      const mean = sum / ((x1 - x0) * (y1 - y0))
      ink[y * W + x] = gray[y * W + x] < mean - 16 && mean > 60 ? 1 : 0
    }
  }
  // Per row: how many times it crosses ink, and how much ink.
  const texty = new Uint8Array(H)
  for (let y = 0; y < H; y++) {
    let t = 0, c = 0
    for (let x = 1; x < W; x++) {
      if (ink[y * W + x] !== ink[y * W + x - 1]) t++
      c += ink[y * W + x]
    }
    texty[y] = t >= 8 && c > W * 0.02 && c < W * 0.55 ? 1 : 0
  }
  // Bands of texty rows, allowing small gaps.
  const bands: [number, number][] = []
  let start = -1, gap = 0
  for (let y = 0; y <= H; y++) {
    if (y < H && texty[y]) {
      if (start < 0) start = y
      gap = 0
    } else if (start >= 0) {
      if (++gap > 2 || y === H) {
        bands.push([start, y - gap])
        start = -1
        gap = 0
      }
    }
  }
  const minH = Math.max(5, H * 0.02)
  const boxes: Box[] = []
  for (const [a, b] of bands) {
    if (b - a + 1 < minH || b - a > H * 0.35) continue
    // Horizontal extent: columns holding ink, ignoring stray specks at the edges.
    const col = new Uint16Array(W)
    for (let y = a; y <= b; y++) for (let x = 0; x < W; x++) col[x] += ink[y * W + x]
    let x0 = 0, x1 = W - 1
    while (x0 < W && col[x0] < 2) x0++
    while (x1 > x0 && col[x1] < 2) x1--
    if (x1 - x0 < W * 0.18) continue
    boxes.push({ x0: x0 / W, y0: a / H, x1: (x1 + 1) / W, y1: (b + 1) / H })
  }
  // Merge bands that are really one line (a descender gap).
  const merged: Box[] = []
  for (const bx of boxes) {
    const last = merged[merged.length - 1]
    if (last && bx.y0 - last.y1 < 0.012) {
      last.y1 = bx.y1
      last.x0 = Math.min(last.x0, bx.x0)
      last.x1 = Math.max(last.x1, bx.x1)
    } else merged.push({ ...bx })
  }
  return merged.slice(0, 12)
}
