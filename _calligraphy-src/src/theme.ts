// Design tokens shared by styled-components and the canvas renderer.
// Tailwind gets the same values through @theme in index.css.
export const theme = {
  color: {
    paper: '#F5ECE6',
    paperDeep: '#ECDFD6',
    ink: '#2B1D1A',
    inkSoft: '#6B5752',
    cobalt: '#2C33B5',
    vermilion: '#E5453C',
    rule: '#D9C9C0',
  },
  radius: { card: '28px', thumb: '10px', pill: '999px' },
  font: {
    serif: "'Fraunces Variable', Georgia, serif",
    sans: "'Inter Variable', system-ui, sans-serif",
  },
} as const

export type AppTheme = typeof theme
