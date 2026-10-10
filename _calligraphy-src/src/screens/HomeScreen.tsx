import { useState } from 'react'
import styled from 'styled-components'
import { Hand, IconButton, Icons, Logo, Oval } from '../components/ui'
import { dayKey, longDate, shortDate } from '../lib/date'
import { href } from '../lib/router'
import { usePractice, type SavedPage } from '../state/practice'

// Full-bleed bands: no frame, no outline, and the script runs off the screen edge.
const Band = styled.a<{ $bg: string }>`
  position: relative;
  display: block;
  min-height: 230px;
  padding: 22px 16px 20px;
  background: ${({ $bg }) => $bg};
  color: #fff;
  text-decoration: none;
  overflow: hidden;
  &:active {
    filter: brightness(0.95);
  }
`
const Bleed = styled.div`
  position: absolute;
  right: -18px;
  bottom: -6px;
  white-space: nowrap;
  opacity: 0.95;
  pointer-events: none;
`

const Thumb = styled.button`
  flex: none;
  width: 96px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  img {
    display: block;
    width: 96px;
    height: 134px;
    object-fit: cover;
    object-position: top;
    border-radius: ${({ theme }) => theme.radius.thumb};
  }
`

const Viewer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.color.paperDeep};
  padding-top: env(safe-area-inset-top);
  img {
    flex: 1;
    min-height: 0;
    width: 100%;
    object-fit: contain;
  }
`

function Strip({ pages, onOpen, dated }: { pages: SavedPage[]; onOpen: (p: SavedPage) => void; dated?: boolean }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto px-[14px] pt-3 pb-1">
      {pages.map((p) => (
        <Thumb key={p.id} type="button" onClick={() => onOpen(p)} aria-label={`Open page ${p.label}`}>
          <img src={p.src} alt="" />
          <div className="mt-1.5 truncate font-sans text-[12px] text-ink-soft">
            {dated ? `${shortDate(p.day)}, ${p.label}` : p.label}
          </div>
        </Thumb>
      ))}
    </div>
  )
}

export function HomeScreen() {
  const { today, pages, streak, deletePage } = usePractice()
  const [open, setOpen] = useState<SavedPage | null>(null)
  const todayKey = dayKey()
  const todayPages = pages.filter((p) => p.day === todayKey)
  const earlier = pages.filter((p) => p.day !== todayKey)

  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <header className="flex items-center gap-2.5 px-[14px] pt-3">
        <Logo />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Daily Hand</div>
          <div className="font-sans text-[12.5px] text-ink-soft">
            {streak > 0 ? `${streak}-day streak` : 'Start your streak today'}
          </div>
        </div>
        <div className="ml-auto font-sans text-[12.5px] text-ink-soft">{longDate()}</div>
      </header>

      <section className="px-[14px] pt-10 pb-6 text-center">
        <h1 className="m-0 font-normal">
          <Hand text="Write to Learn" size={19} />
        </h1>
        <div className="mt-5 text-vermilion">
          <Oval>
            <p className="m-0 font-sans text-[13.5px] leading-snug text-ink">
              Nulla dies sine linea.
              <br />
              No day without a line.
            </p>
          </Oval>
        </div>
      </section>

      <nav aria-label="Practice">
        <Band href={href.letters} $bg="var(--color-vermilion)">
          <Bleed aria-hidden>
            <Hand text="Aa Bb" size={34} />
          </Bleed>
          <div className="relative max-w-[60%]">
            <div className="text-[30px] leading-none">ABC</div>
            <div className="mt-2 font-sans text-[13px] leading-snug text-white/90">
              Copperplate capitals, business cursive letters
            </div>
          </div>
          <div className="relative mt-3 font-sans text-[12.5px] text-white/75">{today.letters.length} of 26 today</div>
        </Band>
        <Band href={href.quotes} $bg="var(--color-cobalt)">
          <Bleed aria-hidden style={{ right: -60 }}>
            <Hand text="Little by little" size={17} />
          </Bleed>
          <div className="relative max-w-[55%]">
            <div className="text-[30px] leading-none">Paragraph</div>
            <div className="mt-2 font-sans text-[13px] leading-snug text-white/90">Quotes to write, or your own words</div>
          </div>
          <div className="relative mt-3 font-sans text-[12.5px] text-white/75">
            {today.quotes.length ? `${today.quotes.length} written today` : 'None yet today'}
          </div>
        </Band>
      </nav>

      <section className="pt-9" aria-label="Your pages">
        <h2 className="m-0 px-[14px] text-[19px] font-normal">Today's pages</h2>
        {todayPages.length ? (
          <Strip pages={todayPages} onOpen={setOpen} />
        ) : (
          <p className="m-0 px-[14px] pt-2 font-sans text-[13.5px] leading-relaxed text-ink-soft">
            Pages you save today appear here.{' '}
            <a className="text-cobalt underline underline-offset-2" href={href.letters}>
              Choose a letter to start
            </a>
            .
          </p>
        )}
        {earlier.length > 0 && (
          <>
            <h2 className="m-0 px-[14px] pt-7 text-[19px] font-normal">Earlier</h2>
            <Strip pages={earlier} onOpen={setOpen} dated />
          </>
        )}
      </section>

      <footer className="px-6 pt-12 text-center font-sans text-[12.5px] leading-relaxed text-ink-soft">
        After William Zinsser's <i className="font-serif text-[14px]">Writing to Learn</i>: we come to understand
        a thing by writing it out, a little every day.
      </footer>

      {open && (
        <Viewer role="dialog" aria-modal="true" aria-label={`Page ${open.label}`}>
          <div className="flex items-center gap-2 px-2 py-2">
            <IconButton label="Close" onClick={() => setOpen(null)}>
              {Icons.close}
            </IconButton>
            <div className="flex-1 text-[17px]">
              {open.label}
              <span className="ml-2 font-sans text-[12.5px] text-ink-soft">{shortDate(open.day)}</span>
            </div>
            <a
              href={open.src}
              download={`daily-hand-${open.day}-${open.label}.jpg`}
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
          <img src={open.src} alt={`Your handwritten page: ${open.label}`} />
        </Viewer>
      )}
    </main>
  )
}
