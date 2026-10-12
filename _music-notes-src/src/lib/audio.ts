import { frequency } from './music'

export type Voice = 'piano' | 'guitar'

let ctx: AudioContext | null = null
let master: GainNode | null = null
const pluckCache = new Map<number, AudioBuffer>()

/**
 * Recorded instruments from tonejs-instruments by Nicholaus P. Brosowsky
 * (CC BY 3.0). One sample every 3 half-steps; notes in between are
 * pitch-shifted from the nearest sample, at most 1.5 half-steps.
 */
const NAMES = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B']
const sampleName = (midi: number) => NAMES[midi % 12] + (Math.floor(midi / 12) - 1)

const range = (from: number, to: number, step = 3) => {
  const out: number[] = []
  for (let m = from; m <= to; m += step) out.push(m)
  return out
}

const SAMPLES: Record<Voice, { dir: string; notes: number[]; length: number }> = {
  // C1 … A7 every 3 half-steps, plus the top C8 (covers all 88 keys)
  piano: { dir: 'piano', notes: [...range(24, 105), 108], length: 4 },
  // E2 … C♯5 every 3 half-steps, plus D5
  guitar: { dir: 'guitar', notes: [...range(40, 73), 74], length: 3.2 },
}

const buffers: Record<Voice, Map<number, AudioBuffer>> = { piano: new Map(), guitar: new Map() }
let loading = false

function loadSamples(c: AudioContext) {
  if (loading) return
  loading = true
  for (const voice of ['piano', 'guitar'] as Voice[]) {
    const { dir, notes } = SAMPLES[voice]
    // Middle of the range first, so the notes you're likely to play arrive soonest
    const ordered = [...notes].sort((a, b) => Math.abs(a - 62) - Math.abs(b - 62))
    for (const midi of ordered) {
      fetch(`${import.meta.env.BASE_URL}samples/${dir}/${sampleName(midi)}.mp3`)
        .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(r.status)))
        .then((data) => decode(c, data))
        .then((buf) => buffers[voice].set(midi, buf))
        // A missing sample just means that range keeps the synthesized fallback
        .catch(() => undefined)
    }
  }
}

type AudioCtor = typeof AudioContext
const Ctor: AudioCtor | undefined =
  window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioCtor }).webkitAudioContext

/** decodeAudioData as a promise, including older Safari's callback-only version */
const decode = (c: AudioContext, data: ArrayBuffer) =>
  new Promise<AudioBuffer>((resolve, reject) => {
    const p = c.decodeAudioData(data, resolve, reject)
    if (p && typeof p.then === 'function') p.then(resolve, reject)
  })

let silentEl: HTMLAudioElement | null = null

/** A tiny silent WAV, used to switch older iOS into "playback" audio */
function silentWav() {
  const rate = 8000
  const n = rate / 10
  const buf = new ArrayBuffer(44 + n)
  const v = new DataView(buf)
  const str = (o: number, s: string) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)))
  str(0, 'RIFF')
  v.setUint32(4, 36 + n, true)
  str(8, 'WAVEfmt ')
  v.setUint32(16, 16, true)
  v.setUint16(20, 1, true)
  v.setUint16(22, 1, true)
  v.setUint32(24, rate, true)
  v.setUint32(28, rate, true)
  v.setUint16(32, 1, true)
  v.setUint16(34, 8, true)
  str(36, 'data')
  v.setUint32(40, n, true)
  for (let i = 0; i < n; i++) v.setUint8(44 + i, 128)
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

/**
 * iPhone and iPad mute Web Audio when the device is in Silent mode, unless the
 * page asks for "playback" audio like a music app. Newer Safari has an API for
 * that; older versions switch over once an <audio> element is playing.
 */
function allowWhenSilent() {
  const session = (navigator as unknown as { audioSession?: { type: string } }).audioSession
  if (session) {
    try {
      session.type = 'playback'
    } catch {
      // Not supported here; nothing else to do
    }
    return
  }
  if (!/iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent)))
    return
  if (!silentEl) {
    silentEl = new Audio(silentWav())
    silentEl.loop = true
    silentEl.setAttribute('playsinline', '')
    silentEl.setAttribute('x-webkit-airplay', 'deny')
  }
  void silentEl.play().catch(() => undefined)
}

function audio() {
  if (!ctx) {
    if (!Ctor) throw new Error('Web Audio is not supported in this browser')
    ctx = new Ctor()
    master = ctx.createGain()
    master.gain.value = 0.7
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp).connect(ctx.destination)
    loadSamples(ctx)
  }
  // iOS can also leave the context "interrupted" after a call or switching apps
  if (ctx.state !== 'running') void ctx.resume().catch(() => undefined)
  return { ctx, out: master! }
}

/**
 * Must run inside a user gesture (a tap or click). Starts audio, plays one
 * silent sample, which is what iOS needs to really unlock sound, and begins
 * loading the instrument samples.
 */
export function unlockAudio() {
  if (!Ctor) return
  allowWhenSilent()
  const { ctx: c } = audio()
  const src = c.createBufferSource()
  src.buffer = c.createBuffer(1, 1, 22050)
  src.connect(c.destination)
  src.start(0)
}

/** Sets up unlocking on the first real tap, click or key press */
export function installAudioUnlock() {
  // iOS only counts these as gestures that may start audio — not touchstart/pointerdown
  const events = ['touchend', 'click', 'keydown'] as const
  const handler = () => {
    unlockAudio()
    if (ctx?.state === 'running') events.forEach((e) => window.removeEventListener(e, handler, true))
  }
  events.forEach((e) => window.addEventListener(e, handler, true))
  return () => events.forEach((e) => window.removeEventListener(e, handler, true))
}

/** Closest loaded sample, if one is near enough to sound natural */
function nearestSample(voice: Voice, midi: number) {
  let best: number | null = null
  for (const m of buffers[voice].keys()) if (best === null || Math.abs(m - midi) < Math.abs(best - midi)) best = m
  if (best === null) return null
  // Inside the sampled range stay within 3 half-steps; just past either end
  // (e.g. guitar frets 13–15 on the high E) stretch the edge sample a little more
  const { notes } = SAMPLES[voice]
  const outside = midi < notes[0] || midi > notes[notes.length - 1]
  return Math.abs(best - midi) <= (outside ? 6 : 3) ? best : null
}

function playSample(c: AudioContext, out: AudioNode, voice: Voice, midi: number, base: number, when: number) {
  const len = SAMPLES[voice].length
  const src = c.createBufferSource()
  src.buffer = buffers[voice].get(base)!
  src.playbackRate.value = 2 ** ((midi - base) / 12)
  const g = c.createGain()
  g.gain.setValueAtTime(voice === 'guitar' ? 1.1 : 0.9, when)
  g.gain.setTargetAtTime(0, when + len - 0.6, 0.2)
  src.connect(g).connect(out)
  src.start(when)
  src.stop(when + len + 0.4)
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

  const base = nearestSample(voice, midi)
  if (base !== null) {
    playSample(c, out, voice, midi, base, now)
    return
  }

  if (voice === 'guitar') {
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

  // Samples still loading: a synthesized piano-ish tone (a few decaying partials)
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
