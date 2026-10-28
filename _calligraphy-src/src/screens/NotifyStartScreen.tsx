import { useState } from 'react'
import { Chips, PrimaryButton, SwitchRow } from '../components/b'
import { PushCard } from '../components/NotificationBanner'
import { enable, usePrefs, type Prefs } from '../lib/notify'
import { go, href } from '../lib/router'
import { sharingOpen } from '../lib/feed'
import { usePractice } from '../state/practice'

export const TIMES = [
  { value: '07:00', label: 'Morning 7:00' },
  { value: '12:00', label: 'Noon 12:00' },
  { value: '20:00', label: 'Evening 8:00' },
]

/** Ask, once, with a preview of what will arrive. */
export function NotifyStartScreen() {
  const prefs = usePrefs()
  const { script } = usePractice()
  const [draft, setDraft] = useState<Pick<Prefs, 'remind' | 'feed' | 'styles' | 'time'>>({ remind: prefs.remind, feed: prefs.feed, styles: prefs.styles, time: prefs.time })
  const [result, setResult] = useState<string | null>(null)
  const set = (p: Partial<typeof draft>) => setDraft((d) => ({ ...d, ...p }))
  const back = () => (history.length > 1 ? history.back() : go(href.home))

  const turnOn = async () => {
    const p = await enable(draft)
    if (p === 'granted') go(href.notifications, true)
    else if (p === 'unsupported') setResult('This browser can’t show notifications. On iPhone, add Writing to Learn to your Home Screen, then try again.')
    else setResult('Notifications weren’t allowed. You can allow them later in your settings.')
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pt-[calc(env(safe-area-inset-top)+20px)] pb-[calc(env(safe-area-inset-bottom)+20px)]">
      {/* What they'll look like. */}
      <div aria-hidden className="flex flex-col gap-2 [&>*]:origin-top">
        <PushCard note={{ title: 'Your page is waiting', body: `One line of a in ${script.name}.`, sample: { text: 'a', font: script.font } }} when="8:00 pm" />
        <div className="scale-[0.96] opacity-80">
          <PushCard note={{ title: 'New letter style', body: 'Learn it stroke by stroke, starting with a.' }} when="9:00 am" />
        </div>
      </div>

      <h1 className="m-0 mt-7 text-[30px] leading-[1.1] font-extrabold tracking-[-0.03em]">
        A gentle nudge, <em className="font-serif font-light tracking-normal">once a day</em>
      </h1>
      <p className="m-0 mt-2 text-[17px] leading-snug text-ink-soft">Pick what’s worth hearing about. Nothing else.</p>

      <div className="mt-4 flex flex-col">
        <SwitchRow label="Daily writing reminder" note="One nudge at the time you choose" checked={draft.remind} onChange={(v) => set({ remind: v })} />
        <SwitchRow label="New pages" note={sharingOpen ? 'Today’s top pages in The greatest achievement' : 'Starts when sharing opens'} checked={draft.feed} onChange={(v) => set({ feed: v })} />
        <SwitchRow label="New letter styles" note="When a new hand arrives to learn" checked={draft.styles} onChange={(v) => set({ styles: v })} />
      </div>

      <p className="m-0 mt-3 mb-2 text-[16px] font-semibold">Remind me at</p>
      <Chips label="Reminder time" options={TIMES} isOn={(v) => draft.time === v} onPick={(v) => set({ time: v })} />

      {result && (
        <p role="alert" className="m-0 mt-4 rounded-[12px] bg-tint p-3 text-[15px] leading-snug">
          {result}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-1 pt-6">
        <PrimaryButton type="button" onClick={turnOn}>
          Turn on notifications
        </PrimaryButton>
        <button type="button" onClick={back} className="min-h-[48px] border-0 bg-transparent text-[17px] text-ink-soft">
          Maybe later
        </button>
        <p className="m-0 text-center text-[14px] text-ink-soft">Change this anytime in Settings.</p>
      </div>
    </main>
  )
}
