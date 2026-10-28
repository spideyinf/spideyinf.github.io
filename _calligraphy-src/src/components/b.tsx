/* eslint-disable react/only-export-components */
// Design B building blocks: the liquid-glass tab bar, screen layout, headers,
// segmented controls, buttons, a progress ring and real paper sheets.

import type { ComponentProps, ReactNode } from 'react'
import styled, { css } from 'styled-components'
import fibers from '../assets/paper/lightpaperfibers.png'
import { href, useRoute, type Route } from '../lib/router'

/* ---------- Screen ---------- */

/** A tab screen: 24px gutters, room under the content for the floating tab bar. */
export const Screen = styled.main`
  min-height: 100dvh;
  box-sizing: border-box;
  padding: env(safe-area-inset-top) 24px calc(124px + env(safe-area-inset-bottom));
  display: flex;
  flex-direction: column;
`

/** Big bold title, with an optional control on the right. */
export function PageHeader({ title, right }: { title: ReactNode; right?: ReactNode }) {
  return (
    <header className="flex min-h-[58px] items-center justify-between gap-3 pt-3.5">
      <h1 className="m-0 text-[32px] leading-[1.1] font-extrabold tracking-[-0.03em]">{title}</h1>
      {right}
    </header>
  )
}

/** Section title: bold grotesque with one word set in the bookish italic. */
export function SectionTitle({ id, children, aside }: { id?: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <h2 id={id} className="m-0 text-[22px] leading-[1.3] font-extrabold tracking-[-0.02em]">
        {children}
      </h2>
      {aside && <p className="m-0 text-[15px] text-ink-soft">{aside}</p>}
    </div>
  )
}

/** The voice of the app: Newsreader italic. */
export const Voice = styled.em`
  font-family: ${({ theme }) => theme.font.serif};
  font-style: italic;
  font-weight: 300;
  letter-spacing: 0;
`

/* ---------- Controls ---------- */

const primary = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 52px;
  padding: 0 20px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.control};
  background: ${({ theme }) => theme.color.cobalt};
  color: ${({ theme }) => theme.color.paper};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 18px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.18s ease;
  &:active {
    transform: scale(0.97);
  }
  &:disabled {
    opacity: 0.45;
  }
`
export const PrimaryButton = styled.button`
  ${primary}
`
export const PrimaryLink = styled.a`
  ${primary}
`

/** "I wrote it": outlined until done, then filled with a tick. */
export function DoneToggle({ done, onClick, todo, doneText }: { done: boolean; onClick: () => void; todo: string; doneText: string }) {
  return (
    <button
      type="button"
      className="press flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-[14px] border-2 border-cobalt text-[19px]"
      style={{ background: done ? '#1E3A5F' : 'transparent', color: done ? '#FBF6EA' : '#1E3A5F' }}
      aria-pressed={done}
      onClick={onClick}
    >
      {done && (
        <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden>
          <path d="M4 10.6 L8.2 14.6 L16.2 5.6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {done ? doneText : todo}
    </button>
  )
}

/** Tinted square-ish button for a single icon (44px target). */
export function TintButton({ label, children, ...rest }: { label: string; children: ReactNode } & ComponentProps<'button'>) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="press grid h-[52px] w-[52px] flex-none place-items-center rounded-[14px] border-0 bg-tint text-ink"
      {...rest}
    >
      {children}
    </button>
  )
}

/** Round tinted button (letter and quote steppers). */
export const RoundButton = styled.button<{ $size?: number }>`
  display: grid;
  place-items: center;
  width: ${({ $size }) => $size ?? 52}px;
  height: ${({ $size }) => $size ?? 52}px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: ${({ theme }) => theme.color.tint};
  color: ${({ theme }) => theme.color.ink};
  transition: transform 0.18s ease;
  &:active {
    transform: scale(0.94);
  }
