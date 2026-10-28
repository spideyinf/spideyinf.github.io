import { PrimaryButton, Voice } from '../components/b'
import { Hand } from '../components/ui'
import { go, href } from '../lib/router'

const PERKS = ['See every page, not just today’s top three', 'Post your handwritten page every day', 'React to the pages you love', 'Tag your pen, ink and paper']

/** Unlock The greatest achievement. Payments open with the app; nothing is charged here. */
export function UnlockScreen() {
  return (
    <main className="paper-sheet flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+28px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <div aria-hidden className="text-cobalt opacity-80">
        <Hand text="Little by little" size={16} font="Pinyon Script" />
      </div>
      <h1 className="m-0 mt-6 text-[32px] leading-[1.05] font-extrabold tracking-[-0.03em]">
        Unlock The <Voice>greatest</Voice> achievement
      </h1>
      <p className="m-0 mt-2 font-serif text-[19px] text-ink-soft italic">Write daily. Share your pages. See everyone’s.</p>
      <ul className="m-0 mt-6 flex list-none flex-col gap-3 p-0">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-3 text-[18px] leading-snug">
            <svg viewBox="0 0 20 20" width="22" height="22" aria-hidden className="mt-0.5 flex-none">
              <circle cx="10" cy="10" r="9" fill="#1E3A5F" />
              <path d="M5.6 10.4 L8.6 13.2 L14.4 6.8" fill="none" stroke="#FBF6EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {p}
          </li>
        ))}
      </ul>
      <div className="mt-auto flex flex-col gap-2 pt-8">
        <p className="m-0 text-center text-[15px] leading-snug text-ink-soft">The price and payment open with the app in the App Store and Google Play. Nothing is charged here.</p>
        <PrimaryButton type="button" disabled>
          Unlock · coming with the app
        </PrimaryButton>
        <button type="button" onClick={() => (history.length > 1 ? history.back() : go(href.achievement))} className="min-h-[48px] border-0 bg-transparent text-[17px] text-ink-soft">
          Not now
        </button>
      </div>
    </main>
  )
}
