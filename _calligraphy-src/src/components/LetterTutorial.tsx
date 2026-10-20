import { useEffect, useState } from 'react'
import { letterInfo } from '../lib/letters'
import type { Script } from '../lib/scripts'
import type { Trace } from '../lib/trace'
import { letterTrace, traceable } from '../lib/trace/letters'
import { usePractice } from '../state/practice'
import { Card, DuctusTutorial, Tab, Tabs } from './DuctusTutorial'
import { TraceView, type Frame } from './TraceView'

type Case = 'upper' | 'lower'

/** Stroke-by-stroke demonstration of one letter, capital and lowercase, traced from the hand itself. */
export function LetterTutorial({ letter }: { letter: string }) {
  const { script } = usePractice()
  if (!traceable(script)) return <DuctusTutorial letter={letter} />
  return <FontTutorial letter={letter} script={script} />
}

function FontTutorial({ letter, script }: { letter: string; script: Script }) {
  const info = letterInfo(letter)
  const [kase, setKase] = useState<Case>('upper')
  const [traces, setTraces] = useState<{ upper: Trace | null; lower: Trace | null }>({ upper: null, lower: null })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let on = true
    Promise.all([letterTrace(script, info.upper), letterTrace(script, info.lower)])
      .then(([upper, lower]) => on && setTraces({ upper, lower }))
      .catch(() => on && setError('This letter could not be traced.'))
    return () => {
      on = false
    }
  }, [script, info.upper, info.lower])

  // One scale for both cases, so their proportions read true.
  const { upper, lower } = traces
  const frame: Frame | undefined =
    upper && lower
      ? {
          minX: 0,
          maxX: Math.max(upper.box.maxX - upper.box.minX, lower.box.maxX - lower.box.minX),
          top: Math.max(upper.box.top, lower.box.top),
          bottom: Math.min(upper.box.bottom, lower.box.bottom),
        }
      : undefined

  return (
    <Card aria-label={`How to write ${kase === 'upper' ? info.upper : info.lower}`}>
      <Tabs role="tablist">
        <Tab type="button" role="tab" aria-selected={kase === 'upper'} $on={kase === 'upper'} onClick={() => setKase('upper')}>
          Capital {info.upper}
        </Tab>
        <Tab type="button" role="tab" aria-selected={kase === 'lower'} $on={kase === 'lower'} onClick={() => setKase('lower')}>
          Lowercase {info.lower}
        </Tab>
      </Tabs>
      <TraceView trace={frame ? traces[kase] : null} frame={frame} slant={script.style.slant} status={error ?? undefined} />
    </Card>
  )
}
