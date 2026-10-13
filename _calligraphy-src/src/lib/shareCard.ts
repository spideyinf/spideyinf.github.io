// A 9:16 card for sharing a saved page (sized for Instagram and TikTok
// stories): the page on paper, the app's name written above it, and where
// to find the app below. Every share is a small invitation to write.

import { paperScans } from '../components/paperScans'
import { loadHand } from './hand'
import { shortDate } from './date'

export const APP_URL = 'spideyinf.github.io/calligraphy'

const W = 1080
const H = 1920

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })

export async function makeShareCard(page: { src: string; day: string; label: string; hand?: string }) {
  await Promise.all([loadHand('Pinyon Script'), document.fonts.load('40px "Inter Variable"')])
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')!

  // Paper.
  ctx.fillStyle = '#e9e1d0'
  ctx.fillRect(0, 0, W, H)
  const scan = paperScans.laid
  if (scan.complete && scan.naturalWidth) {
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = ctx.createPattern(scan, 'repeat')!
    ctx.fillRect(0, 0, W, H)
    ctx.globalCompositeOperation = 'source-over'
  }
  const vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75)
  vignette.addColorStop(0, 'rgba(90,60,30,0)')
  vignette.addColorStop(1, 'rgba(90,60,30,0.18)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, W, H)

  // Title, in ink.
  ctx.fillStyle = '#2a221e'
  ctx.textAlign = 'center'
  ctx.font = '150px "Pinyon Script"'
  ctx.fillText('Writing to Learn', W / 2, 250)
  ctx.font = '62px "Pinyon Script"'
  ctx.fillStyle = '#4a3f38'
  ctx.fillText('a line every day', W / 2, 345)

  // The page, laid on the paper with a slight tilt.
  const img = await loadImage(page.src)
  const pw = 820
  const ph = Math.min(1200, (img.height / img.width) * pw)
  ctx.save()
  ctx.translate(W / 2, 420 + ph / 2)
  ctx.rotate((-1.6 * Math.PI) / 180)
  ctx.shadowColor = 'rgba(60,40,20,0.28)'
  ctx.shadowBlur = 36
  ctx.shadowOffsetY = 14
  ctx.fillStyle = '#f7f2e7'
  ctx.fillRect(-pw / 2 - 18, -ph / 2 - 18, pw + 36, ph + 36)
  ctx.shadowColor = 'transparent'
  ctx.drawImage(img, 0, 0, img.width, Math.min(img.height, (ph / pw) * img.width), -pw / 2, -ph / 2, pw, ph)
  ctx.restore()

  // What it is, and where to find the app.
  const y = Math.min(H - 220, 420 + ph + 110)
  ctx.fillStyle = '#4a3f38'
  ctx.font = '40px "Inter Variable", system-ui, sans-serif'
  ctx.fillText([page.label, page.hand, shortDate(page.day)].filter(Boolean).join(', '), W / 2, y)
  ctx.fillStyle = '#6e6255'
  ctx.font = '34px "Inter Variable", system-ui, sans-serif'
  ctx.fillText(APP_URL, W / 2, H - 120)

  return new Promise<Blob>((resolve) => c.toBlob((b) => resolve(b!), 'image/jpeg', 0.9))
}

/** Share through the phone's share sheet when it accepts images; otherwise download. */
export async function sharePage(page: { src: string; day: string; label: string; hand?: string }) {
  const blob = await makeShareCard(page)
  const file = new File([blob], `writing-to-learn-${page.day}.jpg`, { type: 'image/jpeg' })
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Writing to Learn', text: `A page from today. Write with me: https://${APP_URL}` })
      return 'shared'
    } catch {
      return 'cancelled'
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = file.name
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
  return 'downloaded'
}
