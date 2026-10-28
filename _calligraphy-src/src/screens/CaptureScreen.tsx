import { useCallback, useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { PrimaryButton } from '../components/b'
import { INKS, PENS } from '../lib/fieldGuide'
import { detectLines, type Box } from '../lib/inkDetect'
import { letterInfo } from '../lib/letters'
import { readPage, warmUp, type Reading } from '../lib/ocr'
import { go, href } from '../lib/router'
import { usePractice } from '../state/practice'

/* ---------- Pieces of the camera view ---------- */

const scan = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(var(--travel)); }
`
const ScanLine = styled.div`
  position: absolute;
  height: 2px;
  background: #fbbf24;
  box-shadow: 0 0 16px 2px rgb(251 191 36 / 0.6);
  animation: ${scan} 1.8s ease-in-out infinite alternate;
  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

type Rect = { x: number; y: number; w: number; h: number }

/** The four corner brackets of the frame. */
function Corners({ r, color }: { r: Rect; color: string }) {
  const k = 26
  const { x, y, w, h } = r
  const d = [
    `M${x} ${y + k} V${y + 8} Q${x} ${y} ${x + 8} ${y} H${x + k}`,
    `M${x + w - k} ${y} H${x + w - 8} Q${x + w} ${y} ${x + w} ${y + 8} V${y + k}`,
    `M${x + w} ${y + h - k} V${y + h - 8} Q${x + w} ${y + h} ${x + w - 8} ${y + h} H${x + w - k}`,
    `M${x + k} ${y + h} H${x + 8} Q${x} ${y + h} ${x} ${y + h - 8} V${y + h - k}`,
  ].join(' ')
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
      <path d={d} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'stroke 0.3s' }} />
    </svg>
  )
}

const DarkButton = styled.button`
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 14px;
  background: rgb(255 255 255 / 0.12);
  color: #fbf6ea;
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  &:active {
    transform: scale(0.95);
  }
`

/* ---------- Helpers ---------- */

/** The part of the video under `frame` (screen px), given object-fit: cover in a box of cw×ch. */
function videoCrop(v: HTMLVideoElement, cw: number, ch: number, frame: Rect) {
  const s = Math.max(cw / v.videoWidth, ch / v.videoHeight)
  const ox = (cw - v.videoWidth * s) / 2
  const oy = (ch - v.videoHeight * s) / 2
  return { sx: (frame.x - ox) / s, sy: (frame.y - oy) / s, sw: frame.w / s, sh: frame.h / s }
}

/** Scale a canvas down to a saved page: at most 900 px, JPEG. */
function toPage(c: HTMLCanvasElement) {
  const k = Math.min(1, 900 / Math.max(c.width, c.height))
  const out = document.createElement('canvas')
  out.width = Math.round(c.width * k)
  out.height = Math.round(c.height * k)
  out.getContext('2d')!.drawImage(c, 0, 0, out.width, out.height)
  return out.toDataURL('image/jpeg', 0.72)
}

async function fileToCanvas(f: File) {
  const bmp = await createImageBitmap(f, { imageOrientation: 'from-image' })
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k)
  c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  return c
}

const PAPERS = ['Smooth notebook paper', 'Lined notebook', 'Dot grid', 'Squared paper', 'Sketch paper', 'Writing pad']

/* ---------- The screen ---------- */

type Shot = { canvas: HTMLCanvasElement; src: string; found: number }

/**
 * Step 1: a live camera with a frame for the page. Handwriting is looked for
 * a few times a second and its lines outlined; the shutter unlocks once some
 * is found. Step 2: what was read, to correct, then keep the page.
 */
