/* eslint-disable react/only-export-components */
// Pieces of The greatest achievement: a handwritten page, the reaction row, icons.

import type { ReactNode } from 'react'
import { REACTIONS, toggleReaction, useReactions, type Post } from '../lib/feed'
import { scriptById } from '../lib/scripts'
import { Hand } from './ui'

const path = {
  love: 'M12 20 C6 15.5 3 12.4 3 8.8 C3 6.2 5 4.4 7.4 4.4 C9.2 4.4 10.8 5.4 12 7.2 C13.2 5.4 14.8 4.4 16.6 4.4 C19 4.4 21 6.2 21 8.8 C21 12.4 18 15.5 12 20 Z',
  beautiful: 'M12 3 L14.3 9.2 L21 9.4 L15.7 13.5 L17.6 20 L12 16.2 L6.4 20 L8.3 13.5 L3 9.4 L9.7 9.2 Z',
  inspired: 'M12 22 L9 16.5 C7.4 14.2 7 11.5 7.6 8.8 C8.3 5.6 10 3.6 12 2.6 C14 3.6 15.7 5.6 16.4 8.8 C17 11.5 16.6 14.2 15 16.5 Z M12 13 V21',
  pen: 'M12 22 L9 16.5 C7.4 14.2 7 11.5 7.6 8.8 C8.3 5.6 10 3.6 12 2.6 C14 3.6 15.7 5.6 16.4 8.8 C17 11.5 16.6 14.2 15 16.5 Z M12 13 V21',
  ink: 'M12 3 C15.5 8 18 11 18 14.4 C18 17.8 15.3 20.6 12 20.6 C8.7 20.6 6 17.8 6 14.4 C6 11 8.5 8 12 3 Z',
  paper: 'M6 3 H14.5 L18.5 7 V21 H6 Z M14.5 3 V7 H18.5',
  lock: 'M7 11 V8 A5 5 0 0 1 17 8 V11 M5.5 11 H18.5 V20.5 H5.5 Z',
}

export function Glyph({ d, size = 18, fill = 'none', stroke = 'currentColor' }: { d: keyof typeof path; size?: number; fill?: string; stroke?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden>
      <path d={path[d]} fill={fill} stroke={stroke} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

/** A handwritten page: the photo if there is one, else the words in the hand's font on ruled paper. */
export function PageArt({ post, line, xh, tilt = 0, children }: { post: Post; line: number; xh: number; tilt?: number; children?: ReactNode }) {
  const font = scriptById(post.hand).font
  return (
    <figure className="relative m-0 h-full">
      {post.image ? (
        <img src={post.image} alt={`Photo of a handwritten page: ${post.lines.join(' ')}`} className="block h-full w-full rounded-[6px] object-cover" />
      ) : (
        <div
          role="img"
          aria-label={`${post.sample ? 'Sample page' : 'Handwritten page'}: ${post.lines.filter(Boolean).join(' ')}`}
          lang={post.lang}
          className="h-full overflow-hidden"
          style={{
            transform: `rotate(${tilt}deg)`,
            padding: `${Math.round(line * 0.25)}px ${Math.round(line * 0.35)}px 0`,
            paddingRight: children ? 44 : undefined,
            backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent ${line - 1}px, rgb(30 58 95 / 0.16) ${line - 1}px, rgb(30 58 95 / 0.16) ${line}px)`,
            backgroundPosition: `0 ${Math.round(line * 0.25)}px`,
            color: post.author.color,
          }}
        >
          {post.lines.map((ln, i) => (
            <div key={i} className="whitespace-nowrap" style={{ height: line, lineHeight: `${line}px` }}>
              {ln && <Hand text={ln} size={ln.startsWith('—') ? xh * 0.8 : xh} font={font} lineHeight={`${line}px`} />}
            </div>
          ))}
        </div>
      )}
      {children}
    </figure>
  )
}

/** Love / Beautiful / Inspired: your reaction adds one to the count. */
export function Reactions({ post }: { post: Post }) {
  const mine = useReactions()[post.id] ?? []
  return (
    <div className="flex items-center gap-1.5">
      {REACTIONS.map((r) => {
        const on = mine.includes(r.id)
        const n = post.counts[r.id] + (on ? 1 : 0)
        return (
          <button
            key={r.id}
            type="button"
            aria-pressed={on}
            aria-label={`${r.label}, ${n}`}
            onClick={() => toggleReaction(post.id, r.id)}
            className="press flex min-h-[40px] min-w-[60px] items-center justify-center gap-1.5 rounded-[20px] border-0 px-3 text-[16px]"
            style={{ background: on ? '#1E3A5F' : 'rgb(120 98 60 / 0.1)', color: on ? '#FBF6EA' : '#1C2433' }}
          >
            <Glyph d={r.id} fill={on ? 'currentColor' : 'none'} />
            {n}
          </button>
        )
      })}
    </div>
  )
}

export function Avatar({ post, size = 34 }: { post: Post; size?: number }) {
  return (
    <span
      aria-hidden
      className="flex flex-none items-center justify-center rounded-full font-extrabold text-paper"
      style={{ width: size, height: size, background: post.author.color, fontSize: size * 0.44 }}
    >
      {post.author.name.replace(/^Sample writer /, '').charAt(0)}
    </span>
  )
}

export function SampleNote() {
  return (
    <p className="m-0 flex items-start gap-2 rounded-[14px] border border-dashed border-vermilion/50 px-3.5 py-2.5 text-[14.5px] leading-snug text-vermilion">
      <span className="mt-[1px] rounded-[6px] bg-vermilion px-1.5 text-[12px] font-bold text-paper">Preview</span>
      Sample pages show how this will look. They are not real people’s pages.
    </p>
  )
}
