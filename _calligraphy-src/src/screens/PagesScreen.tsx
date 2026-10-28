import { useState } from 'react'
import styled from 'styled-components'
import { PageHeader, PrimaryLink, Screen, SectionTitle, Voice } from '../components/b'
import { IconButton, Icons } from '../components/ui'
import { dayKey, shortDate } from '../lib/date'
import { href } from '../lib/router'
import { sharePage } from '../lib/shareCard'
import { usePractice, type SavedPage } from '../state/practice'

const Viewer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
  background: ${({ theme }) => theme.color.paperDeep};
  img {
    flex: 1;
    min-height: 0;
    width: 100%;
    object-fit: contain;
  }
`

/** Your own pages: photos of what you wrote on paper, kept on this phone. */
export function PagesScreen() {
  const { pages, deletePage } = usePractice()
  const [open, setOpen] = useState<SavedPage | null>(null)
  const today = dayKey()
  const groups = new Map<string, SavedPage[]>()
  for (const p of pages) groups.set(p.day, [...(groups.get(p.day) ?? []), p])

  return (
    <Screen>
      <PageHeader title="My pages" />
      <p className="m-0 font-serif text-[19px] leading-snug text-ink-soft italic">Every page you wrote, kept on this phone.</p>
      <PrimaryLink href={href.capture()} className="mt-4">
        {Icons.camera}
        Photograph a page
      </PrimaryLink>

      {!pages.length && (
        <div className="mt-8 flex flex-col items-start gap-3 rounded-[16px] bg-[rgb(120_98_60/0.08)] p-5">
          <p className="m-0 text-[19px] leading-snug">No pages yet.</p>
          <p className="m-0 text-[15px] leading-relaxed text-ink-soft">
            Write a line on paper, then photograph it: the camera finds your handwriting and reads it.
          </p>
          <a href={href.letters} className="text-[17px] text-cobalt underline underline-offset-4">
            Start with a letter
          </a>
        </div>
      )}

      {[...groups.entries()].map(([day, list]) => (
        <section key={day} aria-label={day === today ? 'Today' : shortDate(day)} className="mt-6 flex flex-col gap-3">
          <SectionTitle>{day === today ? <>Today</> : <Voice style={{ fontWeight: 400 }}>{shortDate(day)}</Voice>}</SectionTitle>
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            {list.map((p, k) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setOpen(p)}
                aria-label={`Open your page: ${p.label}`}
                className="press flex flex-col gap-1.5 border-0 bg-transparent p-0 text-left"
                style={{ transform: `rotate(${((k % 3) - 1) * 1.2}deg)` }}
              >
                <img src={p.src} alt="" className="block aspect-[3/4] w-full rounded-[4px] object-cover object-top shadow-[0_1px_2px_rgb(70_50_25/0.25),0_8px_18px_rgb(70_50_25/0.12)]" />
                <span className="truncate text-[15px] text-ink-soft">
                  {p.label}
                  {p.hand ? ` · ${p.hand}` : ''}
                </span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <p className="m-0 mt-10 rounded-[16px] border border-dashed border-rule p-4 text-[15px] leading-relaxed text-ink-soft">
        <b className="font-semibold text-ink">Coming:</b> a shared feed of pages from everyone writing along. Until then, share any page as a card from its viewer.
      </p>

      {open && (
        <Viewer role="dialog" aria-modal="true" aria-label={`Page ${open.label}`}>
          <div className="flex items-center gap-1 px-2 py-2">
            <IconButton label="Close" onClick={() => setOpen(null)}>
              {Icons.close}
            </IconButton>
            <div className="min-w-0 flex-1 truncate text-[18px] font-semibold">
              {open.label}
              <span className="ml-2 text-[14px] font-normal text-ink-soft">{shortDate(open.day)}</span>
            </div>
            <IconButton label="Share this page" onClick={() => void sharePage(open)}>
              {Icons.share}
            </IconButton>
            <a
              href={open.src}
              download={`writing-to-learn-${open.day}-${open.label}.jpg`}
              aria-label="Download this page"
              className="grid h-[46px] w-[46px] place-items-center text-ink"
            >
              {Icons.download}
            </a>
            <IconButton
              label="Delete this page"
              onClick={() => {
                deletePage(open.id)
                setOpen(null)
              }}
            >
              {Icons.clear}
            </IconButton>
          </div>
          <img src={open.src} alt={`Your handwritten page: ${open.label}${open.text ? `. ${open.text}` : ''}`} />
          {(open.text || open.tools) && (
            <div className="max-h-[34vh] overflow-y-auto bg-paper px-5 py-4">
              {open.text && <p className="m-0 font-serif text-[18px] leading-snug whitespace-pre-line italic">{open.text}</p>}
              {open.tools && (
                <p className="m-0 mt-2 text-[14.5px] text-ink-soft">{[open.tools.pen, open.tools.ink, open.tools.paper].filter(Boolean).join(' · ')}</p>
              )}
            </div>
          )}
        </Viewer>
      )}
    </Screen>
  )
}
