// The hands you can learn. A script is a font (for words and paragraphs)
// plus stroke data for A–Z and a–z (for the tutorials and tracing models).
//
// Built-in: Copperplate and Business cursive. Your own hands are picked up
// automatically from src/hands/<id>/ — see CUSTOM_HAND.md.

import { BUSINESS_CAPITALS, CAPITALS, LOWERCASE, type Glyph, type Style } from './ductus'

export type Script = {
  id: string
  name: string
  blurb: string
  /** CSS font-family used for words and paragraphs. */
  font: string
  style: Style
  capitals: Record<string, Glyph>
  lowercase: Record<string, Glyph>
  custom?: boolean
}

const COPPERPLATE: Script = {
  id: 'copperplate',
  name: 'Copperplate',
  blurb: 'Formal pointed-pen script: shaded downstrokes, hairline upstrokes.',
  font: 'Pinyon Script',
  style: { slant: 55, shade: 1 },
  capitals: CAPITALS,
  lowercase: LOWERCASE,
}

const BUSINESS: Script = {
  id: 'business',
  name: 'Business cursive',
  blurb: 'Quick everyday joined hand, written with an ordinary pen.',
  font: 'Ephesis',
  style: { slant: 58, shade: 0.28 },
  capitals: BUSINESS_CAPITALS,
  lowercase: LOWERCASE,
}

/* ---------- Your own hands (src/hands/<id>/hand.json + optional font) ---------- */

/** The file the in-app recorder (#/record) downloads. */
export type HandFile = {
  name: string
  blurb?: string
  slant?: number
  shade?: number
  /** Font file name inside the same folder, e.g. "font.woff2". Optional. */
  font?: string
  capitals: Record<string, Glyph>
  lowercase: Record<string, Glyph>
}

const handFiles = import.meta.glob<HandFile>('../hands/*/hand.json', { eager: true, import: 'default' })
const fontFiles = import.meta.glob<string>('../hands/*/*.{woff2,woff,ttf,otf}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const FALLBACK_FONT = BUSINESS.font

function customScripts(): Script[] {
  return Object.entries(handFiles).map(([path, h]) => {
    const dir = path.replace(/\/hand\.json$/, '')
    const id = dir.split('/').pop()!
    let font = FALLBACK_FONT
    const url = h.font ? fontFiles[`${dir}/${h.font}`] : undefined
    if (url && typeof FontFace !== 'undefined') {
      // Register the font under the hand's own family name.
      font = `Hand ${id}`
      const face = new FontFace(font, `url(${url})`)
      document.fonts.add(face)
      face.load().catch(() => console.warn(`Couldn't load the font for ${h.name}`))
    }
    return {
      id,
      name: h.name,
      blurb: h.blurb ?? 'Your own hand.',
      font,
      style: { slant: h.slant ?? 55, shade: h.shade ?? 0.4 },
      capitals: h.capitals ?? {},
      lowercase: h.lowercase ?? {},
      custom: true,
    }
  })
}

/** The hand you're recording in #/record, so you can try it before adding it to the repo. */
function draftScript(): Script[] {
  try {
    const raw = localStorage.getItem('daily-hand:recording')
    if (!raw) return []
    const d = JSON.parse(raw) as HandFile
    const has = (set: Record<string, Glyph> | undefined) => Object.values(set ?? {}).some((g) => g.steps?.length)
    if (!has(d.capitals) && !has(d.lowercase)) return []
    return [
      {
        id: 'draft',
        name: `${d.name || 'My hand'} (draft)`,
        blurb: 'Your recording in progress, on this device only.',
        font: FALLBACK_FONT,
        style: { slant: d.slant ?? 55, shade: d.shade ?? 0.4 },
        capitals: d.capitals ?? {},
        lowercase: d.lowercase ?? {},
        custom: true,
      },
    ]
  } catch {
    return []
  }
}

export const SCRIPTS: Script[] = [COPPERPLATE, BUSINESS, ...customScripts(), ...draftScript()]
export const DEFAULT_SCRIPT = COPPERPLATE

export const scriptById = (id: string | undefined) => SCRIPTS.find((s) => s.id === id) ?? DEFAULT_SCRIPT
