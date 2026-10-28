// Design tokens shared by styled-components and the canvas renderer.
// Tailwind gets the same values through @theme in index.css.
//
// Design B: a calm cream ground with a faint grain, navy ink, one amber
// accent, a sleek grotesque for the interface and a bookish italic for the
// voice. Real paper scans are kept for the parts that ARE paper: the
// tracing card, the ruled sheet you copy from, your photographed pages.
export const theme = {
  color: {
    paper: '#FBF6EA', // the ground
    paperDeep: '#F1E8D4',
    note: '#FFFBF2', // a sheet of real paper laid on the ground
    tint: 'rgba(120, 98, 60, 0.1)',
    ink: '#1C2433',
    inkSoft: '#57534E',
    cobalt: '#1E3A5F', // navy: the primary
    vermilion: '#92400E', // amber: the one accent
    rule: '#E3D9C4',
  },
  radius: { card: '20px', thumb: '12px', pill: '999px', control: '14px' },
  font: {
    serif: "'Newsreader Variable', Georgia, serif",
    sans: "'Bricolage Grotesque Variable', system-ui, sans-serif",
  },
} as const

export type AppTheme = typeof theme
