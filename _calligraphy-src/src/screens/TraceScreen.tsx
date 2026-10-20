import { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Card, Tab, Tabs } from '../components/DuctusTutorial'
import { letterTrace } from '../lib/trace/letters'
import { TraceView } from '../components/TraceView'
import { IconButton, Icons, TopBar } from '../components/ui'
import { go, href } from '../lib/router'
import { SCRIPTS } from '../lib/scripts'
import { traceOf, type Trace } from '../lib/trace'
import { usePractice } from '../state/practice'

type Mode = 'letter' | 'svg'

// Buttons here set their own colours and type: the page's base button style inherits them.
const Pill = styled.button<{ $on?: boolean }>`
  flex: none;
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid ${({ $on, theme }) => ($on ? theme.color.ink : theme.color.rule)};
  background: ${({ $on, theme }) => ($on ? theme.color.ink : 'transparent')};
  color: ${({ $on, theme }) => ($on ? theme.color.paper : theme.color.ink)};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 13px;
  line-height: 1.2;
`
const Link = styled.button`
  padding: 0;
  border: 0;
  background: none;
  color: ${({ theme }) => theme.color.cobalt};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
`

// Two small original samples: one drawn as stroked paths (its order is the
// file's order), one as a filled shape (traced from its outline).
const SAMPLE_STROKES = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" data-baseline="90" data-xheight="50">
  <g fill="none" stroke="#000" stroke-width="7" stroke-linecap="round" stroke-linejoin="round">
    <path data-name="Oval, from the top" d="M78 47 C70 37 50 37 40 51 C30 67 36 90 52 90 C66 90 76 74 80 56"/>
    <path data-name="Stem and exit" d="M83 41 L74 80 C72 90 80 93 94 83"/>
  </g>
</svg>`
const SAMPLE_FILLED = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <path fill-rule="evenodd" d="M56 14c22 2 32 22 26 44s-26 34-44 28S14 58 20 38 38 12 56 14zm-2 10c-12-1-22 10-25 24s2 28 12 30 23-8 27-22-2-31-14-32z"/>
</svg>`

const how: Record<Trace['from'], string> = {
  paths: 'Followed your SVG’s own paths, in the order they appear in the file.',
  guided: 'Traced from the font’s own outline. The order comes from the hand’s teaching strokes.',
  outline: 'Traced from the outline. The order is worked out from the shape: left to right, smooth through each join, ovals counterclockwise, dots last.',
}