`

/** Two or three options in a tinted track; the chosen one fills navy. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  grow,
}: {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  grow?: boolean
}) {
  return (
    <div role="group" aria-label={label} className="flex rounded-[12px] bg-tint p-[3px]">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`press min-h-[40px] min-w-[52px] rounded-[10px] border-0 px-2.5 text-[clamp(14.5px,4.6vw,17px)] whitespace-nowrap ${grow ? 'flex-1' : ''}`}
            style={{ background: on ? '#1E3A5F' : 'transparent', color: on ? '#FBF6EA' : '#1C2433' }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

/** A thin progress ring with the count in the middle. */
export function ProgressRing({ value, max, label }: { value: number; max: number; label: string }) {
  const r = 17
  const c = 2 * Math.PI * r
  return (
    <div role="img" aria-label={label} className="flex items-center gap-2 text-[16px] text-ink-soft">
      <svg viewBox="0 0 44 44" width="40" height="40" aria-hidden>
        <circle cx="22" cy="22" r={r} fill="none" stroke="rgb(30 58 95 / 0.15)" strokeWidth="4" />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="#1E3A5F"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={`${((c * Math.min(value, max)) / max).toFixed(1)} ${c.toFixed(1)}`}
          transform="rotate(-90 22 22)"
        />
        <text x="22" y="27" textAnchor="middle" fontWeight="700" fontSize="14" fill="#1C2433" fontFamily="'Bricolage Grotesque Variable', sans-serif">
          {value}
        </text>
      </svg>
      of {max} today
    </div>
  )
}

/* ---------- Paper ---------- */

/** A real sheet of paper laid on the ground: fibres, torn edges, a soft shadow. */
export const PaperSheet = styled.div<{ $tilt?: number }>`
  position: relative;
  isolation: isolate;
  transform: rotate(${({ $tilt }) => $tilt ?? 0}deg);
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-color: ${({ theme }) => theme.color.note};
    background-image: url(${fibers});
    background-size: 500px 300px;
    background-blend-mode: multiply;
    filter: url('#deckle') drop-shadow(0 1px 1px rgb(70 50 25 / 0.18)) drop-shadow(0 8px 16px rgb(70 50 25 / 0.1));
  }
`

/** Ruled lines for copy text, one every `line` px. */
export const ruled = (line: number) => ({
  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${line - 1}px, rgb(30 58 95 / 0.16) ${line - 1}px, rgb(30 58 95 / 0.16) ${line}px)`,
})

/* ---------- Tab bar ---------- */

type Tab = { to: string; label: string; match: Route['name'][]; icon: (on: boolean) => ReactNode; big?: boolean }

