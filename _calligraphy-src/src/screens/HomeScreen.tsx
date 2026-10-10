import { useState } from 'react'
import styled from 'styled-components'
import { Hand, IconButton, Icons, Logo, Oval, StoryBar } from '../components/ui'
import { dayKey, lastDays, longDate, shortDate } from '../lib/date'
import { LETTERS } from '../lib/letters'
import { href } from '../lib/router'
import { usePractice, type SavedPage } from '../state/practice'

const StoryCard = styled.a<{ $bg: string }>`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 250px;
  padding: 16px 16px 18px;
  border-radius: ${({ theme }) => theme.radius.card};
  background: ${({ $bg }) => $bg};
  color: #fff;
  text-decoration: none;
  overflow: hidden;
  transition: transform 0.15s;
  &:active {
    transform: scale(0.98);
  }
  /* The notch, as on the phone-story cards this layout borrows from. */
  &::before {
    content: '';
    position: absolute;
    top: 9px;
    left: 50%;
    width: 54px;
    height: 15px;
    margin-left: -27px;
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.85);
  }
`

const Thumb = styled.button`
  flex: none;
  width: 92px;
  padding: 0;
  border: 0;
  background: none;
  text-align: left;
  img {
    display: block;
    width: 92px;
    height: 128px;
    object-fit: cover;
    object-position: top;
    border-radius: ${({ theme }) => theme.radius.thumb};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.color.rule};
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

export function HomeScreen() {
  const { days, today, pages, streak, deletePage } = usePractice()
  const [open, setOpen] = useState<SavedPage | null>(null)
  const todayKey = dayKey()

  const week = lastDays(7).map((d) => {
    const k = dayKey(d)
    return days[k] ? 'done' : k === todayKey ? 'current' : 'empty'
  }) as ('done' | 'current' | 'empty')[]

  const nextLetter = LETTERS.find((l) => !today.letters.includes(l)) ?? 'A'
  const todayPages = pages.filter((p) => p.day === todayKey)
  const earlier = pages.filter((p) => p.day !== todayKey)

  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <StoryBar states={week} label={`Last 7 days. ${streak}-day streak.`} />

      <header className="flex items-center gap-2.5 px-4 pt-3">
        <Logo />
        <div className="leading-tight">
          <div className="text-[15px] font-semibold">Daily Hand</div>
          <div className="font-sans text-[12.5px] text-ink-soft">
            {streak > 0 ? `${streak}-day streak` : 'Start your streak today'}
          </div>
        </div>
        <div className="ml-auto font-sans text-[12.5px] text-ink-soft">{longDate()}</div>
      </header>

      <section className="px-5 pt-10 pb-4 text-center">
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

      <section className="grid grid-cols-2 gap-3 px-4" aria-label="Practice">
        <StoryCard href={href.abc(nextLetter)} $bg="var(--color-vermilion)">
          <div className="pt-8 text-center">
            <Hand text={nextLetter + nextLetter.toLowerCase()} size={24} />
          </div>
          <div>
            <div className="text-[24px] leading-none">ABC</div>
            <div className="mt-1.5 font-sans text-[12.5px] leading-snug text-white/85">
              Copperplate capitals, business cursive letters
            </div>
            <div className="mt-2.5 font-sans text-[12px] text-white/85">{today.letters.length} of 26 today</div>
          </div>
        </StoryCard>
        <StoryCard href={href.quotes} $bg="var(--color-cobalt)">
          <div className="pt-8 text-center">
            <Hand text="Little by little" size={9} />
          </div>
          <div>
            <div className="text-[24px] leading-none">Paragraph</div>
            <div className="mt-1.5 font-sans text-[12.5px] leading-snug text-white/85">
              Quotes to write, or your own words
            </div>
            <div className="mt-2.5 font-sans text-[12px] text-white/85">
              {today.quotes.length ? `${today.quotes.length} written today` : 'None yet today'}
            </div>
          </div>
        </StoryCard>
      </section>

      <section className="pt-9" aria-label="Your pages">
        <h2 className="m-0 px-5 text-[19px] font-normal">Today's pages</h2>
        {todayPages.length ? (
          <div className="flex gap-3 overflow-x-auto px-5 pt-3 pb-1">
            {todayPages.map((p) => (
              <Thumb key={p.id} type="button" onClick={() => setOpen(p)} aria-label={`Open page ${p.label}`}>
                <img src={p.src} alt="" />
                <div className="mt-1.5 truncate font-sans text-[12px] text-ink-soft">{p.label}</div>
              </Thumb>
            ))}
          </div>
        ) : (
          <p className="m-0 px-5 pt-2 font-sans text-[13.5px] leading-relaxed text-ink-soft">
            Pages you save today appear here.{' '}
            <a className="text-cobalt underline underline-offset-2" href={href.abc(nextLetter)}>
              Start with the letter {nextLetter}
            </a>
            .
          </p>
        )}

        {earlier.length > 0 && (
          <>
            <h2 className="m-0 px-5 pt-7 text-[19px] font-normal">Earlier</h2>
            <div className="flex gap-3 overflow-x-auto px-5 pt-3 pb-1">
              {earlier.map((p) => (
                <Thumb key={p.id} type="button" onClick={() => setOpen(p)} aria-label={`Open page ${p.label}`}>
                  <img src={p.src} alt="" />
                  <div className="mt-1.5 truncate font-sans text-[12px] text-ink-soft">
                    {shortDate(p.day)}, {p.label}
                  </div>
                </Thumb>
              ))}
            </div>
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
