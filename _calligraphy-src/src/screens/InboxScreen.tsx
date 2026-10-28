import { useState } from 'react'
import { Screen } from '../components/b'
import { Hand, IconButton, Icons } from '../components/ui'
import { KIND_STYLE, markRead, useInbox, usePrefs, type Kind, type Note } from '../lib/notify'
import { go, href } from '../lib/router'

type Filter = 'all' | 'remind' | 'pages' | 'styles'
const FILTERS: { id: Filter; label: string; kinds: Kind[] }[] = [
  { id: 'all', label: 'All', kinds: ['remind', 'feed', 'loves', 'styles', 'test'] },
  { id: 'remind', label: 'Reminders', kinds: ['remind', 'test'] },
  { id: 'pages', label: 'Pages', kinds: ['feed', 'loves'] },
  { id: 'styles', label: 'Letter styles', kinds: ['styles'] },
]

const when = (at: number) => {
  const d = new Date(at)
  const today = new Date()
  const days = Math.floor((new Date(today.toDateString()).getTime() - new Date(d.toDateString()).getTime()) / 864e5)
  if (days === 0) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
  if (days < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}
const group = (at: number) => {
  const days = Math.floor((new Date(new Date().toDateString()).getTime() - new Date(new Date(at).toDateString()).getTime()) / 864e5)
  return days === 0 ? 'Today' : days < 7 ? 'This week' : 'Earlier'
}

/** Everything the app has told you, newest first. */
export function InboxScreen() {
  const inbox = useInbox()
  const prefs = usePrefs()
  const [filter, setFilter] = useState<Filter>('all')
  const kinds = FILTERS.find((f) => f.id === filter)!.kinds
  const list = inbox.filter((n) => kinds.includes(n.kind))
  const groups = new Map<string, Note[]>()
  for (const n of list) groups.set(group(n.at), [...(groups.get(group(n.at)) ?? []), n])

  return (
    <Screen>
      <header className="flex min-h-[58px] items-center justify-between gap-2 pt-3.5">
        <div className="-ml-3 flex items-center">
          <IconButton label="Back" onClick={() => (history.length > 1 ? history.back() : go(href.home))}>
            {Icons.back}
          </IconButton>
          <h1 className="m-0 text-[30px] leading-[1.1] font-extrabold tracking-[-0.03em]">Notifications</h1>
        </div>
        {inbox.some((n) => !n.read) && (
          <button type="button" onClick={() => markRead()} className="min-h-[44px] border-0 bg-transparent text-[15px] text-cobalt underline underline-offset-4">
            Mark all read
          </button>
        )}
      </header>

      {!prefs.enabled && (
        <a href={href.notifyStart} className="press mt-2 flex items-center gap-3 rounded-[16px] bg-cobalt p-4 text-paper no-underline">
          <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden className="flex-none">
            <path d={KIND_STYLE.remind.icon} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="flex flex-col">
            <span className="text-[17px] font-bold">Turn on a daily reminder</span>
            <span className="text-[14.5px] opacity-85">One gentle nudge at the time you choose</span>
          </span>
        </a>
      )}

      <div role="group" aria-label="Show" className="no-scrollbar -mx-6 mt-3 flex gap-2 overflow-x-auto px-6 pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={filter === f.id}
            onClick={() => setFilter(f.id)}
            className="press min-h-[40px] flex-none rounded-[12px] border-0 px-3.5 text-[15.5px]"
            style={{ background: filter === f.id ? '#1E3A5F' : 'rgb(120 98 60 / 0.1)', color: filter === f.id ? '#FBF6EA' : '#1C2433' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!list.length && <p className="m-0 mt-10 text-center font-serif text-[19px] text-ink-soft italic">Nothing here yet. Go write a line.</p>}

      {[...groups.entries()].map(([g, items]) => (
        <section key={g} aria-label={g} className="mt-5 flex flex-col gap-1">
          <h2 className="m-0 mb-1 text-[15px] font-semibold tracking-[0.04em] text-ink-soft uppercase">{g}</h2>
          {items.map((n) => {
            const k = KIND_STYLE[n.kind]
            return (
              <a
                key={n.id}
                href={n.href}
                onClick={() => markRead(n.id)}
                className="press relative flex items-start gap-3 rounded-[14px] px-1 py-2.5 text-ink no-underline"
                aria-label={`${n.read ? '' : 'Unread. '}${n.title}. ${n.body}`}
              >
                <span aria-hidden className="grid h-10 w-10 flex-none place-items-center rounded-[12px]" style={{ background: k.tile }}>
                  <svg viewBox="0 0 24 24" width="22" height="22">
                    <path d={k.icon} fill="none" stroke="#FBF6EA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className={`text-[17px] leading-tight ${n.read ? 'font-normal' : 'font-bold'}`}>{n.title}</span>
                    <span className="flex-none text-[13.5px] text-ink-soft">{when(n.at)}</span>
                  </span>
                  <span className="text-[15px] leading-snug text-ink-soft">{n.body}</span>
                </span>
                {n.sample && (
                  <span aria-hidden className="flex-none self-center text-cobalt">
                    <Hand text={n.sample.text} size={11} font={n.sample.font} lineHeight={1} />
                  </span>
                )}
                {!n.read && <span aria-hidden className="absolute top-3 -left-2 h-2 w-2 rounded-full bg-vermilion" />}
              </a>
            )
          })}
        </section>
      ))}

      <a href={href.notifications} className="mt-8 self-center text-[16px] text-cobalt underline underline-offset-4">
        Notification settings
      </a>
    </Screen>
  )
}