const ink = (on: boolean) => (on ? '#1E3A5F' : '#57534E')
const TABS: Tab[] = [
  {
    to: href.letters,
    label: 'ABC',
    match: ['letters', 'abc'],
    icon: (on) => (
      <g fill="none" stroke={ink(on)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 24 L10 8 L16 24 M6.4 18.5 H13.6" />
        <circle cx="23" cy="19.5" r="4.5" />
        <path d="M27.5 15 V24" />
      </g>
    ),
  },
  {
    to: href.quotes,
    label: 'Paragraph',
    match: ['quotes', 'write'],
    icon: (on) => (
      <g fill="none" stroke={ink(on)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="7" y="4" width="18" height="24" rx="3.5" />
        <path d="M11.5 11 H20.5 M11.5 16 H20.5 M11.5 21 H17" />
      </g>
    ),
  },
  {
    to: href.home,
    label: 'Home',
    match: ['home'],
    big: true,
    icon: (on) => (
      <g fill="none" stroke={ink(on)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="2.5" width="12" height="8" rx="2" fill={on ? '#1E3A5F' : 'none'} />
        <path d="M12 10.5 L8.5 18.8 C11.8 20.4 14.4 23.4 16 26.8 C17.6 23.4 20.2 20.4 23.5 18.8 L20 10.5 Z" fill={on ? 'rgb(217 170 70 / 0.5)' : 'none'} />
        <circle cx="16" cy="16.6" r="1.8" fill={on ? '#92400E' : 'none'} stroke={on ? '#92400E' : ink(on)} />
        <circle cx="16" cy="28.6" r="1.3" />
      </g>
    ),
  },
  {
    to: href.achievement,
    label: 'The greatest achievement',
    match: ['achievement', 'feed'],
    icon: (on) => (
      <g fill="none" stroke={ink(on)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="16" cy="12.5" r="7.5" fill={on ? 'rgb(217 170 70 / 0.35)' : 'none'} />
        <path d="M11.6 18.6 L9.5 29 L16 25.5 L22.5 29 L20.4 18.6" />
        <path d="M16 8.6 L17.1 10.9 L19.6 11.2 L17.8 12.9 L18.2 15.4 L16 14.2 L13.8 15.4 L14.2 12.9 L12.4 11.2 L14.9 10.9 Z" fill="#92400E" stroke="#92400E" strokeWidth="1" />
      </g>
    ),
  },
  {
    to: href.settings,
    label: 'Settings',
    match: ['settings'],
    icon: (on) => (
      <g fill="none" stroke={ink(on)} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 9 H27 M5 16 H27 M5 23 H27" />
        <circle cx="11" cy="9" r="2.8" fill="#FBF6EA" />
        <circle cx="21" cy="16.1" r="2.8" fill={ink(on)} />
        <circle cx="14" cy="23.1" r="2.8" fill="#FBF6EA" />
      </g>
    ),
  },
]

const Bar = styled.nav`
  position: fixed;
  left: 16px;
  right: 16px;
  bottom: calc(18px + env(safe-area-inset-bottom));
  z-index: 30;
  height: 70px;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 8px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  border-radius: 32px;
  a {
    position: relative;
    align-self: stretch;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  a[aria-current='page']::before {
    content: '';
    position: absolute;
    top: 7px;
    bottom: 7px;
    left: 3px;
    right: 3px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgb(255 255 255 / 0.95), rgb(255 255 255 / 0.5));
    border: 1px solid rgb(255 255 255 / 0.95);
    box-shadow:
      inset 0 1px 0 #fff,
      inset 0 -2px 5px rgb(30 58 95 / 0.12),
      0 6px 16px rgb(30 58 95 / 0.2),
      0 1px 2px rgb(30 58 95 / 0.14);
  }
  svg {
    position: relative;
  }
`

/** The floating liquid-glass tab bar. */
export function TabBar() {
  const route = useRoute()
  return (
    <Bar aria-label="Main" className="glass">
      {TABS.map((t) => {
        const on = t.match.includes(route.name)
        return (
          <a key={t.label} href={t.to} aria-label={t.label} aria-current={on ? 'page' : undefined}>
            <svg viewBox="-6 -6 44 44" width={t.big || on ? 48 : 44} height={t.big || on ? 48 : 44} aria-hidden>
              {t.icon(on)}
            </svg>
          </a>
        )
      })}
    </Bar>
  )
}

/** Routes that show the tab bar. */
export const TAB_ROUTES: Route['name'][] = ['home', 'letters', 'abc', 'quotes', 'write', 'pages', 'settings', 'achievement', 'feed', 'inbox', 'notifications']

/** An on/off switch row (a real button with role="switch"). */
export function SwitchRow({ label, note, checked, onChange, disabled }: { label: ReactNode; note?: ReactNode; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[56px] w-full items-center justify-between gap-4 border-0 bg-transparent p-0 py-1.5 text-left text-[18px] text-ink disabled:opacity-45"
    >
      <span className="flex min-w-0 flex-col">
        {label}
        {note && <span className="text-[14.5px] leading-snug text-ink-soft">{note}</span>}
      </span>
      <span aria-hidden className="relative h-[30px] w-[50px] flex-none rounded-[15px] transition-colors" style={{ background: checked ? '#1E3A5F' : '#A8A196' }}>
        <span
          className="absolute top-[3px] left-[3px] h-6 w-6 rounded-full bg-paper shadow-[0_1px_2px_rgb(0_0_0/0.25)] transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'none' }}
        />
      </span>
    </button>
  )
}

/** Chips to pick one or several values. */
export function Chips<T extends string | number>({
  label,
  options,
  isOn,
  onPick,
}: {
  label: string
  options: { value: T; label: string; aria?: string }[]
  isOn: (v: T) => boolean
  onPick: (v: T) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = isOn(o.value)
        return (
          <button
            key={String(o.value)}
            type="button"
            aria-pressed={on}
            aria-label={o.aria}
            onClick={() => onPick(o.value)}
            className="press min-h-[44px] min-w-[44px] rounded-[12px] border-0 px-3 text-[16px]"
            style={{ background: on ? '#1E3A5F' : 'rgb(120 98 60 / 0.1)', color: on ? '#FBF6EA' : '#1C2433' }}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
