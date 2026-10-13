import { useId } from 'react'
import type { Ink, Pen } from '../lib/pen'

// Original pen illustrations, drawn from each pen's material, colours, trim and ends.
// Nib on the left, uncapped, lying flat.

const TRIM: Record<Pen['trim'], [string, string]> = {
  gold: ['#c9a24a', '#f3dc95'],
  silver: ['#9aa1a8', '#eef1f3'],
  rose: ['#b9806a', '#f0c8b4'],
  black: ['#2a2a2c', '#5a5a5e'],
}

export function PenArt({ pen, ink, className }: { pen: Pen; ink?: Ink; className?: string }) {
  const id = useId().replace(/:/g, '')
  const [c0, c1] = pen.body
  const [t0, t1] = TRIM[pen.trim]
  const nibMetal = pen.trim === 'black' ? TRIM.silver : TRIM[pen.trim]
  const x0 = 108
  const x1 = pen.ends === 'torpedo' ? 286 : 292
  const fill = `url(#${id}-body)`

  const endPath =
    pen.ends === 'flat'
      ? `M${x1} 9 h10 a2 2 0 0 1 2 2 v22 a2 2 0 0 1 -2 2 h-10 z`
      : pen.ends === 'round'
        ? `M${x1} 9 h4 a13 13 0 0 1 0 26 h-4 z`
        : `M${x1} 9 C ${x1 + 14} 10, ${x1 + 26} 18, ${x1 + 28} 22 C ${x1 + 26} 26, ${x1 + 14} 34, ${x1} 35 z`

  const nibPath =
    pen.nib === 'stub'
      ? 'M12 17 L14 17 L40 14 Q58 12 62 15 L62 29 Q58 32 40 30 L14 27 L12 27 Z'
      : pen.nib === 'b'
        ? 'M8 20 Q8 18 10 18 L40 14 Q58 12 62 15 L62 29 Q58 32 40 30 L10 26 Q8 26 8 24 Z'
        : 'M6 22 L40 14 Q58 12 62 15 L62 29 Q58 32 40 30 Z'

  return (
    <svg className={className} viewBox="0 0 330 44" role="img" aria-label={`${pen.name} fountain pen`}>
      <defs>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.0" />
          <stop offset="0.18" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.05" />
          <stop offset="0.8" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t1} />
          <stop offset="0.5" stopColor={t0} />
          <stop offset="1" stopColor={t1} stopOpacity="0.8" />
        </linearGradient>
        <linearGradient id={`${id}-nib`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={nibMetal[1]} />
          <stop offset="0.55" stopColor={nibMetal[0]} />
          <stop offset="1" stopColor={nibMetal[1]} />
        </linearGradient>
        {pen.material === 'celluloid' || pen.material === 'ebonite' ? (
          <>
            <filter id={`${id}-marble`} x="0" y="0" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency={pen.material === 'celluloid' ? '0.012 0.09' : '0.05 0.08'}
                numOctaves="3"
                seed={pen.material === 'celluloid' ? 3 : 8}
              />
              <feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 2.2 -0.9" />
              <feComposite in2="SourceGraphic" operator="in" />
            </filter>
            <pattern id={`${id}-body`} patternUnits="userSpaceOnUse" width="330" height="44">
              <rect width="330" height="44" fill={c0} />
              <rect width="330" height="44" fill={c1} filter={`url(#${id}-marble)`} />
            </pattern>
          </>
        ) : pen.material === 'faceted' ? (
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} />
            <stop offset="0.25" stopColor={c1} />
            <stop offset="0.25" stopColor={c0} />
            <stop offset="0.5" stopColor={c0} />
            <stop offset="0.5" stopColor={c1} stopOpacity="0.85" />
            <stop offset="0.75" stopColor={c1} stopOpacity="0.85" />
            <stop offset="0.75" stopColor={c0} />
            <stop offset="1" stopColor={c0} />
          </linearGradient>
        ) : (
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={c1} stopOpacity={pen.material === 'demonstrator' ? 0.55 : 1} />
            <stop offset="1" stopColor={c0} stopOpacity={pen.material === 'demonstrator' ? 0.55 : 1} />
          </linearGradient>
        )}
      </defs>

      {/* Nib, slit and breather hole */}
      <path d={nibPath} fill={`url(#${id}-nib)`} stroke="rgb(0 0 0 / 0.25)" strokeWidth="0.6" />
      <path d={`M${pen.nib === 'stub' ? 12 : 8} 22 L44 22`} stroke="rgb(0 0 0 / 0.55)" strokeWidth="0.7" />
      <circle cx="45" cy="22" r="1.6" fill="rgb(0 0 0 / 0.55)" />
      <path d="M50 18 q4 4 0 8 M54 17 q4 5 0 10" stroke="rgb(0 0 0 / 0.18)" strokeWidth="0.6" fill="none" />

      {/* Grip section */}
      <path d="M62 13 L104 11 L104 33 L62 31 Z" fill={pen.material === 'demonstrator' ? `url(#${id}-body)` : c0} />
      <path d="M62 13 L104 11 L104 33 L62 31 Z" fill={`url(#${id}-shine)`} />
      <rect x="104" y="9.5" width="4" height="25" rx="1" fill={`url(#${id}-metal)`} />

      {/* Barrel */}
      <rect x={x0} y="9" width={x1 - x0} height="26" fill={fill} />
      {pen.material === 'demonstrator' && ink && (
        <>
          {/* Your ink, seen through the barrel */}
          <rect x={x0 + 4} y="14" width={(x1 - x0) * 0.62} height="16" rx="3" fill={ink.color} opacity="0.85" />
          <rect x={x0 + 4 + (x1 - x0) * 0.62} y="15" width="6" height="14" rx="1.5" fill="#d8dee3" opacity="0.9" />
          <path d={`M${x0 + 12 + (x1 - x0) * 0.62} 22 H${x1 - 4}`} stroke="#d8dee3" strokeWidth="2" opacity="0.8" />
        </>
      )}
      <rect x={x0} y="9" width={x1 - x0} height="26" fill={`url(#${id}-shine)`} />
      <rect x={x1 - 3} y="9" width="3" height="26" fill={`url(#${id}-metal)`} />

      {/* End */}
      <path d={endPath} fill={pen.material === 'demonstrator' ? c0 : fill} />
      <path d={endPath} fill={`url(#${id}-shine)`} />
    </svg>
  )
}

