/* eslint-disable react/only-export-components */
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { loadHand } from '../lib/hand'
import { usePractice } from '../state/practice'

/* Text in a script's font. `size` is the x-height: px, or any CSS length (e.g. cqw).
   Defaults to the script being learned; pass `font` to pin one (e.g. the app title). */
export function Hand({ text, size, font, className }: { text: string; size: number | string; font?: string; className?: string }) {
  const { script } = usePractice()
  const family = font ?? script.font
  const xEm = useXEm(family)
  const len = typeof size === 'number' ? `${size}px` : size
  return (
    <span className={className} style={{ fontFamily: `"${family}", cursive`, fontSize: `calc(${len} / ${xEm})`, lineHeight: 1.15 }}>
      {text}
    </span>
  )
}

/** x-height per em of a font, measured once it loads (0.35 until then: close for script faces). */
function useXEm(font: string) {
  const [x, setX] = useState(() => knownXEm.get(font) ?? 0.35)
  useEffect(() => {
    let live = true
    loadHand(font).then((m) => {
      knownXEm.set(font, m.xRatio)
      if (live) setX(m.xRatio)
    })
    return () => {
      live = false
    }
  }, [font])
  return x
}
const knownXEm = new Map<string, number>()

/* SVG filters used by CSS: ink bleeding into paper, and torn (deckle) paper edges. */
export function PaperFilters() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden focusable="false">
      <filter id="ink-bleed" x="-5%" y="-10%" width="110%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="2" seed="4" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.8" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="0.25" />
      </filter>
      <filter id="deckle" x="-4%" y="-8%" width="108%" height="116%">
        <feTurbulence type="fractalNoise" baseFrequency="0.04 0.07" numOctaves="3" seed="9" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </svg>
  )
}

/* A flourish divider, drawn for this app. */
export function Flourish({ className }: { className?: string }) {
  const half = 'M98 12c-6-7-15-7-22-2-9 6-17 9-27 6-8-2-13-8-21-8-7 0-12 4-16 9 6-3 11-4 16-2 9 3 15 9 25 8 12-1 19-11 29-13 6-1 11 0 16 2z'
  return (
    <svg className={className} viewBox="0 0 200 24" width="150" height="18" aria-hidden>
      <g fill="currentColor">
        <path d={half} />
        <path d={half} transform="translate(200 0) scale(-1 1)" />
        <path d="M100 7l3 5-3 5-3-5z" />
      </g>
    </svg>
  )
}

/* Round icon button for toolbars. */
const IconBtnBase = styled.button<{ $active?: boolean }>`
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 0;
  background: ${({ $active, theme }) => ($active ? theme.color.ink : 'transparent')};
  color: ${({ $active, theme }) => ($active ? theme.color.paper : theme.color.ink)};
  transition: background 0.15s, transform 0.1s;
  &:active {
    transform: scale(0.92);
  }
  &:disabled {
    opacity: 0.3;
  }
`
export function IconButton({
  label,
  active,
  children,
  ...rest
}: { label: string; active?: boolean } & ComponentProps<'button'>) {
  return (
    <IconBtnBase type="button" aria-label={label} title={label} $active={active} aria-pressed={active} {...rest}>
      {children}
    </IconBtnBase>
  )
}

export const Toolbar = styled.nav`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  padding: 6px 10px calc(8px + env(safe-area-inset-bottom));
`

export const SaveButton = styled.button`
  height: 46px;
  padding: 0 clamp(14px, 5vw, 22px);
  white-space: nowrap;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.ink};
  color: ${({ theme }) => theme.color.paper};
  font-family: ${({ theme }) => theme.font.serif};
  font-size: 17px;
  &:disabled {
    background: ${({ theme }) => theme.color.tint};
    color: ${({ theme }) => theme.color.inkSoft};
  }
  &:active:not(:disabled) {
    transform: scale(0.97);
  }
`

/* Top bar for practice screens. */
export const TopBar = styled.header`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 4px 6px;
`

/* Toast that confirms an action. */
const rise = keyframes`
  from { opacity: 0; transform: translate(-50%, 12px); }
  to { opacity: 1; transform: translate(-50%, 0); }
`
export const Toast = styled.div<{ $show: boolean }>`
  position: fixed;
  left: 50%;
  bottom: calc(86px + env(safe-area-inset-bottom));
  transform: translateX(-50%);
  padding: 10px 18px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.ink};
  color: ${({ theme }) => theme.color.paper};
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 14px;
  white-space: nowrap;
  pointer-events: none;
  ${({ $show }) =>
    $show
      ? css`
          animation: ${rise} 0.25s ease-out both;
        `
      : css`
          opacity: 0;
        `}
`

/* Minimal line icons, drawn for this app. */
const icon = (d: ReactNode) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {d}
  </svg>
)
export const Icons = {
  back: icon(<path d="M15 5l-7 7 7 7" />),
  prev: icon(<path d="M14.5 6l-6 6 6 6" />),
  next: icon(<path d="M9.5 6l6 6-6 6" />),
  undo: icon(<path d="M9 14L4 9l5-5M4 9h10a6 6 0 010 12h-3" />),
  clear: icon(<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />),
  eye: icon(
    <>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>,
  ),
  eyeOff: icon(
    <>
      <path d="M3 3l18 18M10.6 5.1A10 10 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.3 4.2M6.6 6.6C3.9 8.4 2 12 2 12s3.5 7 10 7a9.7 9.7 0 005.4-1.6" />
      <path d="M9.9 9.9a3 3 0 004.2 4.2" />
    </>,
  ),
  plus: icon(<path d="M12 5v14M5 12h14" />),
  close: icon(<path d="M6 6l12 12M18 6L6 18" />),
  grid: icon(
    <>
      <rect x="4" y="4" width="6" height="6" rx="1" />
      <rect x="14" y="4" width="6" height="6" rx="1" />
      <rect x="4" y="14" width="6" height="6" rx="1" />
      <rect x="14" y="14" width="6" height="6" rx="1" />
    </>,
  ),
  download: icon(<path d="M12 4v11M7 10l5 5 5-5M5 20h14" />),
  play: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.5v13a1 1 0 001.5.86l10.5-6.5a1 1 0 000-1.72L9.5 4.64A1 1 0 008 5.5z" />
    </svg>
  ),
  pause: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6.5" y="5" width="4" height="14" rx="1" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" />
    </svg>
  ),
  pen: icon(
    <>
      <path d="M12 2.5c3 3.5 4.5 7.5 4.5 11 0 2.5-1.8 4.6-4.5 8-2.7-3.4-4.5-5.5-4.5-8 0-3.5 1.5-7.5 4.5-11z" />
      <path d="M12 11v10" />
      <circle cx="12" cy="11" r="1.2" />
    </>,
  ),
}

/* A loose hand-drawn ring, as if circled with a red pencil. */
export function Ring({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 200 80" preserveAspectRatio="none" aria-hidden>
      <path
        d="M118 6C70 2 18 14 8 38c-9 22 30 36 92 36 58 0 94-14 92-36-2-20-40-32-96-31"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
