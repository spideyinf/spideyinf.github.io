/* eslint-disable react/only-export-components */
import type { ComponentProps, ReactNode } from 'react'
import styled, { css, keyframes } from 'styled-components'
import { CAP_IN_X, splitRuns } from '../lib/hand'

/* The combined hand, as DOM text. `size` is the x-height in px. */
export function Hand({ text, size, className }: { text: string; size: number; className?: string }) {
  return (
    <span className={className} style={{ lineHeight: 1.15 }}>
      {splitRuns(text).map((r, i) =>
        r.caps ? (
          // Pinyon's caps are ~0.69 em tall; scale so they stand ~2.1 x-heights.
          <span key={i} style={{ fontFamily: 'var(--font-caps)', fontSize: (size * CAP_IN_X) / 0.69 }}>
            {r.text}
          </span>
        ) : (
          // Sacramento's x-height is ~0.31 em.
          <span key={i} style={{ fontFamily: 'var(--font-cursive)', fontSize: size / 0.31 }}>
            {r.text}
          </span>
        ),
      )}
    </span>
  )
}

/* Brand mark: a pointed nib in a paper circle, after the avatar in story headers. */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
      <circle cx="32" cy="32" r="31" fill="#fff" />
      <path d="M32 10c6 8 9 16 9 24 0 6-4 11-9 20-5-9-9-14-9-20 0-8 3-16 9-24z" fill="var(--color-cobalt)" />
      <path d="M32 30v24" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="30" r="3" fill="#fff" />
    </svg>
  )
}

/* Story-style segment bar. */
export type SegState = 'empty' | 'done' | 'current'
const Segs = styled.div`
  display: flex;
  gap: 3px;
  padding: 10px 16px 0;
`
const Seg = styled.span<{ $s: SegState }>`
  flex: 1;
  height: 2.5px;
  border-radius: 2px;
  background: ${({ $s, theme }) =>
    $s === 'current' ? theme.color.vermilion : $s === 'done' ? theme.color.ink : theme.color.rule};
  transition: background 0.2s;
`
export function StoryBar({ states, label }: { states: SegState[]; label: string }) {
  return (
    <Segs role="img" aria-label={label}>
      {states.map((s, i) => (
        <Seg key={i} $s={s} />
      ))}
    </Segs>
  )
}

/* Hand-drawn oval with a tail, as in a margin note. */
export function Oval({ children, color = 'currentColor' }: { children: ReactNode; color?: string }) {
  return (
    <div className="relative mx-auto w-[270px] px-10 py-7 text-center">
      <svg className="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 270 110" preserveAspectRatio="none" aria-hidden>
        <path
          d="M150 104 C 70 108, 4 92, 6 56 C 8 18, 80 3, 140 4 C 210 5, 266 24, 264 58 C 262 92, 205 104, 132 103"
          fill="none"
          stroke={color}
          strokeWidth="1.3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="relative">{children}</div>
    </div>
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
  border-top: 1px solid ${({ theme }) => theme.color.rule};
  background: ${({ theme }) => theme.color.paper};
`

export const SaveButton = styled.button`
  height: 46px;
  padding: 0 22px;
  border: 0;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.color.cobalt};
  color: #fff;
  font-family: ${({ theme }) => theme.font.serif};
  font-size: 17px;
  &:disabled {
    background: ${({ theme }) => theme.color.rule};
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
}
