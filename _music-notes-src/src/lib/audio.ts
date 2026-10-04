import { frequency } from './music'

export type Voice = 'piano' | 'guitar'

let ctx: AudioContext | null = null
let master: GainNode | null = null
const pluckCache = new Map<number, AudioBuffer>()

/**
 * Recorded acoustic guitar, one sample every 3 half-steps (E2 – D5); notes in
 * between are pitch-shifted from the nearest sample. Samples: tonejs-instruments
 * by Nicholaus P. Brosowsky, CC BY 3.0.
 */
const GUITAR_SAMPLES: Record<number, string> = {
  40: 'E2',
  43: 'G2',
  46: 'As2',
  49: 'Cs3',
  52: 'E3',
  55: 'G3',
  58: 'As3',
  61: 'Cs4',
  64: 'E4',
  67: 'G4',
  70: 'As4',
  73: 'Cs5',
  74: 'D5',
}
const guitarBuffers = new Map<number, AudioBuffer>()
let guitarLoading: Promise<void> | null = null

function loadGuitar(c: AudioContext) {
  guitarLoading ??= Promise.all(
    Object.entries(GUITAR_SAMPLES).map(async ([midi, name]) => {
      const res = await fetch(`${import.meta.env.BASE_URL}samples/guitar/${name}.mp3`)
      const buf = await c.decodeAudioData(await res.arrayBuffer())
      guitarBuffers.set(Number(midi), buf)
    }),
  ).then(
    () => undefined,
    () => {
      // Keep the synthesized fallback if the samples can't load
      guitarLoading = null
    },
  )
  return guitarLoading
}

function audio() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.7
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp).connect(ctx.destination)
    void loadGuitar(ctx)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
}

/** Starts loading the guitar samples early, e.g. on the first tap anywhere */
export function warmUp() {
  audio()
}

function nearestSample(midi: number) {
  let best: number | null = null
  for (const m of guitarBuffers.keys()) if (best === null || Math.abs(m - midi) < Math.abs(best - midi)) best = m
  return best
}

/** Karplus–Strong plucked string, rendered once per pitch and cached */
function pluckBuffer(c: AudioContext, midi: number) {
  const cached = pluckCache.get(midi)
  if (cached) return cached
  const sr = c.sampleRate
  const len = Math.floor(sr * 2.4)
  const buf = c.createBuffer(1, len, sr)
  const data = buf.getChannelData(0)
  const period = sr / frequency(midi)
  const n = Math.max(2, Math.round(period))
  const ring = new Float32Array(n)
  // Slightly low-passed noise burst sounds more like a pick than pure noise
  let prev = 0
  for (let i = 0; i < n; i++) {
    const r = Math.random() * 2 - 1
    ring[i] = (r + prev) * 0.5
    prev = r
  }
  const decay = midi > 64 ? 0.994 : 0.997
  let idx = 0
  for (let i = 0; i < len; i++) {
    const next = (idx + 1) % n
    const v = ring[idx]
    data[i] = v
    ring[idx] = decay * 0.5 * (v + ring[next])
    idx = next
  }
  pluckCache.set(midi, buf)
  return buf
}

/** Plays one note now, or `delay` seconds from now (scheduled on the audio clock) */
export function play(midi: number, voice: Voice, delay = 0) {
  const { ctx: c, out } = audio()
  const now = c.currentTime + delay

  if (voice === 'guitar') {
    const base = nearestSample(midi)
    if (base !== null) {
      const src = c.createBufferSource()
      src.buffer = guitarBuffers.get(base)!
      src.playbackRate.value = 2 ** ((midi - base) / 12)
      const g = c.createGain()
      g.gain.setValueAtTime(1.1, now)
      g.gain.setTargetAtTime(0, now + 2.6, 0.25)
      src.connect(g).connect(out)
      src.start(now)
      src.stop(now + 3.6)
      return
    }
    // Samples still loading: fall back to a synthesized pluck
    const src = c.createBufferSource()
    src.buffer = pluckBuffer(c, midi)
    const g = c.createGain()
    g.gain.setValueAtTime(0.9, now)
    g.gain.setTargetAtTime(0, now + 1.8, 0.2)
    src.connect(g).connect(out)
    src.start(now)
    src.stop(now + 2.4)
    return
  }

  // Piano-ish: a few decaying partials, higher ones fade faster
  const f = frequency(midi)
  const partials = [
    [1, 0.6, 1.6],
    [2, 0.25, 0.9],
    [3, 0.12, 0.5],
    [4, 0.06, 0.3],
  ]
  const env = c.createGain()
  env.gain.setValueAtTime(0, now)
  env.gain.linearRampToValueAtTime(0.5, now + 0.005)
  env.connect(out)
  for (const [mult, amp, len] of partials) {
    const o = c.createOscillator()
    o.type = 'sine'
    o.frequency.value = f * mult * (1 + 0.0004 * mult * mult)
    const g = c.createGain()
    g.gain.setValueAtTime(amp, now)
    g.gain.exponentialRampToValueAtTime(0.0001, now + len * (midi < 60 ? 1.6 : 1))
    o.connect(g).connect(env)
    o.start(now)
    o.stop(now + 3)
  }
}

export type ChordStyle = 'block' | 'arpeggio' | 'strum'

/** Plays several notes: together, one by one, or as a quick guitar strum */
export function playChord(midis: number[], voice: Voice, style: ChordStyle) {
  const sorted = [...midis].sort((a, b) => a - b)
  // A real strum is a quick, slightly uneven sweep from the low string up
  const gap = style === 'block' ? 0 : style === 'strum' ? 0.028 : 0.26
  sorted.forEach((m, i) => play(m, voice, i * gap + (style === 'strum' ? Math.random() * 0.006 : 0)))
}
