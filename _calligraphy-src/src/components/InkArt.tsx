import type { ReactNode } from 'react'

// Loose black-ink drawings of generic pen parts and ink bottles, used as faded
// art behind the field guide entries. Drawn for this app; none of them is a
// picture of a particular pen or bottle.

export type ArtKind =
  | 'nib'
  | 'bignib'
  | 'feed'
  | 'piston'
  | 'cartridge'
  | 'cigar'
  | 'flattop'
  | 'click'
  | 'innercap'
  | 'demonstrator'
  | 'bottle-round'
  | 'bottle-square'
  | 'bottle-tall'
  | 'inkwell'
  | 'dropper'
  | 'swatch'
  | 'drop'
  | 'galls'

/** Parallel hatching lines between x0 and x1, clipped by the caller's shape. */
const hatch = (x0: number, x1: number, y0: number, y1: number, gap = 6, slope = 10) => {
  let d = ''
  for (let x = x0; x <= x1; x += gap) d += `M${x} ${y0}l${slope} ${y1 - y0}`
  return d
}

const NIB = 'M100 18c22 14 34 44 30 82-2 18-8 34-14 46l-16 40-16-40c-6-12-12-28-14-46-4-38 8-68 30-82z'

const ART: Record<ArtKind, ReactNode> = {
  nib: (
    <g transform="rotate(-28 100 100)">
      <path d={NIB} />
      <circle cx="100" cy="104" r="5" />
      <path d="M100 109v77M76 66c14 6 34 6 48 0M80 52c12 4 28 4 40 0" />
      <path d={hatch(112, 128, 30, 140, 5, -6)} strokeWidth="0.9" clipPath="url(#ia-nib)" />
    </g>
  ),
  bignib: (
    <g transform="rotate(-20 100 100)">
      <path d="M100 6c32 18 48 58 42 104-3 22-12 42-20 56l-22 30-22-30c-8-14-17-34-20-56-6-46 10-86 42-104z" />
      <path d="M100 118v78" />
      <path d="M94 110c0-8 12-8 12 0s-6 8-6 8-6 0-6-8z" />
      <path d="M72 40c10-12 22-10 26 0-8-2-14 2-12 10M128 40c-10-12-22-10-26 0 8-2 14 2 12 10M66 72c12 10 24 8 30 0M134 72c-12 10-24 8-30 0" strokeWidth="1.2" />
      <path d="M80 88c12 6 28 6 40 0" />
    </g>
  ),
  feed: (
    <g transform="rotate(-14 100 100)">
      <path d="M18 92h120l40 10-40 10H18z" />
      <path d="M30 112c0 10 4 14 10 14h90c6 0 10-4 12-14" />
      <path d={Array.from({ length: 14 }, (_, i) => `M${36 + i * 7} 112v12`).join('')} strokeWidth="1.1" />
      <path d="M18 102h150" strokeWidth="0.8" />
      <path d="M10 80c0-6 4-8 8-8h20v60H18c-4 0-8-2-8-8z" />
    </g>
  ),
  piston: (
    <g transform="rotate(-32 100 100)">
      <path d="M40 76h104c8 0 12 4 12 12v24c0 8-4 12-12 12H40z" />
      <path d="M156 84h18c4 0 6 3 6 6v20c0 3-2 6-6 6h-18z" />
      <path d="M162 84v32M168 84v32M174 84v32" strokeWidth="1" />
      <path d="M96 80v40M100 80v40M100 100h56" />
      <path d={hatch(104, 140, 100, 120, 6, 4)} strokeWidth="1" />
      <path d={hatch(44, 92, 80, 120, 5, 6)} strokeWidth="0.9" />
      <path d="M40 80l-18 8v24l18 8" />
      <path d="M22 100h-14" />
    </g>
  ),
  cartridge: (
    <g transform="rotate(-24 100 100)">
      <path d="M34 66h96c6 0 8 3 8 8v14c0 5-2 8-8 8H34c-4 0-6-3-6-8V74c0-5 2-8 6-8z" />
      <path d="M138 72h20v18h-20M158 76h14v10h-14" />
      <path d={hatch(36, 96, 68, 94, 6, 4)} strokeWidth="0.9" />
      <path d="M100 66v30" />
      <path d="M44 126h56c6 0 10 4 10 10s-4 10-10 10H44c-6 0-8-4-8-10s2-10 8-10z" />
      <path d="M110 132h10v8h-10" />
      <path d={hatch(46, 96, 128, 144, 6, 3)} strokeWidth="0.9" />
    </g>
  ),
  cigar: (
    <g transform="rotate(-30 100 100)">
      <path d="M20 100c0-14 10-20 26-20h100c22 0 36 10 36 20s-14 20-36 20H46c-16 0-26-6-26-20z" />
      <path d="M112 80v40M116 80v40" />
      <path d="M126 80c18-6 30-2 34 4l-8 6c-6-4-16-6-26-4" />
      <path d="M38 84v32M150 84c6 4 6 28 0 32" strokeWidth="1" />
      <path d={hatch(40, 104, 104, 118, 5, 3)} strokeWidth="0.8" />
    </g>
  ),
  flattop: (
    <g transform="rotate(-26 100 100)">
      <path d="M24 78h120v44H24z" />
      <path d="M144 80h8v40h-8M24 78v44" />
      <path d="M110 78v44M116 78v44" />
      <path d="M40 78h70c6 0 8 2 8 6M40 78c-6 0-8 4-6 8l4 6" />
      <circle cx="38" cy="96" r="4" />
      <path d={hatch(28, 104, 106, 122, 5, 3)} strokeWidth="0.8" />
      <path d="M152 92h26M152 100h22M152 108h26" strokeWidth="0.9" />
    </g>
  ),
  click: (
    <g transform="rotate(-34 100 100)">
      <path d="M30 80h120c14 0 22 8 22 20s-8 20-22 20H30z" />
      <path d="M30 86h-14v28h14M16 92h-8v16h8" />
      <path d="M172 100h14" />
      <path d="M186 94l12 6-12 6z" />
      <path d="M150 92c6 0 10 4 12 8" strokeWidth="1" />
      <path d={hatch(36, 140, 104, 120, 6, 4)} strokeWidth="0.8" />
      <path d="M60 80v40" />
    </g>
  ),
  innercap: (
    <g transform="rotate(-20 100 100)">
      <path d="M40 60h110c10 0 16 10 16 40s-6 40-16 40H40z" />
      <path d="M40 60v80M58 72h80v56H58z" />
      <path d="M138 82c8 4 8 32 0 36" />
      <path d="M70 72c6 10-6 14 0 24s-6 14 0 24M86 72c6 10-6 14 0 24s-6 14 0 24" strokeWidth="1.1" />
      <path d={hatch(140, 160, 64, 136, 5, 0)} strokeWidth="0.8" />
    </g>
  ),
  demonstrator: (
    <g transform="rotate(-28 100 100)">
      <path d="M30 78h120c10 0 14 6 14 22s-4 22-14 22H30z" />
      <path d="M30 84l-16 8v16l16 8M14 100H4" />
      <path d="M100 84v32M104 84v32M104 100h46" />
      <path d="M36 104c8-4 14 4 22 0s14-4 22 0 12 2 16 0" />
      <path d={hatch(36, 92, 106, 118, 4, 2)} strokeWidth="0.8" />
      <path d="M164 88h12v24h-12" />
    </g>
  ),
  'bottle-round': (
    <g>
      <path d="M80 28h40v26H80z" />
      <path d="M86 54v14c-30 8-48 30-48 58 0 34 28 54 62 54s62-20 62-54c0-28-18-50-48-58V54" />
      <path d="M56 130c10 8 26 12 44 12s34-4 44-12" />
      <path d={hatch(54, 146, 132, 172, 6, 6)} strokeWidth="0.9" />
      <path d="M68 96c-6 8-8 18-6 26" strokeWidth="1.2" />
    </g>
  ),
  'bottle-square': (
    <g transform="rotate(-6 100 100)">
      <path d="M78 22h44v28H78z" />
      <path d="M84 50v12H48c-6 0-8 4-8 8v100c0 6 2 8 8 8h104c6 0 8-2 8-8V70c0-4-2-8-8-8h-36V50" />
      <path d="M58 100h84v46H58z" strokeWidth="1.1" />
      <path d="M68 116h48M68 128h64" strokeWidth="0.9" />
      <path d={hatch(46, 154, 152, 176, 6, 4)} strokeWidth="0.9" />
      <path d="M52 76v18" strokeWidth="1.2" />
    </g>
  ),
  'bottle-tall': (
    <g>
      <path d="M84 14h32v30H84z" />
      <path d="M88 44v14c-12 6-20 16-20 30v84c0 6 4 10 10 10h44c6 0 10-4 10-10V88c0-14-8-24-20-30V44" />
      <path d={hatch(70, 128, 120, 180, 5, 4)} strokeWidth="0.9" />
      <path d="M70 120h60" />
      <path d="M78 92v20" strokeWidth="1.2" />
    </g>
  ),
  inkwell: (
    <g>
      <path d="M44 120c0-24 24-34 56-34s56 10 56 34-24 46-56 46-56-22-56-46z" />
      <path d="M78 92c-4-10 2-16 22-16s26 6 22 16" />
      <path d="M58 126c12 10 26 14 42 14s30-4 42-14" />
      <path d={hatch(56, 146, 128, 160, 6, 6)} strokeWidth="0.9" />
      <path d="M102 82l44-70" strokeWidth="2.4" />
      <path d="M146 12l8-10M102 82l-4 8 7-4" />
    </g>
  ),
  dropper: (
    <g transform="rotate(-18 100 100)">
      <path d="M92 10h16c4 0 6 4 6 8v30H86V18c0-4 2-8 6-8z" />
      <path d="M86 48h28v8H86zM94 56h12v100l-6 14-6-14z" />
      <path d={hatch(94, 104, 110, 156, 3, 2)} strokeWidth="0.8" />
      <path d="M100 182c-4 6-6 9-6 12a6 6 0 0012 0c0-3-2-6-6-12z" />
    </g>
  ),
  swatch: (
    <g>
      <path d="M30 70c30-14 90-18 140-6 6 2 6 10 0 12-30 6-40 14-34 26 4 8 20 10 30 14 6 2 4 10-2 10-40 6-96 4-130-6-6-2-6-10 0-12 24-6 40-14 34-24-4-8-20-6-38-4-6 0-6-8 0-10z" />
      <path d={hatch(36, 166, 72, 132, 5, 3)} strokeWidth="0.8" />
      <path d="M44 156l112 0M44 166h80" strokeWidth="1" />
    </g>
  ),
  drop: (
    <g>
      <path d="M100 16c-20 34-36 56-36 78a36 36 0 0072 0c0-22-16-44-36-78z" />
      <path d="M82 96c0 10 6 18 14 20" strokeWidth="1.2" />
      <ellipse cx="100" cy="172" rx="56" ry="12" />
      <ellipse cx="100" cy="172" rx="76" ry="18" strokeWidth="0.8" strokeDasharray="2 5" />
    </g>
  ),
  galls: (
    <g>
      <circle cx="70" cy="120" r="30" />
      <circle cx="128" cy="134" r="22" />
      <path d="M70 90c4-14 16-26 30-30M128 112c2-10 10-18 20-20" />
      <path d="M100 60c10-8 30-10 44-4-8 10-26 14-44 4zM148 92c10-2 22 2 28 10-10 4-22 2-28-10z" strokeWidth="1.2" />
      <circle cx="58" cy="110" r="2" />
      <circle cx="80" cy="128" r="2" />
      <circle cx="120" cy="140" r="2" />
      <path d={hatch(44, 96, 124, 150, 5, 4)} strokeWidth="0.8" />
    </g>
  ),
}

/** A faded ink drawing to sit behind an entry. */
export function InkArt({ kind, className }: { kind: ArtKind; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <defs>
        <clipPath id="ia-nib">
          <path d={NIB} />
        </clipPath>
      </defs>
      <g filter="url(#ink-bleed)">{ART[kind]}</g>
    </svg>
  )
}
