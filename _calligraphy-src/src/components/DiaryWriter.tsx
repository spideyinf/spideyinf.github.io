import { useEffect, useMemo, useRef, useState } from 'react'
import { bounds, inkStep, type Glyph, type InkPt, type Style } from '../lib/ductus'
import { ITALIC_CAPITALS, ITALIC_LOWERCASE, ITALIC_PUNCTUATION } from '../lib/ductus-modern'
import { finishStroke, paintStroke, PAPERS } from '../lib/pen'

// Writing that appears on the page by itself, stroke by stroke, as if an
// unseen hand were holding the pen: the italic hand's real strokes, laid
// down in iron-gall ink that goes on blue and wet and darkens as it dries.

const STYLE: Style = { slant: 83, shade: 0, edge: { width: 0.13, angle: 40 } }
const PAPER = PAPERS[0] // aged, absorbent paper: a soft edge where ink meets fibre
const WET = '#2d56b0'
const DRY = '#1d2436'
const SPEED = 62 // x-heights per second along the stroke
const DRY_AFTER = 1300 // ms after a line is finished

type Stroke = { pts: InkPt[]; dot: boolean; start: number; dur: number; line: number }

const glyphOf = (ch: string): Glyph | undefined => ITALIC_CAPITALS[ch] ?? ITALIC_LOWERCASE[ch] ?? ITALIC_PUNCTUATION[ch]

/** A small seeded random, so the hand wobbles the same way every time. */
function seeded(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function DiaryWriter({
  paragraphs,
  sign,
  instant,
  sinking,
  onDone,
}: {
  paragraphs: string[]
  sign?: string
  instant?: boolean
  /** Close the letter: the ink sinks into the paper. */
  sinking?: boolean
  onDone?: () => void
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const dryRef = useRef<HTMLCanvasElement>(null)
  const wetRef = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width)))
    ro.observe(wrap.current!)
    return () => ro.disconnect()
  }, [])

  // Every stroke of the letter: where it lies and when the pen draws it.
  const plan = useMemo(() => {
    if (!width) return null
    const xh = Math.max(9, Math.min(12, width / 31))
    const lh = xh * 3.7
    const advance = (g: Glyph) => bounds(g, STYLE.slant).width * xh + xh * 0.2
    const space = xh * 0.75
    const rand = seeded(7)
    const strokes: Stroke[] = []
    let t = 500
    let y = xh * 2.6
    let line = 0

    const writeWord = (word: string, x: number) => {
      for (const ch of word) {
        const g = glyphOf(ch)
        if (!g) {
          x += space
          continue
        }
        // A real hand never makes the same letter twice.
        const k = 1 + (rand() - 0.5) * 0.06
        const dy = (rand() - 0.5) * xh * 0.08
        const b = bounds(g, STYLE.slant)
        const ox = x - b.minX * xh * k
        for (const st of g.steps) {
          const pts = inkStep(st, ox, y + dy, xh * k, STYLE)
          let len = 0
          for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y)
          const dur = st.dot ? 40 : Math.max(32, (len / (xh * SPEED)) * 1000)
          strokes.push({ pts, dot: !!st.dot, start: t, dur, line })
          t += dur + (st.join ? 0 : 14)
        }
        t += 8
        x += advance(g) * k
      }
      return x
    }
    const measure = (word: string) => [...word].reduce((w, ch) => w + (glyphOf(ch) ? advance(glyphOf(ch)!) : space), 0)

    const usable = width - 8
    for (const para of paragraphs) {
      let x = 4
      for (const word of para.split(/\s+/).filter(Boolean)) {
        const w = measure(word)
        if (x > 4 && x + w > usable) {
          x = 4
          y += lh
          line++
          t += 200
        }
        x = writeWord(word, x) + space
        t += 60
      }
      y += lh * 1.25
      line++
      t += 300
    }
    if (sign) {
      writeWord(sign, Math.max(4, usable - measure(sign)))
      y += lh
      line++
    }
    const lineEnds: number[] = []
    for (const s of strokes) lineEnds[s.line] = Math.max(lineEnds[s.line] ?? 0, s.start + s.dur)
    return { strokes, height: Math.ceil(y), end: t, lineEnds }
  }, [width, paragraphs, sign])

  useEffect(() => {
    const dry = dryRef.current
    const wet = wetRef.current
    if (!plan || !dry || !wet) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    for (const c of [dry, wet]) {
      c.width = width * dpr
      c.height = plan.height * dpr
      c.style.height = `${plan.height}px`
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const dctx = dry.getContext('2d')!
    const wctx = wet.getContext('2d')!
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const t0 = performance.now()
    const drawn = new Map<Stroke, number>()
    const dried = new Set<number>()
    let finished = false
    let raf = 0

    const paint = (ctx: CanvasRenderingContext2D, s: Stroke, color: string, upto: number, from = 0) => {
      if (s.dot) {
        const p = s.pts[0]
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.w / 2, 0, Math.PI * 2)
        ctx.fill()
        return
      }
      const stroke = { color, pts: s.pts.slice(0, upto) }
      paintStroke(ctx, stroke, PAPER, from)
      if (upto >= s.pts.length) finishStroke(ctx, stroke, PAPER)
    }

    const frame = (now: number) => {
      const t = instant || skip || reduce ? Infinity : now - t0
      // Lines that have had time to dry settle onto the page in their dry colour.
      let redrawWet = false
      plan.lineEnds.forEach((endAt, line) => {
        if (dried.has(line) || t < endAt + DRY_AFTER) return
        dried.add(line)
        redrawWet = true
        for (const s of plan.strokes) if (s.line === line) paint(dctx, s, DRY, s.pts.length)
      })
      if (redrawWet) {
        wctx.clearRect(0, 0, width, plan.height)
        for (const [s, n] of drawn) if (!dried.has(s.line)) paint(wctx, s, WET, n)
      }
      // The pen, still moving: new ink goes on wet.
      for (const s of plan.strokes) {
        if (s.start > t) break
        if (dried.has(s.line)) continue
        const n = Math.max(1, Math.round(s.pts.length * Math.min(1, (t - s.start) / s.dur)))
        const had = drawn.get(s) ?? 0
        if (n <= had) continue
        paint(wctx, s, WET, n, Math.max(0, had - 1))
        drawn.set(s, n)
      }
      if (!finished && t >= plan.end) {
        finished = true
        onDone?.()
      }
      if (dried.size < plan.lineEnds.length) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [plan, width, instant, skip, onDone])

  return (
    <div
      ref={wrap}
      onClick={() => setSkip(true)}
      className="relative transition-[opacity,filter] ease-in"
      style={{ transitionDuration: '1800ms', opacity: sinking ? 0 : 1, filter: sinking ? 'blur(1.5px)' : 'none' }}
    >
      <canvas ref={dryRef} className="block w-full mix-blend-multiply" role="img" aria-label={[...paragraphs, sign].join(' ')} />
      <canvas ref={wetRef} className="absolute inset-0 block w-full mix-blend-multiply" aria-hidden />
    </div>
  )
}
