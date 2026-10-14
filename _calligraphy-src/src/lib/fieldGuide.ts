// A small field guide to well-known fountain pens and inks: names and plain
// facts only. The drawings beside each entry are generic pen parts and
// bottles (see components/InkArt.tsx), not pictures of these products.
// The app is not affiliated with any of these makers.

import type { ArtKind } from '../components/InkArt'

export type GuideEntry = {
  id: string
  name: string
  maker: string
  origin: string
  /** One or two plain sentences. */
  note: string
  art: ArtKind
  /** Ink colour hint, for the small swatch dot (inks only). */
  swatch?: string
}

export const PENS: GuideEntry[] = [
  {
    id: 'pelikan-m',
    name: 'Souverän M series',
    maker: 'Pelikan',
    origin: 'Germany',
    note: 'A family of piston fillers in sizes from the small M400 to the large M1000. Pelikan has made piston-filling pens since 1929.',
    art: 'piston',
  },
  {
    id: 'lamy-safari',
    name: 'Safari',
    maker: 'Lamy',
    origin: 'Germany, 1980',
    note: 'A light, sturdy plastic pen with steel nibs you can swap in seconds. Many people’s first fountain pen.',
    art: 'cartridge',
  },
  {
    id: 'lamy-2000',
    name: 'Lamy 2000',
    maker: 'Lamy',
    origin: 'Germany, 1966',
    note: 'A piston filler with a hooded gold nib, still made to its original design more than half a century on.',
    art: 'feed',
  },
  {
    id: 'sailor-1911',
    name: '1911',
    maker: 'Sailor',
    origin: 'Japan',
    note: 'A classic cigar-shaped pen named for the year Sailor was founded. Its gold nibs write finer than European ones of the same size.',
    art: 'cigar',
  },
  {
    id: 'sailor-progear',
    name: 'Professional Gear',
    maker: 'Sailor',
    origin: 'Japan',
    note: 'The flat-ended sibling of the 1911, with the same gold nibs, known for a little feedback on the page.',
    art: 'flattop',
  },
  {
    id: 'sailor-kop',
    name: 'King of Pen',
    maker: 'Sailor',
    origin: 'Japan',
    note: 'Sailor’s largest pen, with an oversized gold nib. Some are made in ebonite or finished in urushi lacquer.',
    art: 'bignib',
  },
  {
    id: 'pilot-custom',
    name: 'Custom 74 and 743',
    maker: 'Pilot',
    origin: 'Japan',
    note: 'Dependable gold-nibbed pens. The 743 offers the FA nib, cut away at the sides so it flexes into thicker lines.',
    art: 'nib',
  },
  {
    id: 'pilot-capless',
    name: 'Capless',
    maker: 'Pilot',
    origin: 'Japan, 1963',
    note: 'A fountain pen with no cap: click it and the nib comes out through a small door. Also sold as the Vanishing Point.',
    art: 'click',
  },
  {
    id: 'platinum-3776',
    name: '3776 Century',
    maker: 'Platinum',
    origin: 'Japan',
    note: 'Named for the height of Mount Fuji in metres. Its sealing cap keeps a pen from drying out even after months unused.',
    art: 'innercap',
  },
  {
    id: 'twsbi-eco',
    name: 'Eco',
    maker: 'TWSBI',
    origin: 'Taiwan',
    note: 'An affordable clear piston filler, so you can watch the ink inside. A good pen for trying bottled inks.',
    art: 'demonstrator',
  },
]

export const INKS: GuideEntry[] = [
  {
    id: 'pelikan-4001',
    name: '4001 Royal Blue',
    maker: 'Pelikan',
    origin: 'Germany',
    note: 'A gentle, well-behaved classic blue. Safe in almost any pen.',
    art: 'bottle-round',
    swatch: '#2c4fa8',
  },
  {
    id: 'iroshizuku',
    name: 'Iroshizuku',
    maker: 'Pilot',
    origin: 'Japan',
    note: 'A range named after Japanese nature. Kon-peki, the blue of a deep summer sky, is the best known.',
    art: 'dropper',
    swatch: '#1f7fb8',
  },
  {
    id: 'sailor-shikiori',
    name: 'Shikiori',
    maker: 'Sailor',
    origin: 'Japan',
    note: 'Soft, shading colours inspired by the seasons and old Japanese tales.',
    art: 'swatch',
    swatch: '#7a6aa8',
  },
  {
    id: 'platinum-carbon',
    name: 'Carbon Black',
    maker: 'Platinum',
    origin: 'Japan',
    note: 'A pigmented black that dries waterproof, loved for sketching. Clean the pen now and then.',
    art: 'drop',
    swatch: '#1a1a1a',
  },
  {
    id: 'diamine-oxblood',
    name: 'Oxblood',
    maker: 'Diamine',
    origin: 'England, since 1864',
    note: 'A deep dark red that reads almost brown on the page.',
    art: 'bottle-square',
    swatch: '#6e1f22',
  },
  {
    id: 'rk-salix',
    name: 'Salix',
    maker: 'Rohrer & Klingner',
    origin: 'Germany',
    note: 'An iron-gall ink: it goes on blue and darkens to a blue-black as it dries, as in the old ledgers.',
    art: 'galls',
    swatch: '#2c3d6b',
  },
  {
    id: 'herbin-1670',
    name: '1670 series',
    maker: 'J. Herbin',
    origin: 'France',
    note: 'Inks named for the year the house was founded, with flecks of gold that glint as they dry.',
    art: 'inkwell',
    swatch: '#8e2230',
  },
  {
    id: 'sailor-kiwaguro',
    name: 'Kiwa-guro',
    maker: 'Sailor',
    origin: 'Japan',
    note: 'A pigmented, very black ink that resists water and fading once dry.',
    art: 'bottle-tall',
    swatch: '#141414',
  },
]
