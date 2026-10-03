import { frequency } from './music'

export type Voice = 'piano' | 'guitar'

let ctx: AudioContext | null = null
let master: GainNode | null = null
const pluckCache = new Map<number, AudioBuffer>()

function audio() {
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = 0.7
    const comp = ctx.createDynamicsCompressor()
    master.connect(comp).connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return { ctx, out: master! }
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

export function play(midi: number, voice: Voice) {
  const { ctx: c, out } = audio()
  const now = c.currentTime

  if (voice === 'guitar') {
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
