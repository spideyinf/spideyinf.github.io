import { useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadHand, measureHand, wrapHand, type Metrics } from '../lib/hand'
import { inkAt, type InkStroke } from '../lib/pen'
import { PREFACE_FONT, type Preface } from '../lib/prefaces'
import { usePen } from '../state/pen'

// A preface, written out on the page at the pace of a hand, in your pen's ink.
// Each line is revealed behind a moving nib; iron-gall ink starts blue and darkens.

const CPS = 30 // characters per second: a calm writing pace
const LINE_PAUSE = 140
const PARA_PAUSE = 420

const Wrap = styled.div`
  position: relative;
  padding: 0 14px;
  canvas {
    display: block;
    width: 100%;
    mix-blend-mode: multiply;
  }
`

type Line = { text: string; x: number; y: number; size: number; start: number; dur: number }

export function PrefaceWriter({ preface, instant, onDone }: { preface: Preface; instant?: boolean; onDone?: () => void }) {
  const { ink, paper } = usePen()
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(0)
  const [m, setM] = useState<Metrics | null>(null)
  const [skip, setSkip] = useState(false)
  const t0 = useRef(0)
  const done = useRef(false)

  useEffect(() => {
    loadHand(PREFACE_FONT).then(setM)
  }, [])
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setWidth(Math.round(e.contentRect.width) - 28))
    ro.observe(wrap.current!)
    return () => ro.disconnect()
  }, [])

  // Lay out every line and when the pen reaches it.
  const layout = useMemo(() => {
    if (!m || width <= 0) return null
    const ctx = document.createElement('canvas').getContext('2d')!
    const body = Math.min(19, Math.max(16, width / 19))
    const xh = body * m.xRatio
    const titleXh = xh * 1.45
    const lh = body * 1.85
    const lines: Line[] = []
    let y = titleXh / m.xRatio
    let t = 300
    const push = (text: string, size: number, x: number) => {
      const dur = (text.length / CPS) * 1000
      lines.push({ text, x, y, size, start: t, dur })
      t += dur + LINE_PAUSE
    }
    push(preface.title, titleXh, 0)
    y += lh * 1.25
    t += PARA_PAUSE
    for (const para of preface.body) {
      for (const text of wrapHand(ctx, m, para, xh, width)) {
        push(text, xh, 0)
        y += lh
      }
      y += lh * 0.45
      t += PARA_PAUSE
    }
    if (preface.sign) {
      const w = measureHand(ctx, m, preface.sign, xh)
      push(preface.sign, xh, Math.max(0, width - w))
      y += lh
    }
    return { lines, height: Math.ceil(y + lh * 0.3), end: t }
  }, [m, width, preface])

  // Draw loop.
  useEffect(() => {
    const c = canvas.current
    if (!c || !layout || !m) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    c.width = width * dpr
    c.height = layout.height * dpr
    c.style.height = `${layout.height}px`
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const fast = instant || skip || reduce
    t0.current ||= performance.now()
    done.current = false
    const stroke = { color: ink.color, wet: ink.wet, pts: [] } as InkStroke
    let raf = 0

    const frame = (now: number) => {
      const t = fast ? Infinity : now - t0.current
      ctx.clearRect(0, 0, width, layout.height)
      let head: { x: number; y: number } | null = null
      for (const l of layout.lines) {
        const p = Math.max(0, Math.min(1, (t - l.start) / l.dur))
        if (p <= 0) break
        const full = measureHand(ctx, m, l.text, l.size)
        // Ink is wet while being written and dries after the line is finished.
        const age = t === Infinity ? Infinity : t - (l.start + l.dur)
        ctx.fillStyle = inkAt(stroke, paper, Math.max(0, age)).color
        ctx.font = `${(l.size / m.xRatio).toFixed(2)}px "${m.font}"`
        ctx.save()
        ctx.beginPath()
        ctx.rect(l.x - 4, l.y - l.size * 3.2, full * p + 6, l.size * 5.2)
        ctx.clip()
        ctx.fillText(l.text, l.x, l.y)
        ctx.restore()
        if (p < 1) head = { x: l.x + full * p, y: l.y - l.size * 0.45 }
      }
      if (head) {
        // The nib, just ahead of the ink.
        ctx.fillStyle = inkAt(stroke, paper, 0).color
        ctx.beginPath()
        ctx.arc(head.x + 2, head.y, 2.4, 0, Math.PI * 2)
        ctx.fill()
        // Keep the writing in view on small screens.
        const r = c.getBoundingClientRect()
        const screenY = r.top + head.y
        if (screenY > window.innerHeight - 140) window.scrollBy({ top: screenY - (window.innerHeight - 220), behavior: 'smooth' })
      }
      const dryUntil = layout.end + paper.dry
      if (t < dryUntil) raf = requestAnimationFrame(frame)
      if (t >= layout.end && !done.current) {
        done.current = true
        onDone?.()
      }
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [layout, m, width, ink, paper, instant, skip, onDone])

  return (
    <Wrap ref={wrap} onClick={() => setSkip(true)}>
      <canvas ref={canvas} role="img" aria-label={`${preface.title}. ${preface.body.join(' ')} ${preface.sign ?? ''}`} />
    </Wrap>
  )
}
