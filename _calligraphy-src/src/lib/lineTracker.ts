// Steady outlines for the live camera.
//
// Detections arrive about twice a second and wobble a little from frame to
// frame. The tracker matches each new line to the one it continues, eases
// its position toward the new one, only shows a line once it's been seen
// twice, and lets it go only after it's been missed twice. "Found" has the
// same hysteresis, so the status and the shutter don't flicker.

export type Box = { x0: number; y0: number; x1: number; y1: number }
type Track = Box & { id: number; hits: number; misses: number }

const iou = (a: Box, b: Box) => {
  const ix = Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0))
  const iy = Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0))
  const inter = ix * iy
  const u = (a.x1 - a.x0) * (a.y1 - a.y0) + (b.x1 - b.x0) * (b.y1 - b.y0) - inter
  return u > 0 ? inter / u : 0
}
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export class LineTracker {
  private tracks: Track[] = []
  private next = 1
  private hitRun = 0
  private missRun = 0
  found = false

  /** Feed one detection (lines in 0..1 units). Returns the lines to draw. */
  update(lines: Box[]): (Box & { id: number })[] {
    const used = new Set<Track>()
    for (const b of lines) {
      let best: Track | null = null
      let bi = 0.2
      for (const t of this.tracks) {
        if (used.has(t)) continue
        const v = iou(t, b)
        if (v > bi) {
          bi = v
          best = t
        }
      }
      if (best) {
        used.add(best)
        best.x0 = lerp(best.x0, b.x0, 0.55)
        best.y0 = lerp(best.y0, b.y0, 0.55)
        best.x1 = lerp(best.x1, b.x1, 0.55)
        best.y1 = lerp(best.y1, b.y1, 0.55)
        best.hits++
        best.misses = 0
      } else {
        const t = { ...b, id: this.next++, hits: 1, misses: 0 }
        this.tracks.push(t)
        used.add(t)
      }
    }
    for (const t of this.tracks) if (!used.has(t)) t.misses++
    this.tracks = this.tracks.filter((t) => t.misses < 2)

    const shown = this.tracks.filter((t) => t.hits >= 2).sort((a, b) => a.y0 - b.y0)
    if (shown.length) {
      this.hitRun++
      this.missRun = 0
    } else {
      this.missRun++
      this.hitRun = 0
    }
    if (!this.found && this.hitRun >= 2) this.found = true
    if (this.found && this.missRun >= 3) this.found = false
    return shown.map(({ id, x0, y0, x1, y1 }) => ({ id, x0, y0, x1, y1 }))
  }

  reset() {
    this.tracks = []
    this.hitRun = this.missRun = 0
    this.found = false
  }
}
