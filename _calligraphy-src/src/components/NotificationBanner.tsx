import { useEffect, useRef, useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { markRead, onBanner, type Note } from '../lib/notify'
import { go } from '../lib/router'
import { Hand } from './ui'

const drop = keyframes`
  from { transform: translateY(-120%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`

const Wrap = styled.div`
  position: fixed;
  top: calc(env(safe-area-inset-top) + 8px);
  left: 8px;
  right: 8px;
  z-index: 60;
  max-width: 480px;
  margin: 0 auto;
  animation: ${drop} 0.35s cubic-bezier(0.2, 0.9, 0.3, 1.1) both;
  touch-action: none;
`

/** The app icon, small, as phones show it on a notification. */
export function AppIcon({ size = 38 }: { size?: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden className="flex-none">
      <rect width="40" height="40" rx="9.5" fill="#1E3A5F" />
      <g fill="none" stroke="#FBF6EA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" transform="translate(4 3)">
        <rect x="10" y="2.5" width="12" height="8" rx="2" fill="#FBF6EA" />
        <path d="M12 10.5 L8.5 18.8 C11.8 20.4 14.4 23.4 16 26.8 C17.6 23.4 20.2 20.4 23.5 18.8 L20 10.5 Z" fill="rgb(217 170 70 / 0.55)" />
        <circle cx="16" cy="16.6" r="1.6" fill="#92400E" stroke="#92400E" />
      </g>
    </svg>
  )
}

/** One notification card in the phone's style: glass, app icon, name, time, title, body. */
export function PushCard({ note, when = 'now', onClick, strong }: { note: Pick<Note, 'title' | 'body' | 'sample'>; when?: string; onClick?: () => void; strong?: boolean }) {
  const body = (
    <>
      <AppIcon />
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold tracking-[0.06em] text-ink-soft uppercase">Writing to Learn</span>
          <span className="text-[12.5px] text-ink-soft">{when}</span>
        </span>
        <span className="text-[16px] leading-tight font-bold">{note.title}</span>
        <span className="text-[15px] leading-snug text-ink">{note.body}</span>
      </span>
      {note.sample && (
        <span aria-hidden className="flex-none self-center text-cobalt">
          <Hand text={note.sample.text} size={13} font={note.sample.font} lineHeight={1} />
        </span>
      )}
    </>
  )
  const cls = `${strong ? 'glass-strong' : 'glass'} flex w-full items-start gap-3 rounded-[22px] px-3.5 py-3 text-left text-ink`
  return onClick ? (
    <button type="button" className={`${cls} press border-0`} onClick={onClick}>
      {body}
    </button>
  ) : (
    <div className={cls}>{body}</div>
  )
}

/** Shows notifications that arrive while the app is open, the way the phone would. */
export function NotificationBanner() {
  const [note, setNote] = useState<Note | null>(null)
  const timer = useRef(0)
  const startY = useRef<number | null>(null)

  useEffect(
    () =>
      onBanner((n) => {
        setNote(n)
        clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setNote(null), 6000)
      }),
    [],
  )

  if (!note) return null
  return (
    <Wrap
      role="status"
      aria-live="polite"
      onPointerDown={(e) => (startY.current = e.clientY)}
      onPointerUp={(e) => {
        if (startY.current !== null && e.clientY - startY.current < -24) setNote(null)
        startY.current = null
      }}
    >
      <PushCard
        strong
        note={note}
        onClick={() => {
          markRead(note.id)
          setNote(null)
          go(note.href)
        }}
      />
    </Wrap>
  )
}
