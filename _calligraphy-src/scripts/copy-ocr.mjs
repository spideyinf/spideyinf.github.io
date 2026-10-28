// Copy the on-device text reader (Tesseract.js) and its English and
// Vietnamese language data into public/ocr, so the app serves them itself:
// photos are read on the phone, offline once loaded, with no third-party CDN.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const nm = join(root, 'node_modules')
const out = join(root, 'public', 'ocr')
mkdirSync(join(out, 'lang'), { recursive: true })

const files = [
  ['tesseract.js/dist/worker.min.js', 'worker.min.js'],
  ['tesseract.js-core/tesseract-core-lstm.wasm.js', 'tesseract-core-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-simd-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js'],
  ['tesseract.js-core/tesseract-core-relaxedsimd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'],
  ['@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz', 'lang/eng.traineddata.gz'],
  ['@tesseract.js-data/vie/4.0.0_best_int/vie.traineddata.gz', 'lang/vie.traineddata.gz'],
]
for (const [from, to] of files) {
  const src = join(nm, from)
  if (!existsSync(src)) throw new Error(`Missing ${from}: run npm install`)
  copyFileSync(src, join(out, to))
}
console.log(`OCR files copied to public/ocr (${files.length})`)
