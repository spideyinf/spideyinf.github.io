import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import styled from 'styled-components'
import { loadHand, type Metrics } from '../lib/hand'
import { drawSheet, rowAt, type SheetLayout } from '../lib/sheet'
import { theme } from '../theme'

type Pt = { x: number; y: number; w: number }
type Stroke = Pt[]

// Ink survives moving between letters/pages within a session.
const inkByPage = new Map<string, Stroke[]>()

export type SheetHandle = {
  undo: () => void
  clear: () => void
  hasInk: () => boolean
  snapshot: () => string | null
}

type Props = {
  pageKey: string
  showModel: boolean
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
  canvas:last-child {
    touch-action: none;
    cursor: crosshair;
  }
`

function strokeSegment(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, c: Pt) {
  // Quadratic through midpoints keeps the line smooth at any sampling rate.
  ctx.lineWidth = (a.w + b.w + c.w) / 3
  ctx.beginPath()
  ctx.moveTo((a.x + b.x) / 2, (a.y + b.y) / 2)
  ctx.quadraticCurveTo(b.x, b.y, (b.x + c.x) / 2, (b.y + c.y) / 2)
  ctx.stroke()
}

function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke) {
  if (s.length === 1) {
    ctx.beginPath()
    ctx.arc(s[0].x, s[0].y, s[0].w / 2, 0, Math.PI * 2)
    ctx.fill()
    return
  }
  const pts = [s[0], ...s, s[s.length - 1]]
  for (let i = 1; i < pts.length - 1; i++) strokeSegment(ctx, pts[i - 1], pts[i], pts[i + 1])
}

export function Sheet({ pageKey, showModel, build, onInkChange, ref }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const layoutRef = useRef<SheetLayout | null>(null)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const live = useRef<{ stroke: Stroke; w: number } | null>(null)

  const strokes = useCallback(() => {
    if (!inkByPage.has(pageKey)) inkByPage.set(pageKey, [])
    return inkByPage.get(pageKey)!
  }, [pageKey])

  useEffect(() => {
    loadHand().then(setMetrics)
  }, [])

  useEffect(() => {
    const el = wrapRef.current!
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const inkCtx = useCallback(() => {
    const ctx = inkRef.current!.getContext('2d')!
    ctx.strokeStyle = ctx.fillStyle = theme.color.ink
    ctx.lineCap = ctx.lineJoin = 'round'
    return ctx
  }, [])

  const redrawInk = useCallback(() => {
    const c = inkRef.current
    if (!c) return
    const ctx = inkCtx()
    ctx.clearRect(0, 0, c.width, c.height)
    for (const s of strokes()) drawStroke(ctx, s)
    onInkChange?.(strokes().length > 0)
  }, [inkCtx, strokes, onInkChange])

  // Size both canvases for the device pixel ratio, lay out and paint the sheet.
  useEffect(() => {
    const g = guideRef.current
    const k = inkRef.current
    if (!g || !k || !metrics || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    for (const c of [g, k]) {
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

  // Pointed-pen ink: swell on downstrokes, hairline on upstrokes.
  const penWidth = (dx: number, dy: number, y: number, pressure: number, isPen: boolean) => {
    const xh = rowAt(layoutRef.current, y)?.xh ?? 20
    const hair = Math.max(1, xh * 0.045)
    const shade = xh * 0.24
    const len = Math.hypot(dx, dy) || 1
    const down = Math.max(0, dy / len)
    let w = hair + shade * Math.pow(down, 1.4)
    if (isPen && pressure > 0) w *= 0.45 + pressure * 1.1
    return w
  }

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const w = penWidth(0, 0, y, e.pressure, e.pointerType === 'pen')
    live.current = { stroke: [{ x, y, w }], w }
    strokes().push(live.current.stroke)
    const ctx = inkCtx()
    ctx.beginPath()
    ctx.arc(x, y, w / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    const r = e.currentTarget.getBoundingClientRect()
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
    const ctx = inkCtx()
    for (const ev of events.length ? events : [e.nativeEvent]) {
      const x = ev.clientX - r.left
      const y = ev.clientY - r.top
      const last = cur.stroke[cur.stroke.length - 1]
      const dx = x - last.x
      const dy = y - last.y
      if (dx * dx + dy * dy < 1.5) continue
      const target = penWidth(dx, dy, y, ev.pressure, ev.pointerType === 'pen')
      cur.w += (target - cur.w) * 0.32
      const p = { x, y, w: cur.w }
      cur.stroke.push(p)
      const s = cur.stroke
      const a = s[s.length - 3] ?? s[0]
      strokeSegment(ctx, a, s[s.length - 2], p)
    }
  }

  const onUp = () => {
    if (!live.current) return
    live.current = null
    redrawInk()
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
        ctx.fillStyle = theme.color.paper
        ctx.fillRect(0, 0, c.width, c.height)
        ctx.drawImage(g, 0, 0, c.width, c.height)
        ctx.drawImage(k, 0, 0, c.width, c.height)
        return c.toDataURL('image/jpeg', 0.72)
      },
    }),
    [pageKey, redrawInk, size, strokes],
  )

  return (
    <Wrap ref={wrapRef}>
      <canvas ref={guideRef} aria-hidden />
      <canvas
        ref={inkRef}
        role="img"
        aria-label="Writing area. Draw with your finger or a stylus."
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      />
    </Wrap>
  )
}