/** A generic squat ink bottle, filled with the ink (and its sheen, if any). */
export function InkBottle({ ink, className }: { ink: Ink; className?: string }) {
  const id = useId().replace(/:/g, '')
  return (
    <svg className={className} viewBox="0 0 60 70" role="img" aria-label={`${ink.name} ink`}>
      <defs>
        <linearGradient id={`${id}-ink`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={ink.wet ?? ink.color} />
          <stop offset="0.7" stopColor={ink.color} />
          <stop offset="1" stopColor={ink.sheen ?? ink.color} />
        </linearGradient>
      </defs>
      {/* Cap */}
      <rect x="20" y="4" width="20" height="13" rx="2.5" fill="#2a2522" />
      <rect x="20" y="4" width="20" height="4" rx="2" fill="#4a423c" />
      {/* Glass */}
      <path d="M22 17 h16 v5 q14 2 14 14 v22 q0 8 -8 8 h-28 q-8 0 -8 -8 v-22 q0 -12 14 -14 z" fill="rgb(255 255 255 / 0.35)" stroke="rgb(60 45 30 / 0.45)" strokeWidth="1" />
      {/* Ink */}
      <path d="M9 38 q21 -4 42 0 v20 q0 6 -6 6 h-30 q-6 0 -6 -6 z" fill={`url(#${id}-ink)`} />
      {/* Highlights */}
      <path d="M13 34 q0 -6 6 -8" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.7" fill="none" />
      <rect x="14" y="42" width="3" height="16" rx="1.5" fill="#fff" opacity="0.28" />
    </svg>
  )
}
