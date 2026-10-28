import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { IconButton, Icons, SaveButton, TopBar } from '../components/ui'
import { inkStep, type Glyph, type P } from '../lib/ductus'
import { LETTERS } from '../lib/letters'
import { paintStroke } from '../lib/pen'
import {
  discardDraft,
  loadDraft,
  NEW_DRAFT,
  recordedCount,
  saveDraft,
  strokeToStep,
  toHandFile,
  toUnits,
  type Draft,
} from '../lib/recording'
import { go, href } from '../lib/router'
import { theme } from '../theme'
import fibers from '../assets/paper/lightpaperfibers.png'

// All 52 targets: capitals first, then lowercase.
const TARGETS = [...LETTERS, ...LETTERS.map((l) => l.toLowerCase())]
const isCap = (ch: string) => ch !== ch.toLowerCase()

// Same vertical frame as the tutorial, so recorded letters sit where the built-in ones do.
const TOP = 2.3
const BOTTOM = 1.15
const NOTE = theme.color.note

const Card = styled.div`
  position: relative;
  margin: 4px 10px 0;
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
  height: min(330px, 44vh);
  canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    touch-action: none;
    cursor: crosshair;
  }
`
const Chip = styled.button<{ $on: boolean; $done: boolean }>`
  flex: none;
  width: 30px;
  height: 34px;
  border: 0;
  background: none;
  font-family: ${({ theme }) => theme.font.serif};
  font-size: 16px;
  color: ${({ $done, theme }) => ($done ? theme.color.ink : theme.color.inkSoft)};
  opacity: ${({ $done, $on }) => ($done || $on ? 1 : 0.5)};
  box-shadow: inset 0 -1.5px 0 ${({ $on, theme }) => ($on ? theme.color.vermilion : 'transparent')};
`
const Field = styled.label`
  display: block;
  margin-top: 12px;
  font: 13px ${({ theme }) => theme.font.sans};
  color: ${({ theme }) => theme.color.inkSoft};
  input[type='text'] {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin-top: 4px;
    padding: 10px 12px;
    border: 0;
    background: ${({ theme }) => theme.color.tint};
    font: 16px ${({ theme }) => theme.font.serif};
    color: ${({ theme }) => theme.color.ink};
  }
  input[type='range'] {
    display: block;
    width: 100%;
    margin-top: 6px;
    accent-color: ${({ theme }) => theme.color.ink};
  }
`

