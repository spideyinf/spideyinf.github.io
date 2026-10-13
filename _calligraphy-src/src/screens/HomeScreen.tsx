import { useEffect, useState } from 'react'
import styled from 'styled-components'
import { PenArt } from '../components/PenArt'
import { Flourish, Hand, IconButton, Icons } from '../components/ui'
import { dayKey, longDate, shortDate } from '../lib/date'
import { href } from '../lib/router'
import { usePractice, type SavedPage } from '../state/practice'
import { usePen } from '../state/pen'
import { go } from '../lib/router'
import { PREFACE_FONT, prefaceOfTheDay } from '../lib/prefaces'
import { sharePage } from '../lib/shareCard'
import fibers from '../assets/paper/lightpaperfibers.png'

// A fresh sheet laid on the page: lighter paper, torn edges, a slight tilt.
// Its contents size themselves to the note's width (container units).
const Note = styled.a<{ $tilt: number }>`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 4cqw;
  margin: 0 14px;
  padding: 7cqw 6cqw 6cqw;
  color: ${({ theme }) => theme.color.ink};
  text-decoration: none;
  transform: rotate(${({ $tilt }) => $tilt}deg);
  transition: transform 0.2s;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-color: ${({ theme }) => theme.color.note};
    background-image: url(${fibers});
    background-size: 500px 300px;
    background-blend-mode: multiply;
    filter: url('#deckle') drop-shadow(0 1px 1px rgb(70 50 25 / 0.22)) drop-shadow(0 8px 14px rgb(70 50 25 / 0.12));
  }
  &:active {
    transform: rotate(0deg) scale(0.985);
  }
`
const NoteWrap = styled.div`
  container-type: inline-size;
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
    box-shadow: 0 1px 2px rgb(70 50 25 / 0.25);
  }
`

const Viewer = styled.div`
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  flex-direction: column;
  padding-top: env(safe-area-inset-top);
  isolation: isolate;
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${({ theme }) => theme.color.paperDeep};
  }
  img {
    flex: 1;
    min-height: 0;
    width: 100%;
    object-fit: contain;
  }
`

