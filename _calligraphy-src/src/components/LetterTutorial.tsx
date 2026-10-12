import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { bounds, CAPITALS, inkStep, LOWERCASE, pathLength, type Glyph, type InkPt } from '../lib/ductus'
import { letterInfo } from '../lib/letters'
import { paintStroke } from '../lib/pen'
import { mixHex } from '../lib/sheet'
import fibers from '../assets/paper/lightpaperfibers.png'
import { theme } from '../theme'
import { IconButton, Icons } from './ui'

type Case = 'upper' | 'lower'

const Tabs = styled.div`
  display: flex;
  gap: 18px;
  padding: 0 14px;
`
const Tab = styled.button<{ $on: boolean }>`
  padding: 6px 0 5px;
  border: 0;
  background: none;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 13.5px;
  color: ${({ $on, theme }) => ($on ? theme.color.ink : theme.color.inkSoft)};
  box-shadow: inset 0 -1.5px 0 ${({ $on, theme }) => ($on ? theme.color.ink : 'transparent')};
`
// The demonstration sits on its own lighter card, apart from the practice sheet.
const Card = styled.section`
  position: relative;
  margin: 2px 10px 8px;
  padding: 6px 0 4px;
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-color: ${({ theme }) => theme.color.note};
    background-image: url(${fibers});
    background-size: 500px 300px;
    background-blend-mode: multiply;
    filter: url('#deckle') drop-shadow(0 1px 1px rgb(70 50 25 / 0.2)) drop-shadow(0 5px 10px rgb(70 50 25 / 0.1));
  }
`
const Stage = styled.div`
  position: relative;
  height: 190px;
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
`
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
`

const INK = theme.color.ink
const RED = theme.color.vermilion
const NOTE = theme.color.note
const GHOST = mixHex(INK, NOTE, 0.2)

// Vertical frame of the demo, in x-heights: room for capitals above, descenders below.
const TOP = 2.3
const BOTTOM = 1.15

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false

/** Stroke-by-stroke demonstration of one letter, capital and lowercase. */
export function LetterTutorial({ letter }: { letter: string }) {
  const [kase, setKase] = useState<Case>('upper')
  const glyph: Glyph = kase === 'upper' ? CAPITALS[letter] : LOWERCASE[letter.toLowerCase()]
  const n = glyph.steps.length
  // `done` strokes are fully drawn; while animating, stroke `done` is in progress.
  const [done, setDone] = useState(n)
  const [anim, setAnim] = useState<{ step: number; t: number } | null>(null)
  const [playing, setPlaying] = useState(false)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const raf = useRef(0)
  const timer = useRef(0)
  const info = letterInfo(letter)

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(stage.current!)
    return () => ro.disconnect()
  }, [])

  // Lay the glyph out once per size: same x-height for both cases, so proportions read true.
  const layout = useMemo(() => {
    if (!size.w) return null
    const capW = bounds(CAPITALS[letter]).width
    const xh = Math.min((size.h - 10) / (TOP + BOTTOM), (size.w - 36) / (capW + 0.4))
    const baseline = 5 + TOP * xh + ((size.h - 10) - (TOP + BOTTOM) * xh) / 2
    const b = bounds(glyph)
    const ox = (size.w - b.width * xh) / 2 - b.minX * xh
    const strokes: InkPt[][] = glyph.steps.map((st) => inkStep(st, ox, baseline, xh, kase === 'upper' ? 1 : 0.85))
    return { baseline, strokes, xh }
  }, [size, glyph, letter, kase])

  const paint = useCallback(() => {
    const c = canvas.current
    if (!c || !layout) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    if (c.width !== size.w * dpr) {
      c.width = size.w * dpr
      c.height = size.h * dpr
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)
    // Guidelines: capital line, waistline, baseline, descender line, and the 55° slant.
    const { baseline, xh } = layout
    const rule = (y: number, a: number, dash: number[] = []) => {
      ctx.setLineDash(dash)
      ctx.strokeStyle = `rgb(47 62 107 / ${a})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(size.w, Math.round(y) + 0.5)
      ctx.stroke()
    }
    const top = baseline - 2.1 * xh
    const bottom = baseline + 1.05 * xh
    ctx.save()
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgb(47 62 107 / 0.08)'
    const run = (bottom - top) * 0.7
    for (let x = -run; x < size.w + run; x += xh * 1.2) {
      ctx.beginPath()
      ctx.moveTo(x, bottom)
      ctx.lineTo(x + run, top)
      ctx.stroke()
    }
    ctx.restore()
    rule(top, 0.18, [3, 4])
    rule(baseline - xh, 0.3)
    rule(baseline, 0.55)
    rule(bottom, 0.18, [3, 4])
    ctx.setLineDash([])

    const drawPts = (pts: InkPt[], color: string, isDot: boolean) => {
      if (isDot) {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(pts[0].x, pts[0].y, pts[0].w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else if (pts.length > 1) paintStroke(ctx, { color, pts }, NOTE)
    }

    glyph.steps.forEach((st, i) => drawPts(layout.strokes[i], GHOST, !!st.dot))
    for (let i = 0; i < Math.min(done, n); i++) drawPts(layout.strokes[i], INK, !!glyph.steps[i].dot)

    // The stroke being written, with the nib at its head.
    if (anim) {
      const pts = layout.strokes[anim.step]
      const k = Math.max(1, Math.round(pts.length * anim.t))
      const part = pts.slice(0, k)
      drawPts(part, RED, !!glyph.steps[anim.step].dot)
      const head = part[part.length - 1]
      ctx.fillStyle = RED
      ctx.beginPath()
      ctx.arc(head.x, head.y, Math.max(3, layout.xh * 0.09), 0, Math.PI * 2)
      ctx.fill()
    } else if (done < n) {
      // Where the next stroke begins.
      const p = layout.strokes[done][0]
      const r = Math.max(9, layout.xh * 0.3)
      ctx.fillStyle = RED
      ctx.beginPath()
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = NOTE
      ctx.font = `600 ${Math.round(r * 1.1)}px ${theme.font.sans}`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(done + 1), p.x, p.y + 0.5)
      ctx.textAlign = 'start'
    }
  }, [layout, size, glyph, done, n, anim])

  useEffect(paint, [paint])

  /** Animate stroke `i`, then call `then`. */
  const write = useCallback(
    (i: number, then?: () => void) => {
      if (!layout) return
      cancelAnimationFrame(raf.current)
      const len = pathLength(layout.strokes[i])
      const ms = reduced() ? 1 : Math.max(glyph.steps[i].dot ? 220 : 420, (len / (layout.xh * 3.4)) * 1000)
      const t0 = performance.now()
      const tick = (now: number) => {
        const t = Math.min(1, (now - t0) / ms)
        // Ease in and out like a hand: slow start, steady middle, gentle stop.
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
        setAnim({ step: i, t: e })
        if (t < 1) raf.current = requestAnimationFrame(tick)
        else {
          setAnim(null)
          setDone(i + 1)
          then?.()
        }
      }
      raf.current = requestAnimationFrame(tick)
    },
    [layout, glyph],
  )

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current)
      clearTimeout(timer.current)
    },
    [],
  )

  const play = () => {
    if (playing) return stop()
    setPlaying(true)
    setDone(0)
    const run = (i: number) => {
      if (i >= n) return setPlaying(false)
      write(i, () => {
        timer.current = window.setTimeout(() => run(i + 1), reduced() ? 500 : 260)
      })
    }
    run(0)
  }

  function stop() {
    cancelAnimationFrame(raf.current)
    clearTimeout(timer.current)
    setPlaying(false)
    setAnim(null)
  }

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

  // Switching case starts fully drawn, ready to play. (A new letter remounts this component.)
  const choose = (k: Case) => {
    if (k === kase) return
    stop()
    setKase(k)
    setDone((k === 'upper' ? CAPITALS[letter] : LOWERCASE[letter.toLowerCase()]).steps.length)
  }

  const current = anim ? anim.step : done - 1
  const label =
    current >= 0
      ? `Step ${current + 1} of ${n}: ${glyph.steps[current].name}`
      : `${n} strokes. Tap next to write the first.`

  return (
    <Card aria-label={`How to write ${kase === 'upper' ? info.upper : info.lower}`}>
      <Tabs role="tablist">
        <Tab type="button" role="tab" aria-selected={kase === 'upper'} $on={kase === 'upper'} onClick={() => choose('upper')}>
          Capital {info.upper}
        </Tab>
        <Tab type="button" role="tab" aria-selected={kase === 'lower'} $on={kase === 'lower'} onClick={() => choose('lower')}>
          Lowercase {info.lower}
        </Tab>
      </Tabs>
      <Stage ref={stage}>
        <canvas ref={canvas} role="img" aria-label={label} />
      </Stage>
      <div className="flex items-center gap-1 px-[6px]">
        <IconButton label="Previous stroke" onClick={prev} disabled={done === 0 && !anim}>
          {Icons.prev}
        </IconButton>
        <PlayButton type="button" onClick={play} aria-label={playing ? 'Pause' : 'Play all strokes'}>
          {playing ? Icons.pause : Icons.play}
        </PlayButton>
        <IconButton label="Next stroke" onClick={next}>
          {Icons.next}
        </IconButton>
        <p className="m-0 ml-2 min-w-0 flex-1 font-sans text-[12.5px] leading-snug text-ink-soft" aria-live="polite">
          {label}
        </p>
      </div>
    </Card>
  )
}