export function CaptureScreen({ kind, refId }: { kind?: 'abc' | 'paragraph'; refId?: string }) {
  const { script, quotes, savePage } = usePractice()
  const [shot, setShot] = useState<Shot | null>(null)
  const langs = script.id === 'vietnamese' || (kind === 'paragraph' && refId?.startsWith('vn')) ? ['vie', 'eng'] : ['eng']

  useEffect(() => warmUp(langs), [langs.join()]) // eslint-disable-line react-hooks/exhaustive-deps

  const quote = kind === 'paragraph' ? quotes.find((q) => q.id === refId) : undefined
  const info = kind === 'abc' && refId ? letterInfo(refId) : undefined
  const back = () => (kind === 'abc' && refId ? go(href.abc(refId), true) : kind === 'paragraph' && refId ? go(href.write(refId), true) : go(href.pages, true))

  return shot ? (
    <Review
      shot={shot}
      langs={langs}
      handName={script.name}
      label={info ? info.upper + info.lower : quote ? quote.author || 'My words' : 'A page'}
      onRetake={() => setShot(null)}
      onKeep={(text, tools) => {
        savePage(
          { kind: kind ?? 'paragraph', label: info ? info.upper + info.lower : quote ? quote.author || 'My words' : 'A page', src: shot.src, text, tools },
          info ? { letter: info.upper } : quote ? { quoteId: quote.id } : {},
        )
        go(href.pages, true)
      }}
    />
  ) : (
    <Camera onShot={setShot} onClose={back} />
  )
}

