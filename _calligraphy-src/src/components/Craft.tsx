import { useId } from 'react'

// Small pieces of fountain-pen craft used as the app's ornament: an engraved
// nib as its maker's mark, and the gold rings of a cap band as section rules.
// Original drawings, not taken from any maker.

/** An engraved gold nib, imprinted with the app's initials and its size. */
export function NibMark({ className, size = 'F' }: { className?: string; size?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 64 104" aria-hidden>
      <defs>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#a8822e" />
          <stop offset="0.35" stopColor="#f0d48a" />
          <stop offset="0.55" stopColor="#d9b25a" />
          <stop offset="1" stopColor="#9c7628" />
        </linearGradient>
        <linearGradient id={`${id}-tip`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9aa1a8" />
          <stop offset="0.45" stopColor="#f2f4f5" />
          <stop offset="1" stopColor="#8d949b" />
        </linearGradient>
      </defs>
      {/* Body of the nib */}
      <path d="M32 102 L19 62 Q9 42 11 22 Q14 7 32 3 Q50 7 53 22 Q55 42 45 62 Z" fill={`url(#${id}-gold)`} stroke="#6f5418" strokeWidth="0.8" />
      {/* Plated tip, as two-tone nibs have */}
      <path d="M32 102 L22.5 72 Q32 66 41.5 72 Z" fill={`url(#${id}-tip)`} stroke="#6f5418" strokeWidth="0.5" />
      {/* Engraved scrollwork */}
      <g fill="none" stroke="#6f5418" strokeWidth="0.7" strokeLinecap="round" opacity="0.75">
        <path d="M16 20 q6 -8 12 -2 q-6 2 -4 8" />
        <path d="M48 20 q-6 -8 -12 -2 q6 2 4 8" />
        <path d="M15 40 q5 6 11 2" />
        <path d="M49 40 q-5 6 -11 2" />
        <path d="M14 30 h3 M47 30 h3" />
      </g>
      {/* Imprint */}
      <text x="32" y="31" textAnchor="middle" fontFamily="Fraunces Variable, Georgia, serif" fontSize="11" fontWeight="600" fill="#5c4412">
        WL
      </text>
      <text x="32" y="45" textAnchor="middle" fontFamily="Inter Variable, system-ui, sans-serif" fontSize="6.5" letterSpacing="1" fill="#5c4412">
        {size}
      </text>
      {/* Breather hole and slit */}
      <path d="M32 54 c-3 -3 -6 0 -3 3.5 l3 3 l3 -3 c3 -3.5 0 -6.5 -3 -3.5 z" fill="#3b2c0c" />
      <path d="M32 60 L32 102" stroke="#3b2c0c" strokeWidth="0.9" />
    </svg>
  )
}

/** A section rule like the gold rings of a pen's cap band. */
export function CapBand({ className }: { className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 200 10" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id={`${id}-fade`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#c9a24a" stopOpacity="0" />
          <stop offset="0.2" stopColor="#c9a24a" />
          <stop offset="0.5" stopColor="#f0d48a" />
          <stop offset="0.8" stopColor="#c9a24a" />
          <stop offset="1" stopColor="#c9a24a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect x="0" y="2" width="200" height="1" fill={`url(#${id}-fade)`} />
      <rect x="0" y="5" width="200" height="2.2" fill={`url(#${id}-fade)`} />
    </svg>
  )
}
