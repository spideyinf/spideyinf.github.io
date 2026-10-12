// Design tokens shared by styled-components and the canvas renderer.
// Tailwind gets the same values through @theme in index.css.
export const theme = {
  color: {
    paper: '#E9E1D0',
    paperDeep: '#DDD3BE',
    note: '#F7F2E7',
    tint: 'rgba(120, 95, 60, 0.09)',
    ink: '#2A221E',
    inkSoft: '#6E6255',
    cobalt: '#2F3E6B',
    vermilion: '#B4432F',
    rule: '#CFC3AC',
  },
  radius: { card: '28px', thumb: '10px', pill: '999px' },
  font: {
    serif: "'Fraunces Variable', Georgia, serif",
    sans: "'Inter Variable', system-ui, sans-serif",
  },
} as const

export type AppTheme = typeof theme