function Camera({ onShot, onClose }: { onShot: (s: Shot) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null)
  const view = useRef<HTMLDivElement>(null)
  const track = useRef<MediaStreamTrack | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [state, setState] = useState<'starting' | 'live' | 'nocamera'>('starting')
  const [why, setWhy] = useState('')
  const [lines, setLines] = useState<Box[]>([])
  const [stable, setStable] = useState(0)
  const [torch, setTorch] = useState<boolean | null>(null)
  const [waited, setWaited] = useState(false)
  const found = stable >= 2 && lines.length > 0

  // The frame for the page, inside the camera view.
  const frame: Rect = { x: 24, y: 76, w: Math.max(0, size.w - 48), h: Math.max(0, size.h - 76 - 28) }

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(view.current!)
    return () => ro.disconnect()
  }, [])

  // Open the rear camera.
  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelled = false
    if (!navigator.mediaDevices?.getUserMedia) {
      setState('nocamera')
      setWhy('This browser can’t open the camera here.')
      return
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async (s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop())
        stream = s
        const v = video.current!
        v.srcObject = s
        await v.play().catch(() => null)
        track.current = s.getVideoTracks()[0]
        const caps = (track.current.getCapabilities?.() ?? {}) as MediaTrackCapabilities & { torch?: boolean }
        setTorch(caps.torch ? false : null)
        setState('live')
      })
      .catch((e: DOMException) => {
        setState('nocamera')
        setWhy(e.name === 'NotAllowedError' ? 'The camera wasn’t allowed. You can allow it in your settings, or choose a photo.' : 'No camera could be opened.')
      })
    const t = setTimeout(() => setWaited(true), 7000)
    return () => {
      cancelled = true
      clearTimeout(t)
      stream?.getTracks().forEach((tr) => tr.stop())
    }
  }, [])

  // Look for handwriting a few times a second.
  useEffect(() => {
    if (state !== 'live' || !size.w) return
    const c = document.createElement('canvas')
    const ctx = c.getContext('2d', { willReadFrequently: true })!
    let last = -1
    const id = setInterval(() => {
      const v = video.current
      if (!v || !v.videoWidth) return
      const crop = videoCrop(v, size.w, size.h, frame)
      const W = 300
      const H = Math.round((W * crop.sh) / crop.sw)
      c.width = W
      c.height = H
      ctx.drawImage(v, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, W, H)
      const boxes = detectLines(ctx.getImageData(0, 0, W, H))
      setLines(boxes)
      setStable((n) => (boxes.length && Math.abs(boxes.length - last) <= 1 ? n + 1 : 0))
      last = boxes.length
    }, 350)
    return () => clearInterval(id)
  }, [state, size.w, size.h]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTorch = async () => {
    if (torch === null || !track.current) return
    try {
      await track.current.applyConstraints({ advanced: [{ torch: !torch } as MediaTrackConstraintSet] })
      setTorch(!torch)
    } catch {
      setTorch(null)
    }
  }

  const take = useCallback(() => {
    const v = video.current
    if (!v?.videoWidth) return
    const crop = videoCrop(v, size.w, size.h, frame)
    const k = Math.min(1, 1600 / Math.max(crop.sw, crop.sh))
    const c = document.createElement('canvas')
    c.width = Math.round(crop.sw * k)
    c.height = Math.round(crop.sh * k)
    c.getContext('2d')!.drawImage(v, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, c.width, c.height)
    onShot({ canvas: c, src: toPage(c), found: lines.length })
  }, [size.w, size.h, lines.length, onShot]) // eslint-disable-line react-hooks/exhaustive-deps

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      const c = await fileToCanvas(f)
      onShot({ canvas: c, src: toPage(c), found: 0 })
    } catch {
      setWhy('That photo could not be opened.')
    }
  }

  const status = state === 'nocamera' ? 'Camera unavailable' : found ? `Handwriting found: ${lines.length} line${lines.length === 1 ? '' : 's'}` : 'Looking for handwriting…'
  const hint = state === 'nocamera' ? why : found ? 'Tap the shutter when ready.' : 'Fit your page inside the corners.'

  return (
    <main className="fixed inset-0 flex flex-col bg-[radial-gradient(ellipse_at_50%_38%,#3B3A36_0%,#1D1C1A_58%,#0F0F0E_100%)] text-paper">
      <div ref={view} className="relative min-h-0 flex-1 overflow-hidden">
        <video ref={video} playsInline muted aria-label="Camera view" className="absolute inset-0 h-full w-full object-cover" />

        {/* Dim outside the frame. */}
        {size.w > 0 && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full">
            <path fillRule="evenodd" fill="rgb(15 15 14 / 0.45)" d={`M0 0H${size.w}V${size.h}H0Z M${frame.x + 12} ${frame.y}H${frame.x + frame.w - 12}Q${frame.x + frame.w} ${frame.y} ${frame.x + frame.w} ${frame.y + 12}V${frame.y + frame.h - 12}Q${frame.x + frame.w} ${frame.y + frame.h} ${frame.x + frame.w - 12} ${frame.y + frame.h}H${frame.x + 12}Q${frame.x} ${frame.y + frame.h} ${frame.x} ${frame.y + frame.h - 12}V${frame.y + 12}Q${frame.x} ${frame.y} ${frame.x + 12} ${frame.y}Z`} />
          </svg>
        )}

        {/* Each line of handwriting, outlined. */}
        {lines.map((b, i) => (
          <span
            key={i}
            aria-hidden
            className="absolute rounded-[10px] border-2 border-[#D97706] bg-[rgb(251_191_36/0.14)] transition-all duration-300"
            style={{
              left: frame.x + b.x0 * frame.w - 6,
              top: frame.y + b.y0 * frame.h - 4,
              width: (b.x1 - b.x0) * frame.w + 12,
              height: (b.y1 - b.y0) * frame.h + 8,
              opacity: found ? 1 : 0.55,
            }}
          />
        ))}

        {size.w > 0 && <Corners r={frame} color={found ? '#FBBF24' : 'rgb(251 246 234 / 0.7)'} />}
        {state === 'live' && !found && (
          <ScanLine style={{ left: frame.x + 12, width: frame.w - 24, top: frame.y + 8, ['--travel' as string]: `${frame.h - 16}px` }} />
        )}

        <header className="absolute top-[calc(env(safe-area-inset-top)+14px)] right-4 left-4 flex items-center justify-between">
          <DarkButton type="button" aria-label="Close camera" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
              <path d="M6 6 L18 18 M18 6 L6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </DarkButton>
          <p className="m-0 text-[16px] text-[#D6D0C4]">Step 1 of 2 · Capture</p>
          {torch !== null ? (
            <DarkButton type="button" aria-label="Torch" aria-pressed={torch} onClick={toggleTorch} style={{ background: torch ? 'rgb(251 191 36 / 0.4)' : undefined }}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <path d="M13 2.5 L5.5 13.5 H11 L10 21.5 L18.5 10 H13 Z" fill={torch ? '#FBBF24' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </DarkButton>
          ) : (
            <span className="w-11" />
          )}
        </header>
      </div>

      <section aria-label="Capture" className="flex flex-col items-center gap-3.5 rounded-t-[24px] bg-paper px-6 pt-5 pb-[calc(env(safe-area-inset-bottom)+28px)] text-ink">
        <div role="status" aria-live="polite" className="flex items-center gap-2.5">
          <span aria-hidden className="grid h-7 w-7 flex-none place-items-center rounded-full" style={{ background: found ? '#2F7A4B' : '#FBBF24' }}>
            {found ? (
              <svg viewBox="0 0 20 20" width="16" height="16">
                <path d="M4 10.6 L8.2 14.6 L16.2 5.6" fill="none" stroke="#FBF6EA" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width="16" height="16">
                <circle cx="9" cy="9" r="5.5" fill="none" stroke="#1C2433" strokeWidth="2" />
                <path d="M13 13 L17 17" stroke="#1C2433" strokeWidth="2" strokeLinecap="round" />
              </svg>
            )}
          </span>
          <span className="flex flex-col">
            <span className="text-[19px] leading-tight font-extrabold tracking-[-0.02em]">{status}</span>
            <span className="text-[16px] text-ink-soft">{hint}</span>
          </span>
        </div>

        {state === 'nocamera' ? (
          <PrimaryButton type="button" onClick={() => file.current?.click()}>
            Choose a photo instead
          </PrimaryButton>
        ) : found ? (
          <button type="button" aria-label="Take photo" onClick={take} className="press grid h-[76px] w-[76px] place-items-center rounded-full border-4 border-cobalt bg-transparent p-0">
            <span className="h-[58px] w-[58px] rounded-full bg-cobalt" />
          </button>
        ) : (
          <button
            type="button"
            disabled
            aria-label="Take photo, available once handwriting is found"
            className="grid h-[76px] w-[76px] cursor-not-allowed place-items-center rounded-full border-4 border-[#C9C2B4] bg-transparent p-0"
          >
            <span className="grid h-[58px] w-[58px] place-items-center rounded-full bg-[#E4DDCF]">
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path d="M7 11 V8 A5 5 0 0 1 17 8 V11 M5.5 11 H18.5 V20.5 H5.5 Z" fill="none" stroke="#6B655C" strokeWidth="1.7" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        )}

        <p className="m-0 text-center font-serif text-[16px] text-ink-soft italic">Only pages with handwriting can be posted.</p>
        {state === 'live' && waited && !found && (
          <button type="button" onClick={take} className="min-h-[40px] border-0 bg-transparent text-[15px] text-cobalt underline underline-offset-4">
            Not found? Take the photo anyway
          </button>
        )}
        {state === 'live' && (
          <button type="button" onClick={() => file.current?.click()} className="-mt-2 min-h-[40px] border-0 bg-transparent text-[15px] text-ink-soft underline underline-offset-4">
            Choose from your photos
          </button>
        )}
        <input ref={file} type="file" accept="image/*" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </section>
    </main>
  )
}

