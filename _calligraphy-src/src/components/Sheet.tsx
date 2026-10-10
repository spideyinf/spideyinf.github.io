import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import styled from 'styled-components'
import { loadHand, type Metrics } from '../lib/hand'
import { finishStroke, INK_OPACITY, INKS, NIBS, paintStroke, sample, type InkStroke, type PenSettings } from '../lib/pen'
import { drawSheet, rowAt, type SheetLayout } from '../lib/sheet'
import { theme } from '../theme'

// Ink survives moving between letters/pages within a session.
const inkByPage = new Map<string, InkStroke[]>()

export type SheetHandle = {
  undo: () => void
  clear: () => void
  hasInk: () => boolean
  snapshot: () => string | null
}

type Props = {
  pageKey: string
  showModel: boolean
  pen: PenSettings
  build: (ctx: CanvasRenderingContext2D, m: Metrics, width: number, height: number) => SheetLayout
  onInkChange?: (hasInk: boolean) => void
  ref?: Ref<SheetHandle>
}

const Wrap = styled.div`
  position: relative;
  flex: 1;
  min-height: 0;
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  /* The wet stroke under the nib blends the same way dried ink does. */
  /* Ink sits in the paper: guidelines stay visible through it. */
  canvas[data-ink] {
    mix-blend-mode: multiply;
  }
  canvas[data-live] {
    opacity: ${INK_OPACITY};
    mix-blend-mode: multiply;
    pointer-events: none;
  }
  canvas[data-input] {
    touch-action: none;
    cursor: crosshair;
  }
`

const PAPER = theme.color.paper

export function Sheet({ pageKey, showModel, pen, build, onInkChange, ref }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const liveRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<HTMLCanvasElement | null>(null)
  const layoutRef = useRef<SheetLayout | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const live = useRef<{ stroke: InkStroke; w: number; d: number; t: number } | null>(null)

  const strokes = useCallback(() => {
    if (!inkByPage.has(pageKey)) inkByPage.set(pageKey, [])
    return inkByPage.get(pageKey)!
  }, [pageKey])

  useEffect(() => {
    loadHand().then(setMetrics)
  }, [])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) })
    })
    ro.observe(wrapRef.current!)
    return () => ro.disconnect()
  }, [])

  /** Paint one finished stroke and layer it onto the page with multiply, like ink on ink. */
  const commit = useCallback(
    (s: InkStroke) => {
      const ink = inkRef.current?.getContext('2d')
      const buf = bufferRef.current?.getContext('2d')
      if (!ink || !buf) return
      buf.clearRect(0, 0, size.w, size.h)
      paintStroke(buf, s, PAPER)
      finishStroke(buf, s, PAPER)
      ink.save()
      ink.globalAlpha = INK_OPACITY
      ink.globalCompositeOperation = 'multiply'
      ink.drawImage(bufferRef.current!, 0, 0, size.w, size.h)
      ink.restore()
    },
    [size],
  )

  const redrawInk = useCallback(() => {
    const ctx = inkRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size.w, size.h)
    for (const s of strokes()) commit(s)
    onInkChange?.(strokes().length > 0)
  }, [commit, strokes, size, onInkChange])

  // Size the canvases for the device pixel ratio, lay out and paint the sheet.
  useEffect(() => {
    const g = guideRef.current
    if (!g || !metrics || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    bufferRef.current ??= document.createElement('canvas')
    for (const c of [g, inkRef.current!, liveRef.current!, bufferRef.current]) {
      c.width = size.w * dpr
      c.height = size.h * dpr
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ctx = g.getContext('2d')!
    const layout = build(ctx, metrics, size.w, size.h)
    layoutRef.current = layout
    ctx.clearRect(0, 0, size.w, size.h)
    drawSheet(ctx, metrics, layout, showModel)
    redrawInk()
  }, [metrics, size, build, showModel, redrawInk])

  const nib = NIBS.find((n) => n.id === pen.nib) ?? NIBS[1]
  const color = INKS.find((i) => i.id === pen.ink)?.color ?? INKS[0].color

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 || live.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const xh = rowAt(layoutRef.current, y)?.xh ?? 18
    const { w } = sample(nib, xh, 0, 0, 16, e.pressure, e.pointerType === 'pen')
    const stroke: InkStroke = { color, pts: [{ x, y, w, d: 1 }] }
    live.current = { stroke, w, d: 1, t: e.timeStamp }
    paintStroke(liveRef.current!.getContext('2d')!, stroke, PAPER)
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    const r = e.currentTarget.getBoundingClientRect()
    const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? []
    const events = coalesced.length ? coalesced : [e.nativeEvent]
    const from = cur.stroke.pts.length
    for (const ev of events) {
      const x = ev.clientX - r.left
      const y = ev.clientY - r.top
      const last = cur.stroke.pts[cur.stroke.pts.length - 1]
      const dx = x - last.x
      const dy = y - last.y
      if (dx * dx + dy * dy < 1.2) continue
      const xh = rowAt(layoutRef.current, y)?.xh ?? 18
      const target = sample(nib, xh, dx, dy, ev.timeStamp - cur.t, ev.pressure, ev.pointerType === 'pen')
      cur.t = ev.timeStamp
      // Ease width and density so the line breathes instead of jittering.
      cur.w += (target.w - cur.w) * (nib.flex ? 0.32 : 0.22)
      cur.d += (target.d - cur.d) * 0.2
      cur.stroke.pts.push({ x, y, w: cur.w, d: cur.d })
    }
    if (cur.stroke.pts.length > from) paintStroke(liveRef.current!.getContext('2d')!, cur.stroke, PAPER, from)
  }

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    live.current = null
    // Resting before lifting lets ink pool at the end of the stroke.
    const last = cur.stroke.pts[cur.stroke.pts.length - 1]
    if (e.timeStamp - cur.t > 140) {
      last.d = 1
      cur.stroke.pool = true
    }
    liveRef.current!.getContext('2d')!.clearRect(0, 0, size.w, size.h)
    strokes().push(cur.stroke)
    commit(cur.stroke)
    onInkChange?.(true)
  }

  useImperativeHandle(
    ref,
    () => ({
      undo: () => {
        strokes().pop()
        redrawInk()
      },
      clear: () => {
        inkByPage.set(pageKey, [])
        redrawInk()
      },
      hasInk: () => strokes().length > 0,
      snapshot: () => {
        const g = guideRef.current
        const k = inkRef.current
        if (!g || !k || !size.w) return null
        // A small JPEG keeps a month of pages within localStorage.
        const scale = Math.min(1.5, 720 / size.w)
        const c = document.createElement('canvas')
        c.width = Math.round(size.w * scale)
        c.height = Math.round(size.h * scale)
        const ctx = c.getContext('2d')!
        ctx.fillStyle = PAPER
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(g, 0, 0, c.width, c.height)
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(k, 0, 0, c.width, c.height)
        return c.toDataURL('image/jpeg', 0.75)
      },
    }),
    [pageKey, redrawInk, size, strokes],
  )

  return (
    <Wrap ref={wrapRef}>
      <canvas ref={guideRef} aria-hidden />
      <canvas ref={inkRef} data-ink aria-hidden />
      <canvas ref={liveRef} data-live aria-hidden />
      <canvas
        data-input
        role="img"
        aria-label="Writing area. Write with your finger or a stylus."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        width={1}
        height={1}
      />
    </Wrap>
  )
}
