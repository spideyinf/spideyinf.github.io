import { useEffect, useRef, useState } from 'react'
import { loadHand, type Metrics } from '../lib/hand'
import { drawSheet, type SheetLayout } from '../lib/sheet'

/** The page to copy from: guidelines and models, drawn on the paper. Nothing to write on. */
export function ModelSheet({
  font,
  build,
}: {
  font: string
  build: (ctx: CanvasRenderingContext2D, m: Metrics, width: number, height: number) => SheetLayout
}) {
  const wrap = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const [m, setM] = useState<Metrics | null>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })

  useEffect(() => {
    let on = true
    loadHand(font).then((x) => on && setM(x))
    return () => {
      on = false
    }
  }, [font])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(wrap.current!)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const c = canvas.current
    if (!c || !m || !size.w || !size.h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    c.width = size.w * dpr
    c.height = size.h * dpr
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)
    drawSheet(ctx, m, build(ctx, m, size.w, size.h), true)
  }, [m, size, build])

  return (
    <div ref={wrap} className="relative min-h-0 flex-1">
      <canvas ref={canvas} className="absolute inset-0 h-full w-full mix-blend-multiply" role="img" aria-label="Model to copy onto your paper" />
    </div>
  )
}