/* ---------- Step 2 ---------- */

function Review({
  shot,
  langs,
  handName,
  label,
  onRetake,
  onKeep,
}: {
  shot: Shot
  langs: string[]
  handName: string
  label: string
  onRetake: () => void
  onKeep: (text: string, tools: { pen?: string; ink?: string; paper?: string }) => void
}) {
  const [reading, setReading] = useState<Reading | null>(null)
  const [failed, setFailed] = useState(false)
  const [text, setText] = useState('')
  const [tools, setTools] = useState({ pen: '', ink: '', paper: '' })

  useEffect(() => {
    let on = true
    readPage(shot.canvas, langs)
      .then((r) => {
        if (!on) return
        setReading(r)
        setText((t) => t || r.text)
      })
      .catch(() => on && setFailed(true))
    return () => {
      on = false
    }
  }, [shot, langs])

  const count = reading ? reading.lines.length : shot.found
  const fields = [
    { id: 'pen', label: 'Pen', ph: 'e.g. a fine fountain pen', list: PENS.map((p) => `${p.maker} ${p.name}`) },
    { id: 'ink', label: 'Ink', ph: 'e.g. blue-black', list: INKS.map((i) => `${i.maker} ${i.name}`) },
    { id: 'paper', label: 'Paper', ph: 'e.g. dot grid', list: PAPERS },
  ] as const

  return (
    <main className="flex min-h-dvh flex-col px-5 pt-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <header className="grid min-h-[58px] grid-cols-[44px_1fr_44px] items-center pt-2.5">
        <button type="button" aria-label="Retake photo" onClick={onRetake} className="press grid h-11 w-11 place-items-center rounded-[14px] border-0 bg-tint">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
            <path d="M10.5 2.5 L4.5 8 L10.5 13.5" fill="none" stroke="#1C2433" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="m-0 text-[20px] leading-tight font-extrabold tracking-[-0.02em]">Your page</h1>
          <p className="m-0 text-[14px] text-ink-soft">Step 2 of 2</p>
        </div>
        <span />
      </header>

      <div className="mt-2.5 grid grid-cols-[128px_minmax(0,1fr)] items-start gap-3.5">
        <img src={shot.src} alt={`Your photo: ${label}`} className="block h-[150px] w-[128px] rounded-[12px] object-cover shadow-[0_1px_2px_rgb(60_45_20/0.15),0_6px_14px_rgb(60_45_20/0.12)]" />
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1 self-start rounded-[10px] px-2.5 py-0.5 text-[15px]" style={{ background: reading ? 'rgb(47 122 75 / 0.12)' : 'rgb(120 98 60 / 0.1)', color: reading ? '#2F6A44' : '#57534E' }}>
            {reading ? (
              <>
                <svg viewBox="0 0 20 20" width="14" height="14" aria-hidden>
                  <path d="M4 10.6 L8.2 14.6 L16.2 5.6" fill="none" stroke="#2F6A44" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {count} line{count === 1 ? '' : 's'} read
              </>
            ) : failed ? (
              'Couldn’t read it'
            ) : (
              'Reading the page…'
            )}
          </span>
          <span className="self-start rounded-[10px] bg-[rgb(30_58_95/0.1)] px-2.5 py-0.5 text-[15px] text-cobalt">{handName}</span>
          <button type="button" onClick={onRetake} className="flex min-h-[44px] items-center self-start border-0 bg-transparent p-0 text-[16px] text-cobalt underline underline-offset-4">
            Retake photo
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-1.5">
        <label htmlFor="ocr-text" className="text-[17px]">
          What we read
        </label>
        <textarea
          id="ocr-text"
          rows={Math.min(7, Math.max(3, text.split('\n').length))}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={reading || failed ? 'Type what you wrote' : 'Reading…'}
          className="min-h-[76px] resize-none rounded-[12px] border-0 bg-tint px-3 py-2.5 text-[18px] leading-snug text-ink"
        />
        <p className="m-0 text-[14px] text-ink-soft">{failed ? 'The reader couldn’t open. Type it in, or leave it empty.' : 'Fix anything we misread. Handwriting is hard to read.'}</p>
      </div>

      <section aria-labelledby="tools-h" className="mt-3.5 flex flex-col gap-2">
        <h2 id="tools-h" className="m-0 text-[18px] font-extrabold tracking-[-0.02em]">
          Pen, ink and paper <em className="font-serif text-[16px] font-normal tracking-normal text-ink-soft">optional</em>
        </h2>
        {fields.map((f) => (
          <label key={f.id} className="flex min-h-[50px] items-center gap-2.5 rounded-[12px] bg-tint px-3">
            <span className="w-11 flex-none text-[16px] text-ink-soft">{f.label}</span>
            <input
              list={`list-${f.id}`}
              value={tools[f.id]}
              onChange={(e) => setTools((t) => ({ ...t, [f.id]: e.target.value }))}
              placeholder={f.ph}
              autoComplete="off"
              className="min-h-[46px] min-w-0 flex-1 border-0 bg-transparent p-0 text-[18px] text-ink outline-none"
            />
            <datalist id={`list-${f.id}`}>
              {f.list.map((o) => (
                <option key={o} value={o} />
              ))}
            </datalist>
          </label>
        ))}
        <p className="m-0 text-[14px] text-ink-soft">Choose a suggestion or type your own.</p>
      </section>

      <div className="mt-auto pt-6">
        <PrimaryButton
          type="button"
          className="w-full"
          onClick={() =>
            onKeep(text.trim(), {
              pen: tools.pen.trim() || undefined,
              ink: tools.ink.trim() || undefined,
              paper: tools.paper.trim() || undefined,
            })
          }
        >
          Keep in My pages
        </PrimaryButton>
        <p className="m-0 mt-2 text-center text-[14px] text-ink-soft">Sharing to The greatest achievement opens soon.</p>
      </div>
    </main>
  )
}
