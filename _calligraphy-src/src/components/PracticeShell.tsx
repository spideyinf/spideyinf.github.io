import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import type { Metrics } from '../lib/hand'
import { INKS, loadPen, NIBS, savePen, type PenSettings } from '../lib/pen'
import { go } from '../lib/router'
import type { SheetLayout } from '../lib/sheet'
import { Sheet, type SheetHandle } from './Sheet'
import { IconButton, Icons, SaveButton, Toast, Toolbar, TopBar } from './ui'

const Screen = styled.main`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding-top: env(safe-area-inset-top);
  overflow: hidden;
`

const Tray = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 4px 14px 12px;
`
const Chip = styled.button<{ $on: boolean }>`
  height: 34px;
  padding: 0 14px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ $on, theme }) => ($on ? theme.color.ink : theme.color.paperDeep)};
  color: ${({ $on, theme }) => ($on ? theme.color.paper : theme.color.ink)};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 13.5px;
`
const Swatch = styled.button<{ $color: string; $on: boolean }>`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  transform: scale(${({ $on }) => ($on ? 1.12 : 1)});
  transition: transform 0.15s;
  &::after {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.paper};
    opacity: ${({ $on }) => ($on ? 1 : 0)};
  }
`

type Props = {
  pageKey: string
  title: ReactNode
  subtitle: ReactNode
  note?: ReactNode
  build: (ctx: CanvasRenderingContext2D, m: Metrics, w: number, h: number) => SheetLayout
  onPrev?: () => void
  onNext?: () => void
  prevLabel: string
  nextLabel: string
  backTo: string
  backLabel: string
  onSave: (snapshot: string) => void
  savedLabel: string
}

/** The shared frame for every practice sheet: top bar, pen tray, ruled sheet, thumb toolbar. */
export function PracticeShell(p: Props) {
  const sheet = useRef<SheetHandle>(null)
  const [showModel, setShowModel] = useState(true)
  const [hasInk, setHasInk] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [pen, setPen] = useState<PenSettings>(loadPen)
  const [tray, setTray] = useState(false)

  useEffect(() => savePen(pen), [pen])

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

  const nibName = NIBS.find((n) => n.id === pen.nib)?.name
  const inkName = INKS.find((i) => i.id === pen.ink)?.name

  return (
    <Screen>
      <TopBar>
        <IconButton label={p.backLabel} onClick={() => go(p.backTo)}>
          {Icons.back}
        </IconButton>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-[17px]">{p.title}</div>
          <div className="truncate font-sans text-[12.5px] text-ink-soft">{p.subtitle}</div>
        </div>
        <IconButton label={`Pen: ${nibName} nib, ${inkName} ink`} active={tray} onClick={() => setTray((v) => !v)}>
          {Icons.pen}
        </IconButton>
        <IconButton
          label={showModel ? 'Hide the model and write from memory' : 'Show the model to trace'}
          active={!showModel}
          onClick={() => setShowModel((v) => !v)}
        >
          {showModel ? Icons.eye : Icons.eyeOff}
        </IconButton>
      </TopBar>

      {tray && (
        <Tray aria-label="Pen">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Nib">
            {NIBS.map((n) => (
              <Chip
                key={n.id}
                type="button"
                role="radio"
                aria-checked={pen.nib === n.id}
                $on={pen.nib === n.id}
                onClick={() => setPen({ ...pen, nib: n.id })}
              >
                {n.name}
              </Chip>
            ))}
          </div>
          <div className="flex items-center gap-3" role="radiogroup" aria-label="Ink">
            {INKS.map((i) => (
              <Swatch
                key={i.id}
                type="button"
                role="radio"
                aria-checked={pen.ink === i.id}
                aria-label={`${i.name} ink`}
                title={i.name}
                $color={i.color}
                $on={pen.ink === i.id}
                onClick={() => setPen({ ...pen, ink: i.id })}
              />
            ))}
            <span className="ml-1 font-sans text-[12.5px] text-ink-soft">{inkName}</span>
          </div>
        </Tray>
      )}

      {!tray && p.note && (
        <div className="px-[14px] pb-1 font-sans text-[12.5px] leading-snug text-ink-soft">{p.note}</div>
      )}

      <Sheet
        ref={sheet}
        pageKey={p.pageKey}
        showModel={showModel}
        pen={pen}
        build={p.build}
        onInkChange={onInkChange}
      />

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
