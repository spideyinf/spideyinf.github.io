/* eslint-disable react/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  inkOf,
  loadPen,
  nibOf,
  paperOf,
  penOf,
  savePen,
  type Ink,
  type Nib,
  type Paper,
  type Pen,
  type PenSettings,
} from '../lib/pen'

type Ctx = {
  settings: PenSettings
  pen: Pen
  nib: Nib
  ink: Ink
  paper: Paper
  set: (patch: Partial<PenSettings>) => void
  /** Pick a pen; it comes with its own nib. */
  choosePen: (id: PenSettings['pen']) => void
}

const PenContext = createContext<Ctx | null>(null)

export function PenProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<PenSettings>(loadPen)
  useEffect(() => savePen(settings), [settings])

  // The paper is the whole page: index.css switches the background on this attribute.
  useEffect(() => {
    document.documentElement.dataset.paper = settings.paper
  }, [settings.paper])

  const set = useCallback((patch: Partial<PenSettings>) => setSettings((s) => ({ ...s, ...patch })), [])
  const choosePen = useCallback((id: PenSettings['pen']) => setSettings((s) => ({ ...s, pen: id, nib: penOf(id).nib })), [])

  const value = useMemo<Ctx>(
    () => ({
      settings,
      pen: penOf(settings.pen),
      nib: nibOf(settings.nib),
      ink: inkOf(settings.ink),
      paper: paperOf(settings.paper),
      set,
      choosePen,
    }),
    [settings, set, choosePen],
  )
  return <PenContext.Provider value={value}>{children}</PenContext.Provider>
}

export function usePen() {
  const ctx = useContext(PenContext)
  if (!ctx) throw new Error('usePen must be used inside PenProvider')
  return ctx
}
