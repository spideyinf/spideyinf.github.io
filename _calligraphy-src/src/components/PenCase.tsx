import { useCallback, useRef, useState } from 'react'
import styled from 'styled-components'
import { INKS, NIBS, PAPERS, PENS } from '../lib/pen'
import { stackRows } from '../lib/sheet'
import { usePen } from '../state/pen'
import { usePractice } from '../state/practice'
import { InkBottle, PenArt } from './PenArt'
import { paperUrls } from './paperScans'
import { Sheet, type SheetHandle } from './Sheet'
import { IconButton, Icons } from './ui'

const Section = styled.section`
  padding: 18px 0 4px;
  h3 {
    margin: 0 14px 10px;
    font: 400 19px ${({ theme }) => theme.font.serif};
  }
`
const Note = styled.p`
  margin: 8px 14px 0;
  font: 13px/1.45 ${({ theme }) => theme.font.sans};
  color: ${({ theme }) => theme.color.inkSoft};
`
const Row = styled.div`
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 0 14px 6px;
  scroll-snap-type: x mandatory;
`
const PenCard = styled.button<{ $on: boolean }>`
  flex: none;
  width: 196px;
  scroll-snap-align: start;
  padding: 10px 10px 12px;
  border: 0;
  text-align: left;
  background: ${({ $on, theme }) => ($on ? theme.color.tint : 'transparent')};
  box-shadow: inset 0 -2px 0 ${({ $on, theme }) => ($on ? theme.color.vermilion : 'transparent')};
  svg {
    display: block;
    width: 100%;
    height: auto;
  }
`
const Chip = styled.button<{ $on: boolean }>`
  flex: none;
  min-width: 52px;
  height: 40px;
  padding: 0 12px;
  border: 0;
  background: ${({ $on, theme }) => ($on ? theme.color.ink : theme.color.tint)};
  color: ${({ $on, theme }) => ($on ? theme.color.paper : theme.color.ink)};
  font: 14px ${({ theme }) => theme.font.sans};
`
const Bottles = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 0 8px;
`
const Bottle = styled.button<{ $on: boolean }>`
  padding: 8px 4px 10px;
  border: 0;
  background: ${({ $on, theme }) => ($on ? theme.color.tint : 'transparent')};
  box-shadow: inset 0 -2px 0 ${({ $on, theme }) => ($on ? theme.color.vermilion : 'transparent')};
  font: 12px/1.25 ${({ theme }) => theme.font.sans};
  color: ${({ theme }) => theme.color.ink};
  svg {
    display: block;
    width: 46px;
    height: 54px;
    margin: 0 auto 4px;
  }
`
const PaperTile = styled.button<{ $on: boolean; $tint: string; $scan: string }>`
  flex: 1;
  height: 74px;
  border: 0;
  padding: 0 0 8px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  background-color: ${({ $tint }) => $tint};
  background-image: url(${({ $scan }) => $scan});
  background-blend-mode: multiply;
  box-shadow: ${({ $on, theme }) => ($on ? `inset 0 -2px 0 ${theme.color.vermilion}, ` : '')}0 1px 2px rgb(70 50 25 / 0.2);
  font: 12.5px ${({ theme }) => theme.font.sans};
  color: ${({ theme }) => theme.color.ink};
`
const Hero = styled.div`
  padding: 26px 10px 18px;
  svg {
    display: block;
    width: 100%;
    height: auto;
    transform: rotate(-9deg);
    filter: drop-shadow(0 10px 6px rgb(60 40 20 / 0.22));
  }
`
const Pad = styled.div`
  position: relative;
  height: 120px;
  margin: 0 10px;
  display: flex;
  box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.tint};
