import type { PaperId } from '../lib/pen'
import laid from '../assets/paper/natural_paper.png'
import cream from '../assets/paper/lightpaperfibers.png'
import smooth from '../assets/paper/smooth_paper.png'

// The real paper scans, as images for drawing saved pages and share cards.
export const paperUrls: Record<PaperId, string> = { laid, cream, smooth }

const img = (src: string) => (typeof Image !== 'undefined' ? Object.assign(new Image(), { src }) : ({} as HTMLImageElement))

export const paperScans: Record<PaperId, HTMLImageElement> = {
  laid: img(laid),
  cream: img(cream),
  smooth: img(smooth),
}
