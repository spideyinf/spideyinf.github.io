import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import { go, href } from '../lib/router'
import { Sheet, type SheetHandle } from './Sheet'
import { IconButton, Icons, SaveButton, StoryBar, Toast, Toolbar, TopBar, type SegState } from './ui'
import type { Metrics } from '../lib/hand'
import type { SheetLayout } from '../lib/sheet'

const Screen = styled.main`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding-top: env(safe-area-inset-top);
  overflow: hidden;
`

type Props = {
  pageKey: string
  title: ReactNode
  subtitle: ReactNode
  segments: SegState[]
  segmentsLabel: string
  note?: ReactNode
  build: (ctx: CanvasRenderingContext2D, m: Metrics, w: number, h: number) => SheetLayout
  onPrev?: () => void
  onNext?: () => void
  prevLabel: string
  nextLabel: string
  backTo?: string
  onSave: (snapshot: string) => void
  savedLabel: string
}

/** The shared frame for every practice sheet: story bar, ruled sheet, thumb toolbar. */
export function PracticeShell(p: Props) {
  const sheet = useRef<SheetHandle>(null)
  const [showModel, setShowModel] = useState(true)
  const [hasInk, setHasInk] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 1800)
    return () => clearTimeout(t)
  }, [toast])

  const onInkChange = useCallback((v: boolean) => setHasInk(v), [])

  const save = () => {
    const shot = sheet.current?.snapshot()
    if (!shot) return
    p.onSave(shot)
    setToast(p.savedLabel)
  }

  return (
    <Screen>
      <StoryBar states={p.segments} label={p.segmentsLabel} />
      <TopBar>
        <IconButton label="Back to home" onClick={() => go(p.backTo ?? href.home)}>
          {Icons.back}
        </IconButton>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[17px]">{p.title}</div>
          <div className="truncate font-sans text-[12.5px] text-ink-soft">{p.subtitle}</div>
        </div>
        <IconButton
          label={showModel ? 'Hide the model and write from memory' : 'Show the model to trace'}
          active={!showModel}
          onClick={() => setShowModel((v) => !v)}
        >
          {showModel ? Icons.eye : Icons.eyeOff}
        </IconButton>
      </TopBar>
      {p.note && <div className="px-[18px] pb-1 font-sans text-[12.5px] leading-snug text-ink-soft">{p.note}</div>}

      <Sheet ref={sheet} pageKey={p.pageKey} showModel={showModel} build={p.build} onInkChange={onInkChange} />

      <Toolbar>
        <IconButton label={p.prevLabel} onClick={p.onPrev} disabled={!p.onPrev}>
          {Icons.prev}
        </IconButton>
        <IconButton label="Undo last stroke" onClick={() => sheet.current?.undo()} disabled={!hasInk}>
          {Icons.undo}
        </IconButton>
        <SaveButton type="button" onClick={save} disabled={!hasInk}>
          Save page
        </SaveButton>
        <IconButton label="Clear the page" onClick={() => sheet.current?.clear()} disabled={!hasInk}>
          {Icons.clear}
        </IconButton>
        <IconButton label={p.nextLabel} onClick={p.onNext} disabled={!p.onNext}>
          {Icons.next}
        </IconButton>
      </Toolbar>
      <Toast $show={!!toast} role="status" aria-live="polite">
        {toast}
      </Toast>
    </Screen>
  )
}
