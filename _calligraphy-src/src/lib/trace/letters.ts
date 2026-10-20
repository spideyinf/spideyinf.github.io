import type { Script } from '../scripts'
import { traceOf, type Trace } from '.'

/** Can this hand be traced from its own letters (a font, or SVGs)? */
export const traceable = (s: Script) => !s.custom || s.font.startsWith('Hand ') || !!s.svgs

/** The source for one letter of a hand: its own SVG if it has one, else its font, guided by its ductus. */
export function letterTrace(script: Script, ch: string): Promise<Trace> {
  const svg = script.svgs?.[ch]
  if (svg) return traceOf({ kind: 'svg', svg })
  const glyph = (ch === ch.toUpperCase() ? script.capitals[ch] : script.lowercase[ch]) ?? undefined
  return traceOf(
    { kind: 'font', font: script.font, text: ch },
    glyph?.steps.length ? { glyph, style: script.style, key: script.id } : undefined,
  )
}

