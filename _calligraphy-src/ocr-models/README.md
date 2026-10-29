# Text-reading models

PaddleOCR PP-OCRv5 mobile models, in ONNX form, used on the phone by
`src/lib/paddle/worker.ts`:

| File | What it does | Size |
|---|---|---|
| `PP-OCRv5_mobile_det_infer.onnx` | Finds lines of text (printed or handwritten) in an image | 4.7 MB |
| `en_PP-OCRv5_mobile_rec_infer.onnx` | Reads one line of English text | 7.9 MB |
| `ppocrv5_en_dict.txt` | The characters the reader can output | |

From PaddleOCR (https://www.paddleocr.ai), Apache License 2.0 (see `LICENSE`),
as converted to ONNX in https://github.com/PT-Perkasa-Pilar-Utama/ppu-paddle-ocr-models
(SHA-256 d7fe3ea7… for detection, 1081b104… for recognition).

`scripts/copy-ocr.mjs` copies them into `public/ocr/paddle/` for dev and build.
