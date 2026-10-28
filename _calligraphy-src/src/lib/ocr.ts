// Reading the words on a photographed page, on the phone itself.
//
// Tesseract (WebAssembly) runs in a worker; the engine and the English and
// Vietnamese language data are served by the app (public/ocr, copied from
// node_modules by scripts/copy-ocr.mjs), so photos never leave the device.
// Handwriting is harder than print: what's read is a first draft that the
// writer can correct. The native apps can later swap in the platform's own
// handwriting recogniser behind this same function.

import type { Worker } from 'tesseract.js'

export type Reading = { text: string; lines: string[]; confidence: number }

const BASE = import.meta.env.BASE_URL
let worker: { langs: string; w: Promise<Worker> } | null = null

function getWorker(langs: string[]) {
  const key = langs.join('+')
  if (worker?.langs !== key) {
    void worker?.w.then((w) => w.terminate())
    worker = {
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
  return worker.w
}

/** Start loading the reader early (e.g. when the camera opens). */
export const warmUp = (langs: string[]) => void getWorker(langs).catch(() => null)

/** Read a page. `langs` like ['eng'] or ['vie', 'eng']. */
export async function readPage(image: HTMLCanvasElement, langs: string[]): Promise<Reading> {
  const w = await getWorker(langs)
  const { data } = await w.recognize(image, {}, { text: true, blocks: true })
  const lines = (data.blocks ?? [])
    .flatMap((b) => b.paragraphs.flatMap((p) => p.lines))
    .filter((l) => l.confidence > 25 && l.text.trim().length > 1)
    .map((l) => l.text.trim())
  return { text: lines.join('\n'), lines, confidence: data.confidence }
}
