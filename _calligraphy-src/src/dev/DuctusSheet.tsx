import { useEffect, useRef } from 'react'
import { bounds, inkStep, type Glyph } from '../lib/ductus'
import { scriptById } from '../lib/scripts'
import { paintStroke } from '../lib/pen'
import { theme } from '../theme'

// Dev-only contact sheet of every letter, for checking letterforms.
// #/ductus shows Copperplate; #/ductus/<scriptId> shows another script.
const COLORS = ['#2a221e', '#b4432f', '#2f6b3e', '#2f3e6b', '#8a5a00']

export default function DuctusSheet() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current!
    const W = 1200
    const H = 1500
    c.width = W * 2
    c.height = H * 2
    c.style.width = `${W}px`
    const ctx = c.getContext('2d')!
    ctx.scale(2, 2)
    const xh = 26
    const cell = 150
    const cellH = 120
    const script = scriptById(location.hash.split('/')[2])
    const all: [string, Glyph][] = [...Object.entries(script.capitals), ...Object.entries(script.lowercase)]
    ctx.font = '12px sans-serif'
    all.forEach(([ch, g], i) => {
      const col = i % 8
      const row = Math.floor(i / 8)
      const x0 = col * cell
      const top = row * cellH
      const base = top + 78
      ctx.strokeStyle = 'rgba(47,62,107,.25)'
      for (const y of [base, base - xh, base - 2 * xh, base + xh]) {
        ctx.beginPath()
        ctx.moveTo(x0 + 4, y)
        ctx.lineTo(x0 + cell - 4, y)
        ctx.stroke()
      }
      const b = bounds(g, script.style.slant)
      const ox = x0 + (cell - b.width * xh) / 2 - b.minX * xh
      g.steps.forEach((st, k) => {
        const pts = inkStep(st, ox, base, xh, script.style)
        const color = COLORS[k % COLORS.length]
        if (st.dot) {
          ctx.fillStyle = color
          ctx.beginPath()
          ctx.arc(pts[0].x, pts[0].y, pts[0].w / 2, 0, Math.PI * 2)
          ctx.fill()
        } else paintStroke(ctx, { color, pts }, theme.color.paper)
        ctx.fillStyle = color
        ctx.fillText(String(k + 1), pts[0].x - 10, pts[0].y - 4)
      })
      ctx.fillStyle = '#999'
      ctx.fillText(ch, x0 + 6, top + 14)
    })
  }, [])
  return <canvas ref={ref} style={{ background: '#fff' }} />
}
