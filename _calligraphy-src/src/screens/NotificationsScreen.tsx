import { useEffect, useState } from 'react'
import { Chips, PrimaryButton, Screen, SwitchRow } from '../components/b'
import { IconButton, Icons } from '../components/ui'
import { sharingOpen } from '../lib/feed'
import { deliveryNote, enable, platform, sendTest, setPrefs, usePrefs, type Permission } from '../lib/notify'
import { go, href } from '../lib/router'
import { TIMES } from './NotifyStartScreen'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      {title && <h2 className="m-0 mx-1 text-[19px] font-extrabold tracking-[-0.02em]">{title}</h2>}
      <div className="flex flex-col rounded-[16px] bg-[rgb(120_98_60/0.08)] px-4 py-2">{children}</div>
    </section>
  )
}

/** Notification settings: when to be reminded, and which kinds to hear about. */
export function NotificationsScreen() {
  const prefs = usePrefs()
  const [perm, setPerm] = useState<Permission>('default')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    void platform.permission().then(setPerm)
  }, [prefs.enabled])

  const on = prefs.enabled && perm === 'granted'
  const note = deliveryNote(perm)

  return (
    <Screen style={{ gap: 20 }}>
      <header className="-ml-3 flex min-h-[58px] items-center pt-3.5">
        <IconButton label="Back" onClick={() => (history.length > 1 ? history.back() : go(href.settings))}>
          {Icons.back}
        </IconButton>
        <h1 className="m-0 text-[30px] leading-[1.1] font-extrabold tracking-[-0.03em]">Notifications</h1>
      </header>

      {!on ? (
        <div className="flex flex-col gap-3 rounded-[16px] bg-cobalt p-4 text-paper">
          <p className="m-0 text-[18px] font-bold">Notifications are off</p>
          <p className="m-0 text-[15px] leading-snug opacity-85">{perm === 'denied' ? note : 'Turn them on for one gentle reminder a day, at your time.'}</p>
          {perm !== 'denied' && perm !== 'unsupported' && (
            <button type="button" onClick={() => void enable().then(setPerm)} className="press min-h-[46px] self-start rounded-[12px] border-0 bg-paper px-4 text-[16px] font-bold text-cobalt">
              Turn on
            </button>
          )}
          {perm === 'unsupported' && <p className="m-0 text-[14.5px] leading-snug">{note}</p>}
        </div>
      ) : null}

      <Card title="Daily writing reminder">
        <SwitchRow label="Remind me to write" note="Skipped on days you’ve already written" checked={prefs.remind} onChange={(v) => setPrefs({ remind: v })} />
        <div className="flex flex-col gap-3 pt-1 pb-3" style={{ opacity: prefs.remind ? 1 : 0.4 }}>
          <Chips label="Reminder time" options={TIMES} isOn={(v) => prefs.time === v} onPick={(v) => setPrefs({ time: v })} />
          <label className="flex items-center gap-3 text-[16px]">
            Or at
            <input
              type="time"
              value={prefs.time}
              onChange={(e) => e.target.value && setPrefs({ time: e.target.value })}
              className="min-h-[44px] rounded-[12px] border-0 bg-[rgb(120_98_60/0.1)] px-3 text-[16px] text-ink"
            />
          </label>
          <Chips
            label="Days"
            options={DAYS.map((d, i) => ({ value: i, label: d.charAt(0), aria: d }))}
            isOn={(i) => prefs.days[i]}
            onPick={(i) => setPrefs({ days: prefs.days.map((v, k) => (k === i ? !v : v)) })}
          />
        </div>
      </Card>

      <Card title="The greatest achievement">
        <SwitchRow label="Today’s top pages" note={sharingOpen ? 'When the top three are in' : 'Starts when sharing opens'} checked={prefs.feed} onChange={(v) => setPrefs({ feed: v })} />
        <SwitchRow label="Loves on your pages" note={sharingOpen ? 'At most once a day' : 'Starts when sharing opens'} checked={prefs.loves} onChange={(v) => setPrefs({ loves: v })} />
      </Card>

      <Card title="Letters">
        <SwitchRow label="New letter styles" note="When a new hand arrives to learn" checked={prefs.styles} onChange={(v) => setPrefs({ styles: v })} />
        <SwitchRow label="Quiet hours" note="Nothing but your reminder from 10 pm to 7 am" checked={prefs.quiet} onChange={(v) => setPrefs({ quiet: v })} />
      </Card>

      {on && (
        <div className="flex flex-col gap-2">
          <PrimaryButton
            type="button"
            onClick={() => {
              void sendTest()
              setSent(true)
            }}
          >
            {sent ? 'Sent. Look at your notifications' : 'Send a test notification'}
          </PrimaryButton>
          {note && <p className="m-0 px-1 text-[14.5px] leading-snug text-ink-soft">{note}</p>}
        </div>
      )}

      <p className="m-0 px-1 text-[14.5px] leading-snug text-ink-soft">Each kind sends at most once a day. Turn off a kind here, or everything in your phone’s settings.</p>
    </Screen>
  )
}
