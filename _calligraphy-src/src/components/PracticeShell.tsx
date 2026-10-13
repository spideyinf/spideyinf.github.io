import { useEffect, useRef, useState, type ReactNode } from 'react'
import styled from 'styled-components'
import type { Metrics } from '../lib/hand'
import { photoToPage } from '../lib/photo'
import { go } from '../lib/router'
import type { SheetLayout } from '../lib/sheet'
import { usePractice } from '../state/practice'
import { ModelSheet } from './ModelSheet'
import { IconButton, Icons, SaveButton, Toast, Toolbar, TopBar } from './ui'

const Screen = styled.main`
  display: flex;
  flex-direction: column;
  height: 100dvh;
  padding-top: env(safe-area-inset-top);
  overflow: hidden;
`

type Props = {
  title: ReactNode
  subtitle: ReactNode
  /** Content between the top bar and the model (e.g. the letter tutorial). */
  lead?: ReactNode
  build: (ctx: CanvasRenderingContext2D, m: Metrics, w: number, h: number) => SheetLayout
  onPrev?: () => void
  onNext?: () => void
  prevLabel: string
  nextLabel: string
  backTo: string
  backLabel: string
  /** Already marked as written today? */
  written: boolean
  onWritten: () => void
  onPhoto: (src: string) => void
}

/**
 * The model to copy, and what happens after: you write on real paper with a
 * real pen, then mark it written, or keep a photo of the page.
 */
export function PracticeShell(p: Props) {
  const { script } = usePractice()
  const [toast, setToast] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      p.onPhoto(await photoToPage(f))
      setToast('Photo kept with today’s pages')
    } catch {
      setToast('That photo could not be opened')
    }
  }

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
      </TopBar>

      {p.lead}

      <p className="m-0 px-[14px] pb-1 font-sans text-[12.5px] leading-snug text-ink-soft">
        Copy it onto your paper with your own pen, then come back.
      </p>
      <ModelSheet font={script.font} build={p.build} />

      <Toolbar>
        <IconButton label={p.prevLabel} onClick={p.onPrev} disabled={!p.onPrev}>
          {Icons.prev}
        </IconButton>
        <IconButton label="Add a photo of your page" onClick={() => file.current?.click()}>
          {Icons.camera}
        </IconButton>
        <SaveButton
          type="button"
          disabled={p.written}
          onClick={() => {
            p.onWritten()
            setToast('Marked as written today')
          }}
        >
          {p.written ? 'Written today' : 'I wrote it'}
        </SaveButton>
        <span className="w-[46px]" aria-hidden />
        <IconButton label={p.nextLabel} onClick={p.onNext} disabled={!p.onNext}>
          {Icons.next}
        </IconButton>
      </Toolbar>
      <input
        ref={file}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          void onFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
      <Toast $show={!!toast} role="status" aria-live="polite">
        {toast}
      </Toast>
    </Screen>
  )
}
