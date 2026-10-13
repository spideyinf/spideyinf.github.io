import { useCallback, useEffect, useImperativeHandle, useRef, useState, type Ref } from 'react'
import styled from 'styled-components'
import { loadHand, type Metrics } from '../lib/hand'
import { finishStroke, INK_OPACITY, inkAt, paintStroke, sample, strokeInk, type InkStroke, type Paper } from '../lib/pen'
import { drawSheet, rowAt, type SheetLayout } from '../lib/sheet'
import { nibDown, nibMove, nibUp } from '../lib/sound'
import { usePen } from '../state/pen'
import { paperScans } from './paperScans'

// Ink survives moving between letters/pages within a session.
const inkByPage = new Map<string, InkStroke[]>()

export type SheetHandle = {
  undo: () => void
  clear: () => void
  hasInk: () => boolean
  snapshot: () => string | null
}

type Props = {
  /** Font of the script being practised, for text models. */
  font: string
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
  /* Ink sits in the paper: guidelines and grain stay visible through it. */
  canvas[data-ink],
  canvas[data-drying],
  canvas[data-live] {
    mix-blend-mode: multiply;
    pointer-events: none;
  }
  canvas[data-drying],
  canvas[data-live] {
    opacity: ${INK_OPACITY};
  }
  canvas[data-input] {
    touch-action: none;
    cursor: crosshair;
  }
`

export function Sheet({ pageKey, font, showModel, build, onInkChange, ref }: Props) {
  const { nib, ink, paper, settings } = usePen()
  const wrapRef = useRef<HTMLDivElement>(null)
  const guideRef = useRef<HTMLCanvasElement>(null)
  const inkRef = useRef<HTMLCanvasElement>(null)
  const dryingRef = useRef<HTMLCanvasElement>(null)
  const liveRef = useRef<HTMLCanvasElement>(null)
  const bufferRef = useRef<HTMLCanvasElement | null>(null)
  const layoutRef = useRef<SheetLayout | null>(null)
  const drying = useRef<InkStroke[]>([])
  const dryLoop = useRef(0)
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const live = useRef<{ stroke: InkStroke; w: number; d: number; t: number } | null>(null)

  const strokes = useCallback(() => {
    if (!inkByPage.has(pageKey)) inkByPage.set(pageKey, [])
    return inkByPage.get(pageKey)!
  }, [pageKey])

  useEffect(() => {
    let on = true
    loadHand(font).then((m) => on && setMetrics(m))
    return () => {
      on = false
    }
  }, [font])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => {
      setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) })
    })
    ro.observe(wrapRef.current!)
    return () => ro.disconnect()
  }, [])

  /** Paint one stroke onto a layer, composited with multiply like ink on ink. */
  const layer = useCallback(
    (target: CanvasRenderingContext2D | null | undefined, s: InkStroke, p: Paper, color?: string) => {
      const buf = bufferRef.current?.getContext('2d')
      if (!target || !buf) return
      buf.clearRect(0, 0, size.w, size.h)
      paintStroke(buf, s, p, 0, color)
      finishStroke(buf, s, p, color)
      target.save()
      target.globalCompositeOperation = 'multiply'
      target.drawImage(bufferRef.current!, 0, 0, size.w, size.h)
      target.restore()
    },
    [size],
  )

  /** Wet strokes are redrawn as they dry, then settle onto the page layer. */
  const tickDrying = useCallback(() => {
    cancelAnimationFrame(dryLoop.current)
    const step = () => {
      const ctx = dryingRef.current?.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, size.w, size.h)
      const now = performance.now()
      const still: InkStroke[] = []
      for (const s of drying.current) {
        const { color, dryness } = inkAt(s, paper, now - (s.born ?? 0))
        if (dryness >= 1) layer(inkRef.current?.getContext('2d'), s, paper)
        else {
          still.push(s)
          layer(ctx, s, paper, color)
        }
      }
      drying.current = still
      if (still.length) dryLoop.current = window.setTimeout(() => requestAnimationFrame(step), 90) as unknown as number
    }
    step()
  }, [layer, paper, size])

  const redrawInk = useCallback(() => {
    const ctx = inkRef.current?.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, size.w, size.h)
    const now = performance.now()
    drying.current = []
    for (const s of strokes()) {
      if (s.born && now - s.born < paper.dry) drying.current.push(s)
      else layer(ctx, s, paper)
    }
    tickDrying()
    onInkChange?.(strokes().length > 0)
  }, [layer, strokes, size, paper, tickDrying, onInkChange])

  useEffect(() => () => clearTimeout(dryLoop.current), [])

  // Size the canvases for the device pixel ratio, lay out and paint the sheet.
  useEffect(() => {
    const g = guideRef.current
    if (!g || !metrics || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    bufferRef.current ??= document.createElement('canvas')
    for (const c of [g, inkRef.current!, dryingRef.current!, liveRef.current!, bufferRef.current]) {
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

  const tooth = Math.min(1, nib.tooth * 0.75 + paper.absorb * 0.5)

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 || live.current) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const r = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    const xh = rowAt(layoutRef.current, y)?.xh ?? 18
    const { w } = sample(nib, ink, paper, xh, 0, 1, 16, e.pressure, e.pointerType === 'pen')
    // A fresh stroke goes down in the wet colour (iron gall starts blue).
    const stroke: InkStroke = { ...strokeInk(ink), pts: [{ x, y, w, d: 1 }] }
    live.current = { stroke, w, d: 1, t: e.timeStamp }
    paintStroke(liveRef.current!.getContext('2d')!, stroke, paper, 0, inkAt(stroke, paper, 0).color)
    if (settings.sound) nibDown(tooth)
  }

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    const r = e.currentTarget.getBoundingClientRect()
    const coalesced = e.nativeEvent.getCoalescedEvents?.() ?? []
    const events = coalesced.length ? coalesced : [e.nativeEvent]
    const from = cur.stroke.pts.length
    let speed = 0
    for (const ev of events) {
      const x = ev.clientX - r.left
      const y = ev.clientY - r.top
      const last = cur.stroke.pts[cur.stroke.pts.length - 1]
      const dx = x - last.x
      const dy = y - last.y
      if (dx * dx + dy * dy < 1.2) continue
      const dt = ev.timeStamp - cur.t
      speed = Math.hypot(dx, dy) / Math.max(dt, 4)
      const xh = rowAt(layoutRef.current, y)?.xh ?? 18
      const target = sample(nib, ink, paper, xh, dx, dy, dt, ev.pressure, ev.pointerType === 'pen')
      cur.t = ev.timeStamp
      // Ease width and density so the line breathes instead of jittering. A stub follows direction fast.
      cur.w += (target.w - cur.w) * (nib.kind === 'flex' ? 0.32 : nib.kind === 'stub' ? 0.45 : 0.22)
      cur.d += (target.d - cur.d) * 0.2
      cur.stroke.pts.push({ x, y, w: cur.w, d: cur.d })
    }
    if (cur.stroke.pts.length > from)
      paintStroke(liveRef.current!.getContext('2d')!, cur.stroke, paper, from, inkAt(cur.stroke, paper, 0).color)
    if (settings.sound) nibMove(speed, tooth)
  }

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    live.current = null
    if (settings.sound) nibUp()
    // Resting before lifting lets ink pool at the end of the stroke.
    const last = cur.stroke.pts[cur.stroke.pts.length - 1]
    if (e.timeStamp - cur.t > 140) {
      last.d = 1
      cur.stroke.pool = true
    }
    cur.stroke.born = performance.now()
    liveRef.current!.getContext('2d')!.clearRect(0, 0, size.w, size.h)
    strokes().push(cur.stroke)
    drying.current.push(cur.stroke)
    tickDrying()
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
        if (!g || !size.w) return null
        // A small JPEG keeps a month of pages within localStorage. Ink is drawn dry.
        const scale = Math.min(1.5, 720 / size.w)
        const c = document.createElement('canvas')
        c.width = Math.round(size.w * scale)
        c.height = Math.round(size.h * scale)
        const ctx = c.getContext('2d')!
        ctx.fillStyle = paper.tint
        ctx.fillRect(0, 0, c.width, c.height)
        const scan = paperScans[paper.id]
        if (scan.complete && scan.naturalWidth) {
          ctx.globalCompositeOperation = 'multiply'
          ctx.fillStyle = ctx.createPattern(scan, 'repeat')!
          ctx.fillRect(0, 0, c.width, c.height)
          ctx.globalCompositeOperation = 'source-over'
        }
        ctx.drawImage(g, 0, 0, c.width, c.height)
        const dry = document.createElement('canvas')
        dry.width = c.width
        dry.height = c.height
        const dctx = dry.getContext('2d')!
        dctx.scale(scale, scale)
        bufferRef.current ??= document.createElement('canvas')
        for (const s of strokes()) {
          const buf = document.createElement('canvas')
          buf.width = c.width
          buf.height = c.height
          const b = buf.getContext('2d')!
          b.scale(scale, scale)
          paintStroke(b, s, paper)
          finishStroke(b, s, paper)
          dctx.save()
          dctx.setTransform(1, 0, 0, 1, 0, 0)
          dctx.globalCompositeOperation = 'multiply'
          dctx.drawImage(buf, 0, 0)
          dctx.restore()
        }
        ctx.globalAlpha = INK_OPACITY
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(dry, 0, 0)
        return c.toDataURL('image/jpeg', 0.78)
      },
    }),
    [pageKey, redrawInk, size, strokes, paper],
  )

  return (
    <Wrap ref={wrapRef}>
      <canvas ref={guideRef} aria-hidden />
      <canvas ref={inkRef} data-ink aria-hidden />
      <canvas ref={dryingRef} data-drying aria-hidden />
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