function Strip({ pages, onOpen, dated }: { pages: SavedPage[]; onOpen: (p: SavedPage) => void; dated?: boolean }) {
  return (
    <div className="flex gap-2.5 overflow-x-auto px-[14px] pt-3 pb-2">
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
  const { today, lettersToday, pages, streak, deletePage, script } = usePractice()
  const { pen, nib, ink, paper } = usePen()
  const [open, setOpen] = useState<SavedPage | null>(null)
  const letter = prefaceOfTheDay()

  // The first visit opens on the welcome letter.
  useEffect(() => {
    try {
      if (localStorage.getItem('wtl:welcomed')) return
      localStorage.setItem('wtl:welcomed', '1')
      go(href.preface('begin'), true)
    } catch {
      /* storage blocked: just show Home */
    }
  }, [])
  const todayKey = dayKey()
  const todayPages = pages.filter((p) => p.day === todayKey)
  const earlier = pages.filter((p) => p.day !== todayKey)

  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex justify-between px-[14px] pt-3 font-sans text-[12.5px] text-ink-soft">
        <span>{streak > 0 ? `${streak}-day streak` : 'Start your streak today'}</span>
        <span>{longDate()}</span>
      </div>

      {/* The title, written on the page itself. */}
      <header className="inked px-[14px] pt-[12vw] pb-[7vw] text-center text-ink [container-type:inline-size]">
        <h1 className="m-0 font-normal">
          <Hand text="Writing" size="10cqw" font="Pinyon Script" />
          <br />
          <Hand text="to Learn" size="10cqw" font="Pinyon Script" />
        </h1>
        <p className="m-0 mt-[3cqw] leading-[1.05]">
          <Hand text="paper, pen and ink," size="4.6cqw" font="Pinyon Script" />
          <br />
          <Hand text="a line every day" size="4.6cqw" font="Pinyon Script" />
        </p>
        <Flourish className="mx-auto mt-[5cqw] block w-[42cqw]" />
      </header>

      {/* Today's letter from the prefaces. */}
      <NoteWrap>
        <Note href={href.preface(letter.id)} $tilt={0.4} style={{ display: 'block' }}>
          <p className="m-0 font-sans text-[12px] text-ink-soft">Today's letter</p>
          <div className="inked mt-1">
            <Hand text={letter.title} size="3.4cqw" font={PREFACE_FONT} />
          </div>
          <p className="m-0 mt-[1.5cqw] line-clamp-2 font-sans text-[clamp(12.5px,3.6cqw,14.5px)] leading-snug text-ink-soft">
            {letter.body.find((b) => !b.endsWith(','))}
          </p>
          <p className="m-0 mt-[2.5cqw] font-sans text-[13px] text-cobalt underline underline-offset-2">Read it as it's written</p>
        </Note>
      </NoteWrap>

      {/* What you're writing with: the hand and the pen. */}
      <section aria-label="Your hand and pen" className="mt-8 px-[14px]">
        <a href={href.hands} className="flex items-center justify-between gap-3 py-2 text-ink no-underline">
          <span className="min-w-0">
            <span className="block font-sans text-[12px] text-ink-soft">The hand you're learning</span>
            <span className="inked block truncate">
              <Hand text={script.name} size={11} />
            </span>
          </span>
          <span className="flex-none font-sans text-[13px] text-cobalt underline underline-offset-2">Change</span>
        </a>
        <a href={href.pens} className="mt-2 flex items-center gap-3 py-2 text-ink no-underline">
          <span className="w-[42%] flex-none">
            <PenArt pen={pen} ink={ink} className="block h-auto w-full -rotate-6" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[16px]">{pen.name}</span>
            <span className="block font-sans text-[12.5px] leading-snug text-ink-soft">
              {nib.name} nib, {ink.name}, {paper.name.toLowerCase()} paper
            </span>
          </span>
          <span className="flex-none font-sans text-[13px] text-cobalt underline underline-offset-2">Pen case</span>
        </a>
      </section>

      <nav aria-label="Practice" className="mt-8 flex flex-col gap-6">
        <NoteWrap>
          <Note href={href.letters} $tilt={-0.8}>
            <div className="min-w-0">
              <div className="text-[clamp(24px,8cqw,32px)] leading-none">ABC</div>
              <p className="m-0 mt-[2.5cqw] font-sans text-[clamp(12.5px,3.7cqw,15px)] leading-snug text-ink-soft">
                {script.name} capitals and lowercase, stroke by stroke
              </p>
              <p className="m-0 mt-[3cqw] font-sans text-[12px] text-ink-soft">{lettersToday.length} of 26 today</p>
            </div>
            <div className="inked pr-[2cqw]" aria-hidden>
              <Hand text="Aa" size="11cqw" />
            </div>
          </Note>
        </NoteWrap>
        <NoteWrap>
          <Note href={href.quotes} $tilt={0.7}>
            <div className="min-w-0">
              <div className="text-[clamp(24px,8cqw,32px)] leading-none">Paragraph</div>
              <p className="m-0 mt-[2.5cqw] font-sans text-[clamp(12.5px,3.7cqw,15px)] leading-snug text-ink-soft">
                Quotes to write by hand, or your own words
              </p>
              <p className="m-0 mt-[3cqw] font-sans text-[12px] text-ink-soft">
                {today.quotes.length ? `${today.quotes.length} written today` : 'None yet today'}
              </p>
            </div>
            <div className="inked text-right leading-[1.1]" aria-hidden>
              <Hand text="Little by" size="4.4cqw" />
              <br />
              <Hand text="little" size="4.4cqw" />
            </div>
          </Note>
        </NoteWrap>
      </nav>

      <section className="pt-10" aria-label="Your pages">
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
        Named after William Zinsser's <i className="font-serif text-[14px]">Writing to Learn</i>: we come to
        understand a thing by writing it out, a little every day.
        <span className="mt-3 block text-[11px] opacity-80">
          Paper texture from{' '}
          <a className="underline underline-offset-2" href="https://github.com/subtlepatterns/SubtlePatterns">
            Subtle Patterns
          </a>
          , CC BY-SA 3.0
        </span>
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
          <img src={open.src} alt={`Your handwritten page: ${open.label}`} />
        </Viewer>
      )}
    </main>
  )
}