/** Write each letter stroke by stroke; the strokes become tutorial and tracing data. */
export function RecordScreen() {
  const [draft, setDraft] = useState<Draft>(() => loadDraft() ?? NEW_DRAFT)
  const [i, setI] = useState(0)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const stage = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const live = useRef<{ raw: [number, number][]; units: P[] } | null>(null)

  const target = TARGETS[i]
  const set = isCap(target) ? 'capitals' : 'lowercase'
  const glyph: Glyph = useMemo(() => draft[set][target] ?? { steps: [] }, [draft, set, target])

  useEffect(() => saveDraft(draft), [draft])

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: Math.round(e.contentRect.width), h: Math.round(e.contentRect.height) }))
    ro.observe(stage.current!)
    return () => ro.disconnect()
  }, [])

  // The writing frame: x-height from the stage height, letter starting a third of the way in.
  const frame = useMemo(() => {
    const xh = (size.h - 16) / (TOP + BOTTOM)
    return { xh, baseline: 8 + TOP * xh, ox: size.w * 0.3, slant: draft.slant }
  }, [size, draft.slant])

  const paint = useCallback(() => {
    const c = canvas.current
    if (!c || !size.w) return
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    if (c.width !== size.w * dpr || c.height !== size.h * dpr) {
      c.width = size.w * dpr
      c.height = size.h * dpr
    }
    const ctx = c.getContext('2d')!
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, size.w, size.h)
    const { xh, baseline } = frame
    // Slant guides at the hand's own slant, then the four lines.
    const k = 1 / Math.tan((draft.slant * Math.PI) / 180)
    const top = baseline - 2 * xh
    const bottom = baseline + xh
    ctx.lineWidth = 1
    ctx.strokeStyle = 'rgb(47 62 107 / 0.08)'
    const run = (bottom - top) * k
    for (let x = -run; x < size.w + run; x += xh * 1.2) {
      ctx.beginPath()
      ctx.moveTo(x, bottom)
      ctx.lineTo(x + run, top)
      ctx.stroke()
    }
    const rule = (y: number, a: number, dash: number[] = []) => {
      ctx.setLineDash(dash)
      ctx.strokeStyle = `rgb(47 62 107 / ${a})`
      ctx.beginPath()
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(size.w, Math.round(y) + 0.5)
      ctx.stroke()
    }
    rule(top, 0.22, [3, 4])
    rule(baseline - xh, 0.32)
    rule(baseline, 0.6)
    rule(bottom, 0.22, [3, 4])
    ctx.setLineDash([])

    // Recorded strokes, rendered exactly as the tutorial will show them.
    const style = { slant: draft.slant, shade: draft.shade }
    glyph.steps.forEach((st, n) => {
      const pts = inkStep(st, frame.ox, baseline, xh, style)
      if (st.dot) {
        ctx.fillStyle = theme.color.ink
        ctx.beginPath()
        ctx.arc(pts[0].x, pts[0].y, pts[0].w / 2, 0, Math.PI * 2)
        ctx.fill()
      } else paintStroke(ctx, { color: theme.color.ink, pts }, NOTE)
      ctx.fillStyle = theme.color.vermilion
      ctx.font = `600 11px ${theme.font.sans}`
      ctx.fillText(String(n + 1), pts[0].x - 12, pts[0].y - 6)
    })
  }, [size, frame, glyph, draft.slant, draft.shade])

  useEffect(paint, [paint])

  const point = (e: React.PointerEvent | PointerEvent, r: DOMRect): [number, number] => [e.clientX - r.left, e.clientY - r.top]

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = point(e, e.currentTarget.getBoundingClientRect())
    live.current = { raw: [p], units: [toUnits(p[0], p[1], frame)] }
  }
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const cur = live.current
    if (!cur) return
    const r = e.currentTarget.getBoundingClientRect()
    const evs = e.nativeEvent.getCoalescedEvents?.() ?? []
    const ctx = canvas.current!.getContext('2d')!
    ctx.strokeStyle = theme.color.ink
    ctx.lineWidth = 1.5
    ctx.lineCap = 'round'
    for (const ev of evs.length ? evs : [e.nativeEvent]) {
      const p = point(ev, r)
      const last = cur.raw[cur.raw.length - 1]
      if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 1.5) continue
      ctx.beginPath()
      ctx.moveTo(last[0], last[1])
      ctx.lineTo(p[0], p[1])
      ctx.stroke()
      cur.raw.push(p)
      cur.units.push(toUnits(p[0], p[1], frame))
    }
  }
  const onUp = () => {
    const cur = live.current
    if (!cur) return
    live.current = null
    const step = strokeToStep(cur.units, glyph.steps.length)
    setDraft((d) => ({ ...d, [set]: { ...d[set], [target]: { steps: [...glyph.steps, step] } } }))
  }

  const update = (steps: Glyph['steps']) => setDraft((d) => ({ ...d, [set]: { ...d[set], [target]: { steps } } }))

  const download = () => {
    const blob = new Blob([JSON.stringify(toHandFile(draft), null, 1)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'hand.json'
    a.click()
    setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  }

  const count = recordedCount(draft)

  return (
    <main className="min-h-dvh pb-14" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back to letters" onClick={() => go(href.letters)}>
          {Icons.back}
        </IconButton>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[17px]">Record your hand</div>
          <div className="font-sans text-[12.5px] text-ink-soft">{count} of 52 letters recorded</div>
        </div>
      </TopBar>

      <p className="m-0 px-[14px] pb-2 font-sans text-[13px] leading-snug text-ink-soft">
        Write <b className="font-semibold text-ink">{target}</b> once, in the order you'd teach it. Each time you lift
        the pen is one step of the tutorial.
      </p>

      <div className="flex overflow-x-auto px-[8px]" role="tablist" aria-label="Letters">
        {TARGETS.map((t, n) => {
          const g = (isCap(t) ? draft.capitals : draft.lowercase)[t]
          return (
            <Chip
              key={t}
              type="button"
              role="tab"
              aria-selected={n === i}
              aria-label={`${t}${g?.steps.length ? ', recorded' : ''}`}
              $on={n === i}
              $done={!!g?.steps.length}
              onClick={() => setI(n)}
            >
              {t}
            </Chip>
          )
        })}
      </div>

      <Card>
        <Stage ref={stage}>
          <canvas
            ref={canvas}
            role="img"
            aria-label={`Writing area for ${target}`}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          />
        </Stage>
      </Card>

      <div className="flex items-center justify-between px-[10px] pt-2">
        <IconButton label="Previous letter" onClick={() => setI(Math.max(0, i - 1))} disabled={i === 0}>
          {Icons.prev}
        </IconButton>
        <IconButton label="Undo last stroke" onClick={() => update(glyph.steps.slice(0, -1))} disabled={!glyph.steps.length}>
          {Icons.undo}
        </IconButton>
        <SaveButton type="button" onClick={() => setI(Math.min(TARGETS.length - 1, i + 1))} disabled={!glyph.steps.length}>
          Keep, next letter
        </SaveButton>
        <IconButton label="Clear this letter" onClick={() => update([])} disabled={!glyph.steps.length}>
          {Icons.clear}
        </IconButton>
        <IconButton label="Next letter" onClick={() => setI(Math.min(TARGETS.length - 1, i + 1))} disabled={i === TARGETS.length - 1}>
          {Icons.next}
        </IconButton>
      </div>

      {glyph.steps.length > 0 && (
        <section className="px-[14px] pt-4" aria-label="Step names">
          <h2 className="m-0 font-sans text-[12.5px] font-normal text-ink-soft">Name each step (shown in the tutorial)</h2>
          {glyph.steps.map((st, n) => (
            <Field key={n} style={{ marginTop: 6 }}>
              <span className="sr-only">Step {n + 1}</span>
              <input
                type="text"
                value={st.name}
                onChange={(e) => update(glyph.steps.map((s, k) => (k === n ? { ...s, name: e.target.value } : s)))}
              />
            </Field>
          ))}
        </section>
      )}

      <section className="px-[14px] pt-7" aria-label="Hand settings">
        <h2 className="m-0 text-[22px] font-extrabold tracking-[-0.02em]">Your hand</h2>
        <Field>
          Name
          <input type="text" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
        </Field>
        <Field>
          Slant: {draft.slant}° from horizontal
          <input type="range" min={45} max={90} step={1} value={draft.slant} onChange={(e) => setDraft({ ...draft, slant: +e.target.value })} />
        </Field>
        <Field>
          Shading on downstrokes: {Math.round(draft.shade * 100)}%
          <input type="range" min={0} max={1} step={0.05} value={draft.shade} onChange={(e) => setDraft({ ...draft, shade: +e.target.value })} />
        </Field>

        <div className="mt-6 flex flex-wrap gap-3">
          <SaveButton type="button" onClick={download} disabled={!count}>
            Download hand.json
          </SaveButton>
          <SaveButton
            type="button"
            disabled={!count}
            onClick={() => {
              // The draft joins the script list on the next load.
              location.hash = href.letters
              location.reload()
            }}
          >
            Try it in ABC
          </SaveButton>
        </div>
        <p className="m-0 mt-3 font-sans text-[12.5px] leading-snug text-ink-soft">
          Your recording stays on this device until you download it. To add it to the app for good, follow
          CUSTOM_HAND.md in the source.
        </p>
        <button
          type="button"
          className="mt-5 border-0 bg-transparent p-0 font-sans text-[13px] text-vermilion underline underline-offset-2"
          onClick={() => {
            if (!confirm('Delete your whole recording on this device?')) return
            discardDraft()
            setDraft(NEW_DRAFT)
            setI(0)
          }}
        >
          Delete recording
        </button>
      </section>
    </main>
  )
}
