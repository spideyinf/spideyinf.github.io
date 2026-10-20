import { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import type { Trace } from '../lib/trace'
import { mixHex } from '../lib/sheet'
import { theme } from '../theme'
import { IconButton, Icons } from './ui'

const PlayButton = styled.button`
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.ink};
  color: ${({ theme }) => theme.color.paper};
  &:active {
    transform: scale(0.94);
  }
  &:disabled {
    opacity: 0.4;
  }
`

const INK = theme.color.ink
const RED = theme.color.vermilion
const NOTE = theme.color.note
const GHOST = mixHex(INK, NOTE, 0.16)

export type Frame = { minX: number; maxX: number; top: number; bottom: number }

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/**
 * Plays a trace: the real letter appears stroke by stroke, in red where the
 * pen is moving, in ink once written, over a faint copy of the whole letter.
 * `frame` (x-height units) keeps several letters at one scale.
 */
export function TraceView({
  trace,
  frame,
  slant = 55,
  height = 190,
  status,
  autoplay,
}: {
  trace: Trace | null
  frame?: Frame
  slant?: number
  height?: number
  /** Shown while there's no trace yet, or on error. */
  status?: string
  autoplay?: boolean
}) {
  const n = trace?.strokes.length ?? 0
  const [done, setDone] = useState(n)
  const [anim, setAnim] = useState<{ step: number; u: number } | null>(null)
  const [playing, setPlaying] = useState(false)
  const [w, setW] = useState(0)
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const layer = useRef<HTMLCanvasElement | null>(null)
  const maskC = useRef<HTMLCanvasElement | null>(null)
  const raf = useRef(0)
  const timer = useRef(0)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)))
    ro.observe(stage.current!)
    return () => ro.disconnect()
  }, [])

  // A new letter starts fully written, ready to play.
  const [seen, setSeen] = useState<Trace | null>(null)
  if (trace !== seen) {
    setSeen(trace)
    setDone(trace?.strokes.length ?? 0)
    setAnim(null)
    setPlaying(false)
  }

  const layout = useCallback(() => {
    if (!trace || !w) return null
    const f = frame ?? trace.box
    const T = Math.max(f.top, 2.1) + 0.12
    const B = Math.max(-f.bottom, 1.05) + 0.12
    const xh = Math.min((height - 12) / (T + B), (w - 28) / (f.maxX - f.minX + 0.2))
    const baseline = 6 + T * xh + (height - 12 - (T + B) * xh) / 2
    const b = trace.box
    const ox = (w - (b.maxX - b.minX) * xh) / 2 - b.minX * xh
    return { xh, baseline, ox, s: xh / trace.xh }
  }, [trace, frame, w, height])

  const paint = useCallback(() => {
    const c = canvas.current
    if (!c || !w) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(height * dpr)) {
      c.width = Math.round(w * dpr)
      c.height = Math.round(height * dpr)
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, height)
    const L = layout()
    if (!trace || !L) return
    const { xh, baseline, ox, s } = L

    // Guidelines: capital line, waistline, baseline, descender line, and the slant.
    const rule = (y: number, a: number, dash: number[] = []) => {
      ctx.setLineDash(dash)
      ctx.strokeStyle = `rgb(47 62 107 / ${a})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(w, Math.round(y) + 0.5)
      ctx.stroke()
    }
    const top = baseline - 2.1 * xh
    const bottom = baseline + 1.05 * xh
    const run = (bottom - top) / Math.tan((slant * Math.PI) / 180)
    ctx.strokeStyle = 'rgb(47 62 107 / 0.08)'
    for (let x = -run; x < w + run; x += xh * 1.2) {
      ctx.beginPath()
      ctx.moveTo(x, bottom)
      ctx.lineTo(x + run, top)
      ctx.stroke()
    }
    rule(top, 0.18, [3, 4])
    rule(baseline - xh, 0.3)
    rule(baseline, 0.55)
    rule(bottom, 0.18, [3, 4])
    ctx.setLineDash([])

    // Off-screen: one layer at screen size, one mask on the trace's grid.
    const lc = (layer.current ??= document.createElement('canvas'))
    if (lc.width !== c.width || lc.height !== c.height) {
      lc.width = c.width
      lc.height = c.height
    }
    const mc = (maskC.current ??= document.createElement('canvas'))
    if (mc.width !== trace.w || mc.height !== trace.h) {
      mc.width = trace.w
      mc.height = trace.h
    }
    const lx = lc.getContext('2d')!
    const mx = mc.getContext('2d')!
    const drawLayer = (color: string, test: ((owner: number, at: number) => number) | null) => {
      lx.setTransform(1, 0, 0, 1, 0, 0)
      lx.globalCompositeOperation = 'source-over'
      lx.clearRect(0, 0, lc.width, lc.height)
      lx.setTransform(dpr, 0, 0, dpr, 0, 0)
      trace.paint(lx, ox, baseline, xh)
      lx.globalCompositeOperation = 'source-in'
      lx.fillStyle = color
      lx.fillRect(0, 0, w, height)
      if (test) {
        const img = mx.createImageData(trace.w, trace.h)
        const d = img.data
        let any = false
        for (let j = 0; j < trace.w * trace.h; j++) {
          const o = trace.owner[j]
          if (o < 0) continue
          const a = test(o, trace.at[j])
          if (a > 0) {
            d[j * 4 + 3] = a
            any = true
          }
        }
        if (!any) return
        mx.putImageData(img, 0, 0)
        lx.globalCompositeOperation = 'destination-in'
        lx.imageSmoothingEnabled = true
        lx.drawImage(mc, ox - trace.ox * s, baseline - trace.base * s, trace.w * s, trace.h * s)
      }
      lx.globalCompositeOperation = 'source-over'
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(lc, 0, 0)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const toScreen = ([x, y]: [number, number]) => [ox + (x - trace.ox) * s, baseline + (y - trace.base) * s] as const

    const written = anim ? anim.step : done
    if (written < n || anim) drawLayer(GHOST, null)
    if (written >= n && !anim) drawLayer(INK, null)
    else if (written > 0) drawLayer(INK, (o) => (o < written ? 255 : 0))
    if (anim) {
      const soft = 3
      drawLayer(RED, (o, at) => (o === anim.step ? Math.max(0, Math.min(255, ((anim.u - at) / soft + 1) * 255)) : 0))
      // The nib, at the head of the stroke.
      const st = trace.strokes[anim.step]
      if (!st.dot) {
        let acc = 0
        let head = st.pts[0]
        const target = Math.min(st.len, anim.u)
        for (let i = 1; i < st.pts.length; i++) {
          acc += Math.hypot(st.pts[i][0] - st.pts[i - 1][0], st.pts[i][1] - st.pts[i - 1][1])
          head = st.pts[i]
          if (acc >= target) break
        }
        const [hx, hy] = toScreen(head)
        ctx.fillStyle = RED
        ctx.beginPath()
        ctx.arc(hx, hy, Math.max(3, xh * 0.08), 0, Math.PI * 2)
        ctx.fill()
      }
    } else if (done < n) {
      // Where the next stroke begins.
      const [px, py] = toScreen(trace.strokes[done].pts[0])
      const r = Math.max(9, xh * 0.28)
      ctx.fillStyle = RED
      ctx.beginPath()
      ctx.arc(px, py, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = NOTE
      ctx.font = `600 ${Math.round(r * 1.1)}px ${theme.font.sans}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(done + 1), px, py + 0.5)
      ctx.textAlign = 'start'
      ctx.textBaseline = 'alphabetic'
    }
  }, [trace, w, height, layout, slant, done, n, anim])

  useEffect(paint, [paint])

  /** Animate stroke `i`, then call `then`. */
  const write = useCallback(
    (i: number, then?: () => void) => {
      if (!trace) return
      cancelAnimationFrame(raf.current)
      const st = trace.strokes[i]
      const ms = reduced() ? 1 : Math.max(st.dot ? 240 : 420, (st.dur / (trace.xh * 3.2)) * 1000)
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms)
        // Like a hand: a slow start, a steady middle, a gentle stop.
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        setAnim({ step: i, u: e * st.dur + (t >= 1 ? 4 : 0) })
        if (t < 1) raf.current = requestAnimationFrame(tick)
        else {
          setAnim(null)
          setDone(i + 1)
          then?.()
        }
      }
      raf.current = requestAnimationFrame(tick)
    },
    [trace],
  )

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current)
    clearTimeout(timer.current)
    setPlaying(false)
    setAnim(null)
  }, [])

  useEffect(() => stop, [stop, trace])

  const play = useCallback(() => {
    if (!trace) return
    setPlaying(true)
    setDone(0)
    const run = (i: number) => {
      if (i >= n) return setPlaying(false)
      write(i, () => {
        const pause = reduced() ? 500 : trace.strokes[i + 1]?.join ? 60 : 280
        timer.current = window.setTimeout(() => run(i + 1), pause)
      })
    }
    run(0)
  }, [trace, n, write])

  useEffect(() => {
    if (autoplay && trace) play()
  }, [autoplay, trace, play])

  const next = () => {
    stop()
    const i = done >= n ? 0 : done
    if (done >= n) setDone(0)
    write(i)
  }
  const prev = () => {
    stop()
    setDone((d) => Math.max(0, (d >= n ? n : d) - 1))
  }

  const current = anim ? anim.step : done - 1
  const label = !trace
    ? status ?? 'Reading the letter…'
    : !n
      ? 'Nothing to trace in this letter.'
      : current >= 0 && current < n
        ? `Step ${current + 1} of ${n}: ${trace.strokes[current].name}`
        : `${n} stroke${n === 1 ? '' : 's'}. Tap next to write the first.`

  return (
    <>
      <div ref={stage} className="relative" style={{ height }}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" role="img" aria-label={label} />
      </div>
      <div className="flex items-center gap-1 px-[6px]">
        <IconButton label="Previous stroke" onClick={prev} disabled={!n || (done === 0 && !anim)}>
          {Icons.prev}
        </IconButton>
        <PlayButton type="button" onClick={playing ? stop : play} disabled={!n} aria-label={playing ? 'Pause' : 'Play all strokes'}>
          {playing ? Icons.pause : Icons.play}
        </PlayButton>
        <IconButton label="Next stroke" onClick={next} disabled={!n}>
          {Icons.next}
        </IconButton>
        <p className="m-0 ml-2 min-w-0 flex-1 font-sans text-[12.5px] leading-snug text-ink-soft" aria-live="polite">
          {label}
        </p>
      </div>
    </>
  )
}
