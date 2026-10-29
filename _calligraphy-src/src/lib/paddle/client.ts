// The page's side of the PaddleOCR worker: resizing, cropping, and the two jobs.

import type { DetBox, RecLine } from './worker'

export type { DetBox, RecLine }

let worker: Worker | null = null
let ready: Promise<void> | null = null
let seq = 0
const pending = new Map<number, { res: (v: never) => void; rej: (e: Error) => void }>()

function call<T>(msg: Record<string, unknown>, transfer: Transferable[] = []): Promise<T> {
  worker ??= (() => {
    const w = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
    w.onmessage = (e) => {
      const p = pending.get(e.data.id)
      if (!p) return
      pending.delete(e.data.id)
      if (e.data.ok) p.res(e.data as never)
      else p.rej(new Error(e.data.error))
    }
    return w
  })()
  const id = ++seq
  return new Promise<T>((res, rej) => {
    pending.set(id, { res: res as (v: never) => void, rej })
    worker!.postMessage({ ...msg, id }, transfer)
  })
}

/** Load the detector (once). Safe to call early. */
export function initPaddle() {
  ready ??= call<void>({ type: 'init', base: import.meta.env.BASE_URL }).catch((e) => {
    ready = null
    throw e
  })
  return ready
}

const canvas = (w: number, h: number) => {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/**
 * Find lines of text in `src`. The image is scaled so its longest side is
 * `maxSide` and padded to multiples of 32. Boxes come back in `src` pixels.
 */
export async function detect(src: CanvasImageSource & { width: number; height: number }, maxSide: number, sw = src.width, sh = src.height, sx = 0, sy = 0): Promise<DetBox[]> {
  await initPaddle()
  const k = Math.min(1, maxSide / Math.max(sw, sh))
  const w = Math.max(32, Math.round(sw * k))
  const h = Math.max(32, Math.round(sh * k))
  const W = Math.ceil(w / 32) * 32
  const H = Math.ceil(h / 32) * 32
  const c = canvas(W, H)
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, W, H)
  ctx.drawImage(src, sx, sy, sw, sh, 0, 0, w, h)
  const image = ctx.getImageData(0, 0, W, H)
  const { boxes } = await call<{ boxes: DetBox[] }>({ type: 'detect', image }, [image.data.buffer])
  return boxes
    .map((b) => ({ ...b, x0: b.x0 / k, y0: b.y0 / k, x1: Math.min(sw, b.x1 / k), y1: Math.min(sh, b.y1 / k) }))
    .filter((b) => b.x1 > b.x0 && b.y1 > b.y0)
}

/** Group word boxes into lines, top to bottom; each line's words left to right. */
export function groupLines(boxes: DetBox[]): DetBox[][] {
  const sorted = [...boxes].sort((a, b) => (a.y0 + a.y1) / 2 - (b.y0 + b.y1) / 2)
  const lines: DetBox[][] = []
  for (const b of sorted) {
    const cy = (b.y0 + b.y1) / 2
    const line = lines.find((l) => {
      const ly0 = Math.min(...l.map((x) => x.y0))
      const ly1 = Math.max(...l.map((x) => x.y1))
      return cy > ly0 && cy < ly1
    })
    if (line) line.push(b)
    else lines.push([b])
  }
  return lines.map((l) => l.sort((a, b) => a.x0 - b.x0))
}

/** Read each line of `src` (a canvas), given its boxes. */
export async function recognize(src: HTMLCanvasElement, lines: DetBox[][]): Promise<RecLine[]> {
  const crops: ImageData[] = []
  for (const l of lines) {
    const x0 = Math.max(0, Math.min(...l.map((b) => b.x0)))
    const y0 = Math.max(0, Math.min(...l.map((b) => b.y0)))
    const x1 = Math.min(src.width, Math.max(...l.map((b) => b.x1)))
    const y1 = Math.min(src.height, Math.max(...l.map((b) => b.y1)))
    const h = 48
    const w = Math.min(1600, Math.max(16, Math.round(((x1 - x0) / (y1 - y0)) * h)))
    const c = canvas(w, h)
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    ctx.drawImage(src, x0, y0, x1 - x0, y1 - y0, 0, 0, w, h)
    crops.push(ctx.getImageData(0, 0, w, h))
  }
  if (!crops.length) return []
  const { lines: out } = await call<{ lines: RecLine[] }>(
    { type: 'recognize', lines: crops },
    crops.map((c) => c.data.buffer),
  )
  return out
}
