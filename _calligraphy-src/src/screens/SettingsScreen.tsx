import type { ReactNode } from 'react'
import { Screen } from '../components/b'
import { href } from '../lib/router'
import { usePrefs } from '../lib/notify'
import { usePractice } from '../state/practice'

const Chevron = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
    <path d="M6 3 L11 8 L6 13" fill="none" stroke="#57534E" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
)

function Group({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <h2 id={id} className="m-0 mx-1 text-[19px] font-extrabold tracking-[-0.02em]">
        {title}
      </h2>
      <div className="flex flex-col rounded-[16px] bg-[rgb(120_98_60/0.08)] px-4 py-1">{children}</div>
    </section>
  )
}

function Row({ to, label, value }: { to: string; label: string; value?: string }) {
  return (
    <a href={to} className="press flex min-h-[52px] items-center justify-between gap-3 text-[19px] text-ink no-underline">
      {label}
      <span className="flex items-center gap-2 text-[17px] text-ink-soft">
        {value}
        <Chevron />
      </span>
    </a>
  )
}

export function SettingsScreen() {
  const { streak, lettersToday, days, script } = usePractice()
  const prefs = usePrefs()
  const quotesWritten = Object.values(days).reduce((n, d) => n + d.quotes.length, 0)

  return (
    <Screen style={{ gap: 22 }}>
      <h1 className="m-0 mx-1 pt-7 text-[30px] leading-[1.1] font-extrabold tracking-[-0.02em]">Settings</h1>

      <section aria-label="Where your progress is kept" className="flex items-center gap-3.5 rounded-[16px] bg-[rgb(120_98_60/0.08)] p-4">
        <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden className="flex-none">
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" fill="none" stroke="#1E3A5F" strokeWidth="1.8" />
          <path d="M10.5 18.5 H13.5" stroke="#1E3A5F" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <div className="min-w-0 flex-1">
          <p className="m-0 text-[20px]">Saved on this phone</p>
          <p className="m-0 text-[15px] leading-snug text-ink-soft">Your pages and progress stay on this device. Sign-in and sync are coming.</p>
        </div>
      </section>

      <section aria-labelledby="prog-h" className="flex flex-col gap-2">
        <h2 id="prog-h" className="m-0 mx-1 text-[19px] font-extrabold tracking-[-0.02em]">
          Progress
        </h2>
        <dl className="m-0 grid grid-cols-3 gap-2">
          {[
            ['day streak', String(streak), ''],
            ['letters', String(lettersToday.length), '/26'],
            ['quotes', String(quotesWritten), ''],
          ].map(([k, v, unit]) => (
            <div key={k} className="flex flex-col-reverse rounded-[14px] bg-[rgb(120_98_60/0.08)] p-3">
              <dt className="text-[15px] leading-tight text-ink-soft">{k}</dt>
              <dd className="m-0 text-[30px] leading-[1.2] font-extrabold tracking-[-0.02em] text-cobalt">
                {v}
                {unit && <span className="text-[17px] font-normal text-ink-soft">{unit}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Group id="practice-h" title="Practice">
        <Row to={href.hands} label="Letter style" value={script.name} />
        <Row to={href.pages} label="My pages" />
        <Row to={href.notifications} label="Notifications" value={prefs.enabled ? (prefs.remind ? `daily at ${prefs.time}` : 'on') : 'off'} />
        <Row to={href.trace} label="Trace any letter or SVG" />
        <Row to={href.guide} label="Pens and inks" />
      </Group>

      <Group id="about-h" title="About">
        <Row to={href.preface} label="Read the preface" />
        <p className="m-0 py-3 text-[15px] leading-relaxed text-ink-soft">
          Named after William Zinsser’s <i className="font-serif">Writing to Learn</i>: we come to understand a thing by writing it out, a little every
          day. Paper texture from{' '}
          <a className="underline underline-offset-2" href="https://github.com/subtlepatterns/SubtlePatterns">
            Subtle Patterns
          </a>
          , CC BY-SA 3.0.
        </p>
      </Group>
    </Screen>
  )
}