/** Trace anything: a character in any hand, or an SVG of your own. */
export function TraceScreen() {
  const { script: current } = usePractice()
  const [mode, setMode] = useState<Mode>('letter')
  const [text, setText] = useState('a')
  const [scriptId, setScriptId] = useState(current.id)
  const [svg, setSvg] = useState(SAMPLE_STROKES)
  const [paste, setPaste] = useState(false)
  const [trace, setTrace] = useState<Trace | null>(null)
  const [error, setError] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const script = SCRIPTS.find((s) => s.id === scriptId) ?? current
  const ch = [...text.trim()][0] ?? ''

  useEffect(() => {
    let on = true
    setTrace(null)
    setError(null)
    const job = mode === 'letter' ? (ch ? letterTrace(script, ch) : null) : svg.trim() ? traceOf({ kind: 'svg', svg }) : null
    job?.then((t) => on && setTrace(t)).catch((e: Error) => on && setError(e.message || 'This could not be traced.'))
    return () => {
      on = false
    }
  }, [mode, ch, script, svg])

  const onFile = async (f: File | undefined) => {
    if (!f) return
    if (f.size > 2_000_000) return setError('That file is too big for a letter (over 2 MB).')
    setSvg(await f.text())
  }

  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back" onClick={() => (history.length > 1 ? history.back() : go(href.letters))}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Trace anything</div>
          <div className="font-sans text-[12.5px] text-ink-soft">Any letter in any hand, or your own SVG</div>
        </div>
      </TopBar>

      <Card aria-label="Tracing">
        <Tabs role="tablist">
          <Tab type="button" role="tab" aria-selected={mode === 'letter'} $on={mode === 'letter'} onClick={() => setMode('letter')}>
            A letter
          </Tab>
          <Tab type="button" role="tab" aria-selected={mode === 'svg'} $on={mode === 'svg'} onClick={() => setMode('svg')}>
            An SVG
          </Tab>
        </Tabs>
        <TraceView
          trace={trace}
          slant={mode === 'letter' ? script.style.slant : 90}
          height={260}
          status={error ?? (mode === 'letter' && !ch ? 'Type a letter to trace.' : undefined)}
        />
      </Card>

      {mode === 'letter' ? (
        <section className="px-[14px] pt-3" aria-label="Letter and hand">
          <label className="flex items-center gap-3 font-sans text-[13px] text-ink-soft">
            Letter
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4}
              aria-label="Letter to trace"
              className="w-16 rounded-md border border-rule bg-note px-2 py-1 text-center font-serif text-[22px] text-ink"
            />
            <span className="text-[12px]">Accents work too: ă, ê, ơ, ữ…</span>
          </label>
          <div className="-mx-[14px] mt-3 flex gap-2 overflow-x-auto px-[14px] pb-1" role="radiogroup" aria-label="Hand">
            {SCRIPTS.filter((s) => s.id !== 'draft').map((s) => (
              <Pill key={s.id} type="button" role="radio" aria-checked={s.id === script.id} $on={s.id === script.id} onClick={() => setScriptId(s.id)}>
                {s.name}
              </Pill>
            ))}
          </div>
        </section>
      ) : (
        <section className="px-[14px] pt-3" aria-label="Your SVG">
          <div className="flex flex-wrap gap-2">
            <Pill type="button" $on onClick={() => file.current?.click()}>
              Choose an SVG file
            </Pill>
            <Pill type="button" onClick={() => setPaste((p) => !p)}>
              {paste ? 'Hide the code' : 'Paste SVG code'}
            </Pill>
            <input ref={file} type="file" accept=".svg,image/svg+xml" hidden onChange={(e) => onFile(e.target.files?.[0])} />
          </div>
          <p className="m-0 mt-3 font-sans text-[12.5px] text-ink-soft">
            Try a sample:{' '}
            <Link type="button" onClick={() => setSvg(SAMPLE_STROKES)}>
              a, drawn as strokes
            </Link>{' '}
            or{' '}
            <Link type="button" onClick={() => setSvg(SAMPLE_FILLED)}>
              an o, drawn as a filled shape
            </Link>
          </p>
          {paste && (
            <textarea
              value={svg}
              onChange={(e) => setSvg(e.target.value)}
              spellCheck={false}
              aria-label="SVG code"
              className="mt-3 h-40 w-full rounded-md border border-rule bg-note p-2 font-mono text-[11.5px] text-ink"
            />
          )}
          <div className="mt-4 font-sans text-[12.5px] leading-relaxed text-ink-soft">
            <p className="m-0">
              <b className="font-semibold text-ink">For your exact order</b>, draw each stroke as its own path with a stroke and{' '}
              <code>fill="none"</code>, in the order you write them and in the direction the pen moves. Name a step with{' '}
              <code>data-name</code>.
            </p>
            <p className="m-0 mt-2">
              <b className="font-semibold text-ink">Any filled drawing</b> works too, such as a letter exported from a font editor: it is
              traced from its outline.
            </p>
            <p className="m-0 mt-2">
              <b className="font-semibold text-ink">To sit on the guidelines</b>, add <code>data-baseline</code> and{' '}
              <code>data-xheight</code> to the <code>&lt;svg&gt;</code>, in viewBox units. Otherwise the drawing stands on the baseline,
              two x-heights tall.
            </p>
          </div>
        </section>
      )}

      {trace && <p className="m-0 px-[14px] pt-4 font-sans text-[12.5px] leading-snug text-ink-soft">{how[trace.from]}</p>}
    </main>
  )
}
