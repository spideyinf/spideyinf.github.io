// Reading the words on a photographed page, on the phone itself.
//
// Three readers, best first:
// 1. In the wrapped app, the phone's own recogniser, if the native
//    `PageReader` plugin is installed (Apple Vision on iOS, which reads
//    handwriting; ML Kit on Android). See README › Reading pages.
// 2. PaddleOCR PP-OCRv5 (ONNX, in a worker): finds every line, printed or
//    handwritten, then reads it. English and other Latin text.
// 3. Tesseract: for Vietnamese (its tone marks), and if PaddleOCR can't load.
// All run on the device; photos never leave it.

import { Capacitor, registerPlugin } from '@capacitor/core'
import type { Worker } from 'tesseract.js'
import { detect, groupLines, initPaddle, recognize } from './paddle/client'

export type Reading = { text: string; lines: string[]; confidence: number; engine: 'native' | 'paddle' | 'tesseract' }

/* ---------- 1. Native (wrapped app) ---------- */

type PageReaderPlugin = { read(o: { image: string; languages: string[] }): Promise<{ lines: { text: string; confidence?: number }[] }> }
const PageReader = registerPlugin<PageReaderPlugin>('PageReader')
const nativeAvailable = () => Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('PageReader')

async function readNative(image: HTMLCanvasElement, langs: string[]): Promise<Reading> {
  const languages = langs.map((l) => (l === 'vie' ? 'vi-VN' : 'en-US'))
  const { lines } = await PageReader.read({ image: image.toDataURL('image/jpeg', 0.9).split(',')[1], languages })
  const kept = lines.filter((l) => l.text.trim())
  return {
    text: kept.map((l) => l.text.trim()).join('\n'),
    lines: kept.map((l) => l.text.trim()),
    confidence: kept.length ? kept.reduce((s, l) => s + (l.confidence ?? 0.8), 0) / kept.length : 0,
    engine: 'native',
  }
}

/* ---------- 2. PaddleOCR ---------- */

async function readPaddle(image: HTMLCanvasElement): Promise<Reading> {
  const boxes = await detect(image, 960)
  const lines = groupLines(boxes.filter((b) => b.score >= 0.5))
  const read = await recognize(image, lines)
  const kept = read.filter((l) => l.text && l.confidence > 0.5)
  return {
    text: kept.map((l) => l.text).join('\n'),
    lines: kept.map((l) => l.text),
    confidence: kept.length ? kept.reduce((s, l) => s + l.confidence, 0) / kept.length : 0,
    engine: 'paddle',
  }
}

/* ---------- 3. Tesseract ---------- */

const BASE = import.meta.env.BASE_URL
let tess: { langs: string; w: Promise<Worker> } | null = null

function tesseract(langs: string[]) {
  const key = langs.join('+')
  if (tess?.langs !== key) {
    void tess?.w.then((w) => w.terminate())
    tess = {
      langs: key,
      w: import('tesseract.js').then(({ createWorker, OEM }) =>
        createWorker(langs, OEM.LSTM_ONLY, {
          workerPath: `${BASE}ocr/worker.min.js`,
          corePath: `${BASE}ocr/`,
          langPath: `${BASE}ocr/lang`,
          gzip: true,
          workerBlobURL: false,
        }),
      ),
    }
  }
  return tess.w
}

async function readTesseract(image: HTMLCanvasElement, langs: string[]): Promise<Reading> {
  const w = await tesseract(langs)
  const { data } = await w.recognize(image, {}, { text: true, blocks: true })
  const lines = (data.blocks ?? [])
    .flatMap((b) => b.paragraphs.flatMap((p) => p.lines))
    .filter((l) => l.confidence > 25 && l.text.trim().length > 1)
    .map((l) => l.text.trim())
  return { text: lines.join('\n'), lines, confidence: data.confidence / 100, engine: 'tesseract' }
}

/* ---------- Choosing ---------- */

/** Start loading the readers early (when the camera opens). */
export function warmUp(langs: string[]) {
  if (nativeAvailable()) return
  void initPaddle().catch(() => null)
  if (langs.includes('vie')) void tesseract(langs).catch(() => null)
}

/** Read a page. `langs` like ['eng'] or ['vie', 'eng']. */
export async function readPage(image: HTMLCanvasElement, langs: string[]): Promise<Reading> {
  if (nativeAvailable()) {
    try {
      return await readNative(image, langs)
    } catch {
      /* fall through to the on-page readers */
    }
  }
  if (langs.includes('vie')) return readTesseract(image, langs)
  try {
    return await readPaddle(image)
  } catch (e) {
    console.warn('PaddleOCR unavailable, using Tesseract:', e)
    return readTesseract(image, langs)
  }
}
