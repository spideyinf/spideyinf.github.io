// The sound of a nib on paper: filtered noise whose loudness follows your
// speed. Finer nibs and toothier papers sound brighter and scratchier.
// Created on the first pen-down (browsers only allow audio after a gesture).

let ctx: AudioContext | null = null
let gain: GainNode | null = null
let filter: BiquadFilterNode | null = null

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  // Two seconds of looping noise: grain of the paper under the tines.
  const buf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate)
  const data = buf.getChannelData(0)
  let last = 0
  for (let i = 0; i < data.length; i++) {
    // Slightly brown noise with sparse clicks, like fibres catching the tip.
    last = last * 0.6 + (Math.random() * 2 - 1) * 0.4
    data[i] = last + (Math.random() < 0.0015 ? (Math.random() - 0.5) * 1.6 : 0)
  }
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.loop = true
  filter = ctx.createBiquadFilter()
  filter.type = 'bandpass'
  filter.Q.value = 0.9
  gain = ctx.createGain()
  gain.gain.value = 0
  src.connect(filter).connect(gain).connect(ctx.destination)
  src.start()
  return ctx
}

/** Call on pen-down. `tooth` 0 smooth – 1 scratchy (nib + paper). */
export function nibDown(tooth: number) {
  const c = ensure()
  if (!c || !filter) return
  if (c.state === 'suspended') void c.resume()
  filter.frequency.setTargetAtTime(1800 + tooth * 3200, c.currentTime, 0.01)
}

/** Call while moving, with speed in px/ms. */
export function nibMove(speed: number, tooth: number) {
  if (!ctx || !gain) return
  const level = Math.min(1, speed / 1.6) * (0.03 + tooth * 0.05)
  gain.gain.setTargetAtTime(level, ctx.currentTime, 0.03)
}

export function nibUp() {
  if (!ctx || !gain) return
  gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
}
