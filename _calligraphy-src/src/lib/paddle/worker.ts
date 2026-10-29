/// <reference lib="webworker" />
// PaddleOCR (PP-OCRv5 mobile) on ONNX Runtime WebAssembly, in a worker so the
// camera never waits for it. Two jobs:
//  - detect: a probability map of where text is (DBNet), turned into boxes;
//  - recognize: one line image at a time, decoded with CTC against the dictionary.
// Images arrive already resized by the page (see client.ts).

import * as ort from 'onnxruntime-web/wasm'

type Req =
  | { id: number; type: 'init'; base: string }
  | { id: number; type: 'detect'; image: ImageData }
  | { id: number; type: 'recognize'; lines: ImageData[] }

export type DetBox = { x0: number; y0: number; x1: number; y1: number; score: number }
export type RecLine = { text: string; confidence: number }

let base = ''
let det: Promise<ort.InferenceSession> | null = null
let rec: Promise<{ s: ort.InferenceSession; dict: string[] }> | null = null

const session = (file: string) => ort.InferenceSession.create(`${base}ocr/paddle/${file}`, { executionProviders: ['wasm'], graphOptimizationLevel: 'all' })

function getDet() {
  det ??= session('det.onnx')
  return det
}
function getRec() {
  rec ??= Promise.all([session('rec_en.onnx'), fetch(`${base}ocr/paddle/dict_en.txt`).then((r) => r.text())]).then(([s, t]) => ({
    s,
    dict: t.replace(/\r?\n$/, '').split(/\r?\n/),
  }))
  return rec
}

/** DBNet input: RGB, ImageNet mean and std, NCHW. */
function detTensor(img: ImageData) {
  const { width: W, height: H, data } = img
  const n = W * H
  const t = new Float32Array(3 * n)
  const mean = [0.485, 0.456, 0.406]
  const std = [0.229, 0.224, 0.225]
  for (let i = 0; i < n; i++)
    for (let c = 0; c < 3; c++) t[c * n + i] = (data[i * 4 + c] / 255 - mean[c]) / std[c]
  return new ort.Tensor('float32', t, [1, 3, H, W])
}

/** Probability map → boxes: threshold, connected regions, keep confident ones, grow them back to the full text height. */
function boxesFrom(prob: Float32Array, W: number, H: number): DetBox[] {
  const on = new Uint8Array(W * H)
  for (let i = 0; i < W * H; i++) on[i] = prob[i] > 0.3 ? 1 : 0
  const seen = new Uint8Array(W * H)
  const out: DetBox[] = []
  const stack: number[] = []
  for (let i = 0; i < W * H; i++) {
    if (!on[i] || seen[i]) continue
    let x0 = W, y0 = H, x1 = 0, y1 = 0, n = 0, sum = 0
    stack.push(i)
    seen[i] = 1
    while (stack.length) {
      const j = stack.pop()!
      const x = j % W, y = (j / W) | 0
      n++
      sum += prob[j]
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
      for (let dy = -1; dy <= 1; dy++)
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx, ny = y + dy
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
          const k = ny * W + nx
          if (on[k] && !seen[k]) {
            seen[k] = 1
            stack.push(k)
          }
        }
    }
    const score = sum / n
    const w = x1 - x0 + 1, h = y1 - y0 + 1
    if (n < 12 || score < 0.55 || Math.min(w, h) < 3) continue
    // Unclip: the shrunk kernel grows back by area × 1.5 / perimeter.
    const d = (w * h * 1.5) / (2 * (w + h))
    out.push({ x0: Math.max(0, x0 - d), y0: Math.max(0, y0 - d), x1: Math.min(W, x1 + 1 + d), y1: Math.min(H, y1 + 1 + d), score })
  }
  return out
}

/** Recognition input: grey, scaled to −1…1, three identical channels, NCHW. */
function recTensor(img: ImageData) {
  const { width: W, height: H, data } = img
  const n = W * H
  const t = new Float32Array(3 * n)
  for (let i = 0; i < n; i++) {
    const g = (data[i * 4] * 0.299 + data[i * 4 + 1] * 0.587 + data[i * 4 + 2] * 0.114) / 127.5 - 1
    t[i] = t[n + i] = t[2 * n + i] = g
  }
  return new ort.Tensor('float32', t, [1, 3, H, W])
}

/** Line up the dictionary with the model's classes: class 0 is the CTC blank, the last is a space. */
function align(dict: string[], C: number) {
  if (dict.length === C) return dict
  const body = dict[0] === '' ? dict.slice(1) : dict
  const out = ['', ...body]
  while (out.length < C) out.push(' ')
  return out
}

/** Greedy CTC: best class per step, drop repeats and blanks (class 0); the last class is a space. */
function decode(logits: Float32Array, T: number, C: number, raw: string[]): RecLine {
  const dict = align(raw, C)
  let text = ''
  let last = -1
  let conf = 0
  let k = 0
  for (let t = 0; t < T; t++) {
    let best = 0
    let p = logits[t * C]
    for (let c = 1; c < C; c++) if (logits[t * C + c] > p) {
      p = logits[t * C + c]
      best = c
    }
    if (best !== 0 && best !== last) {
      text += best === C - 1 ? ' ' : (dict[best] ?? '')
      conf += p
      k++
    }
    last = best
  }
  return { text: text.replace(/\s+/g, ' ').trim(), confidence: k ? conf / k : 0 }
}

self.onmessage = async (e: MessageEvent<Req>) => {
  const m = e.data
  try {
    if (m.type === 'init') {
      base = m.base
      ort.env.wasm.numThreads = 1
      // Built app: the runtime's WebAssembly is served beside the models (dev loads it from node_modules).
      if (!import.meta.env.DEV) ort.env.wasm.wasmPaths = `${new URL(`${base}ocr/ort/`, self.location.href)}`
      await getDet()
      postMessage({ id: m.id, ok: true })
    } else if (m.type === 'detect') {
      const s = await getDet()
      const input = detTensor(m.image)
      const res = await s.run({ [s.inputNames[0]]: input })
      const out = res[s.outputNames[0]]
      const [, , H, W] = out.dims as number[]
      postMessage({ id: m.id, ok: true, boxes: boxesFrom(out.data as Float32Array, W, H) })
    } else if (m.type === 'recognize') {
      const { s, dict } = await getRec()
      const lines: RecLine[] = []
      for (const img of m.lines) {
        const res = await s.run({ [s.inputNames[0]]: recTensor(img) })
        const out = res[s.outputNames[0]]
        const [, T, C] = out.dims as number[]
        lines.push(decode(out.data as Float32Array, T, C, dict))
      }
      postMessage({ id: m.id, ok: true, lines })
    }
  } catch (err) {
    postMessage({ id: m.id, ok: false, error: String(err) })
  }
}
