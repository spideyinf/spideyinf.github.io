import { useEffect, useRef, useState } from 'react'
import { letterTrace } from '../lib/trace/letters'
import { scriptById } from '../lib/scripts'
import { traceOf, type Trace } from '../lib/trace'

// Dev-only: every letter of a hand as traced, coloured by stroke, numbered
// where each stroke starts, with an arrow for its direction.
// #/tracesheet/<scriptId>          guided by the ductus
// #/tracesheet/<scriptId>/outline  the heuristic alone
const COLORS = ['#1b1b1b', '#d23a1f', '#1f8a3a', '#2350c8', '#c08000', '#8a2fb0', '#0a8a8a', '#c0306a']

export default function TraceSheet() {
  const ref = useRef<HTMLCanvasElement>(null)
  const [info, setInfo] = useState('')
  useEffect(() => {
    const [, , id, mode] = location.hash.split('/')
    const script = scriptById(id)
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
    const t0 = performance.now()
    Promise.all(chars.map((ch) => (mode === 'outline' ? traceOf({ kind: 'font', font: script.font, text: ch }) : letterTrace(script, ch)))).then((traces) => {
      const c = ref.current!
      const cell = 150
      const cols = 8
      const rows = Math.ceil(chars.length / cols)
      c.width = cols * cell
      c.height = rows * cell
      const ctx = c.getContext('2d')!
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, c.width, c.height)
      traces.forEach((t: Trace, i) => {
        const x0 = (i % cols) * cell
        const y0 = Math.floor(i / cols) * cell
        const k = Math.min((cell - 16) / t.w, (cell - 16) / t.h)
        const img = ctx.createImageData(t.w, t.h)
        for (let j = 0; j < t.w * t.h; j++) {
          const o = t.owner[j]
          if (o < 0) continue
          const hex = COLORS[o % COLORS.length]
          img.data[j * 4] = parseInt(hex.slice(1, 3), 16)
          img.data[j * 4 + 1] = parseInt(hex.slice(3, 5), 16)
          img.data[j * 4 + 2] = parseInt(hex.slice(5, 7), 16)
          img.data[j * 4 + 3] = 200
        }
        const tmp = document.createElement('canvas')
        tmp.width = t.w
        tmp.height = t.h
        tmp.getContext('2d')!.putImageData(img, 0, 0)
        const gx = x0 + 8
        const gy = y0 + 8
        ctx.drawImage(tmp, gx, gy, t.w * k, t.h * k)
        // Mask the colour by the true glyph alpha? Keep it simple: outline the glyph faintly.
        ctx.save()
        ctx.globalAlpha = 0.25
        ctx.restore()
        t.strokes.forEach((s, n) => {
          const [sx, sy] = s.pts[0]
          const px = gx + sx * k
          const py = gy + sy * k
          ctx.fillStyle = COLORS[n % COLORS.length]
          ctx.beginPath()
          ctx.arc(px, py, 7, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = '#fff'
          ctx.font = 'bold 10px sans-serif'
          ctx.textAlign = 'center'
          ctx.fillText(String(n + 1), px, py + 3.5)
          if (!s.dot && s.pts.length > 12) {
            const a = s.pts[Math.min(s.pts.length - 1, 10)]
            const b = s.pts[Math.min(s.pts.length - 1, 22)]
            const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
            const hx = gx + b[0] * k
            const hy = gy + b[1] * k
            ctx.strokeStyle = COLORS[n % COLORS.length]
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.moveTo(hx - 7 * Math.cos(ang - 0.5), hy - 7 * Math.sin(ang - 0.5))
            ctx.lineTo(hx, hy)
            ctx.lineTo(hx - 7 * Math.cos(ang + 0.5), hy - 7 * Math.sin(ang + 0.5))
            ctx.stroke()
          }
        })
        ctx.fillStyle = '#888'
        ctx.font = '11px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(`${chars[i]} ${t.from} ${t.strokes.length}`, x0 + 4, y0 + cell - 4)
      })
      setInfo(`${script.name}: ${chars.length} letters in ${Math.round(performance.now() - t0)} ms`)
    })
  }, [])
  return (
    <div style={{ background: '#fff' }}>
      <p id="info" style={{ font: '13px sans-serif', margin: 4 }}>{info}</p>
      <canvas ref={ref} />
    </div>
  )
}