`

/** Pens, nibs, inks and papers, with a scribble pad to feel the combination. */
export function PenCase() {
  const { settings, pen, nib, ink, paper, set, choosePen } = usePen()
  const { script } = usePractice()
  const pad = useRef<SheetHandle>(null)
  const [hasInk, setHasInk] = useState(false)
  const build = useCallback((_c: CanvasRenderingContext2D, _m: unknown, w: number, h: number) => stackRows([], w, h, 26), [])

  return (
    <div>
      <div className="flex items-center justify-between px-[14px] pt-1 pb-2">
        <p className="m-0 font-sans text-[12.5px] text-ink-soft">Try it here</p>
        <IconButton label="Clear the scribble pad" onClick={() => pad.current?.clear()} disabled={!hasInk}>
          {Icons.clear}
        </IconButton>
      </div>
      <Pad>
        <Sheet ref={pad} pageKey="pen-case" font={script.font} showModel={false} build={build} onInkChange={setHasInk} />
      </Pad>

      {/* The pen in hand, large. */}
      <Hero aria-hidden>
        <PenArt pen={pen} ink={ink} />
      </Hero>
      <p className="m-0 px-[14px] text-center font-sans text-[13px] text-ink-soft">
        {pen.name} with {/^[aeiou]/i.test(nib.name) ? 'an' : 'a'} {nib.name.toLowerCase()} nib, filled with {ink.name}, on {paper.name.toLowerCase()} paper
      </p>

      <Section aria-label="Pen">
        <h3>Pen</h3>
        <Row role="radiogroup" aria-label="Pen">
          {PENS.map((p) => (
            <PenCard key={p.id} type="button" role="radio" aria-checked={p.id === pen.id} $on={p.id === pen.id} onClick={() => choosePen(p.id)}>
              <PenArt pen={p} ink={ink} />
              <div className="mt-2 text-[17px]">{p.name}</div>
              <div className="mt-0.5 font-sans text-[12px] leading-snug text-ink-soft">{p.blurb}</div>
            </PenCard>
          ))}
        </Row>
      </Section>

      <Section aria-label="Nib">
        <h3>Nib</h3>
        <Row role="radiogroup" aria-label="Nib">
          {NIBS.map((n) => (
            <Chip key={n.id} type="button" role="radio" aria-checked={n.id === nib.id} aria-label={n.name} $on={n.id === nib.id} onClick={() => set({ nib: n.id })}>
              {n.short}
            </Chip>
          ))}
        </Row>
        <Note>
          <b className="font-semibold text-ink">{nib.name}.</b> {nib.feel}
        </Note>
      </Section>

      <Section aria-label="Ink">
        <h3>Ink</h3>
        <Bottles role="radiogroup" aria-label="Ink">
          {INKS.map((i) => (
            <Bottle key={i.id} type="button" role="radio" aria-checked={i.id === ink.id} $on={i.id === ink.id} onClick={() => set({ ink: i.id })}>
              <InkBottle ink={i} />
              {i.name}
            </Bottle>
          ))}
        </Bottles>
        <Note>{ink.note}</Note>
      </Section>

      <Section aria-label="Paper">
        <h3>Paper</h3>
        <div className="flex gap-2 px-[14px]" role="radiogroup" aria-label="Paper">
          {PAPERS.map((p) => (
            <PaperTile
              key={p.id}
              type="button"
              role="radio"
              aria-checked={p.id === paper.id}
              $on={p.id === paper.id}
              $tint={p.tint}
              $scan={paperUrls[p.id]}
              onClick={() => set({ paper: p.id })}
            >
              {p.name}
            </PaperTile>
          ))}
        </div>
        <Note>{paper.note}</Note>
      </Section>

      <Section aria-label="Sound">
        <label className="flex items-center gap-3 px-[14px] pb-6">
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={(e) => set({ sound: e.target.checked })}
            className="h-5 w-5 accent-[var(--color-ink)]"
          />
          <span>
            <span className="block text-[17px]">Nib sound</span>
            <span className="block font-sans text-[12.5px] text-ink-soft">
              The whisper of the nib on paper, louder as you write faster.
            </span>
          </span>
        </label>
      </Section>
    </div>
  )
}
