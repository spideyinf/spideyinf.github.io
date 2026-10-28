import { useEffect, useState } from 'react'
import { PrimaryLink, Screen, SectionTitle, Voice } from '../components/b'
import { Hand } from '../components/ui'
import { dayKey, longDate } from '../lib/date'
import { LETTERS } from '../lib/letters'
import { go, href } from '../lib/router'
import { SCRIPTS } from '../lib/scripts'
import { usePractice } from '../state/practice'

const SHORT: Record<string, string> = {
  copperplate: 'Copperplate',
  business: 'Business',
  italic: 'Italic',
  print: 'Modern print',
  vietnamese: 'Vietnamese',
  monoline: 'Monoline',
}

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M6 3 L11 8 L6 13" fill="none" stroke="#57534E" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

export function HomeScreen() {
  const { lettersToday, today, streak, script, setScript, quotes, pages } = usePractice()

  // The first visit opens on the welcome letter.
  useEffect(() => {
    try {
      if (localStorage.getItem('wtl:welcomed')) return
      localStorage.setItem('wtl:welcomed', '1')
      go(href.preface, true)
    } catch {
      /* storage blocked: just show Home */
    }
  }, [])

  const nextLetter = LETTERS.find((l) => !lettersToday.includes(l)) ?? 'A'
  const lower = nextLetter.toLowerCase()
  const [quote] = useState(() => {
    const d = new Date()
    const n = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5)
    const pool = quotes.filter((q) => !q.custom)
    return pool[n % pool.length]
  })
  const todayPages = pages.filter((p) => p.day === dayKey())
  const wroteToday = lettersToday.length + today.quotes.length > 0

  return (
    <Screen>
      <header className="flex min-h-[44px] items-center justify-between pt-3.5">
        <div className="flex flex-col">
          <p className="m-0 text-[15px] text-ink-soft">{longDate()}</p>
          <p className="m-0 text-[15px] font-semibold text-vermilion">
            {streak > 0 ? `${streak}-day streak${wroteToday ? '' : ', keep it going'}` : 'Start your streak today'}
          </p>
        </div>
        <a
          href={href.preface}
          aria-label="Read the preface"
          title="Read the preface"
          className="press grid h-11 w-11 place-items-center rounded-[14px] bg-tint"
        >
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
            <path d="M5 4.5 H15.5 L19 8 V19.5 H5 Z M15.5 4.5 V8 H19 M8.5 11.5 H15.5 M8.5 15 H13" fill="none" stroke="#1C2433" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </header>

      <section className="mt-[18px]">
        <h1 className="m-0 text-[40px] leading-none font-extrabold tracking-[-0.03em]">
          Writing <Voice>to</Voice> Learn
        </h1>
        <p className="m-0 mt-2 font-serif text-[20px] leading-[1.35] text-ink-soft italic">Paper, pen and ink. A line every day.</p>
      </section>

      <section aria-labelledby="today-h" className="mt-8 flex flex-col gap-2.5">
        <SectionTitle id="today-h">Today</SectionTitle>
        <a href={href.abc(nextLetter)} className="press grid min-h-[76px] grid-cols-[60px_minmax(0,1fr)_16px] items-center gap-3.5 text-ink no-underline">
          <span aria-hidden className="text-center text-cobalt">
            <Hand text={lower} size={20} />
          </span>
          <span className="flex flex-col">
            <span className="text-[15px] text-ink-soft">01 · ABC</span>
            <span className="text-[20px] leading-tight">Learn the letter {lower}</span>
            <span className="text-[15px] text-ink-soft">{lettersToday.length} of 26 letters done</span>
          </span>
          <Chevron />
        </a>
        <a href={href.write(quote.id)} className="press grid min-h-[76px] grid-cols-[60px_minmax(0,1fr)_16px] items-center gap-3.5 text-ink no-underline">
          <span aria-hidden className="pt-[18px] text-center font-serif text-[68px] leading-[0.8] text-vermilion italic">
            “
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="text-[15px] text-ink-soft">02 · Paragraph</span>
            <span className="text-[20px] leading-tight">Copy one quote</span>
            <span className="truncate text-[15px] text-ink-soft">{quote.text.split('\n')[0]}</span>
          </span>
          <Chevron />
        </a>
        <PrimaryLink href={href.abc(nextLetter)} className="mt-1.5">
          Begin with the letter {lower}
        </PrimaryLink>
      </section>

      <section aria-labelledby="hand-h" className="mt-[30px] flex flex-col gap-2">
        <SectionTitle id="hand-h" aside="one at a time">
          Your <Voice>letter</Voice> style
        </SectionTitle>
        <div role="group" aria-label="Letter styles" className="grid grid-cols-3 gap-2">
          {SCRIPTS.map((s) => {
            const on = s.id === script.id
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                aria-label={s.name}
                onClick={() => setScript(s.id)}
                className="press relative flex min-h-[96px] flex-col items-center justify-end gap-0.5 rounded-[14px] border-0 px-1 pt-2 pb-2"
                style={{ background: on ? 'rgb(30 58 95 / 0.08)' : 'rgb(120 98 60 / 0.06)', color: on ? '#1E3A5F' : '#1C2433' }}
              >
                <span aria-hidden lang={s.id === 'vietnamese' ? 'vi' : undefined}>
                  <Hand text={s.id === 'vietnamese' ? 'Ăă' : 'Aa'} size={13} font={s.font} lineHeight={1} />
                </span>
                <span className="text-[clamp(11.5px,3.4vw,13px)] leading-tight font-semibold">{SHORT[s.id] ?? s.name}</span>
                {on && (
                  <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden className="absolute top-2 right-2">
                    <circle cx="10" cy="10" r="9" fill="#1E3A5F" />
                    <path d="M5.6 10.4 L8.6 13.2 L14.4 6.8" fill="none" stroke="#FBF6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
        <a href={href.hands} className="self-start py-2 text-[15px] text-cobalt underline underline-offset-4">
          About each style
        </a>
      </section>

      {todayPages.length > 0 && (
        <section aria-labelledby="pages-h" className="mt-6 flex flex-col gap-3">
          <SectionTitle id="pages-h" aside={<a href={href.pages} className="text-cobalt underline underline-offset-4">All pages</a>}>
            Today’s <Voice>pages</Voice>
          </SectionTitle>
          <div className="no-scrollbar -mx-6 flex gap-3 overflow-x-auto px-6 pb-3">
            {todayPages.map((p, k) => (
              <a key={p.id} href={href.pages} className="flex-none" style={{ transform: `rotate(${((k % 3) - 1) * 1.5}deg)` }}>
                <img src={p.src} alt={`Your page: ${p.label}`} className="block h-[134px] w-[96px] rounded-[4px] object-cover object-top shadow-[0_1px_2px_rgb(70_50_25/0.25),0_6px_14px_rgb(70_50_25/0.12)]" />
              </a>
            ))}
          </div>
        </section>
      )}
    </Screen>
  )
}
