// A photo of a page written on real paper, made small enough to keep a month
// of pages on the device (about 100 KB each).

const MAX = 900

export async function photoToPage(file: File): Promise<string> {
  // Respect the camera's rotation so pages aren't sideways.
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const k = Math.min(1, MAX / Math.max(bmp.width, bmp.height))
  const c = document.createElement('canvas')
  c.width = Math.round(bmp.width * k)
  c.height = Math.round(bmp.height * k)
  c.getContext('2d')!.drawImage(bmp, 0, 0, c.width, c.height)
  bmp.close()
  return c.toDataURL('image/jpeg', 0.72)
}
