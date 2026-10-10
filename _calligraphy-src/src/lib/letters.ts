// The alphabet as a practice sequence: Copperplate capital, business-cursive
// lowercase, a word to join them, and one thing to watch for.

export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const WORDS: Record<string, string> = {
  A: 'Autumn', B: 'Breathe', C: 'Clarity', D: 'Daily', E: 'Ease', F: 'Flourish',
  G: 'Grace', H: 'Harmony', I: 'Ink', J: 'Journey', K: 'Kindness', L: 'Linger',
  M: 'Morning', N: 'Notebook', O: 'Ovals', P: 'Patience', Q: 'Quill', R: 'Rhythm',
  S: 'Steady', T: 'Thought', U: 'Unhurried', V: 'Voice', W: 'Writing', X: 'Xenia',
  Y: 'Yearning', Z: 'Zest',
}

// Capital families in Copperplate.
const CAP_TIPS: [string, string][] = [
  ['BDFHIKLPRT', 'Capital: one heavy stem, then a hairline turn. Press only on the way down.'],
  ['CEGOQ', 'Capital: an oval family. Swell the left side of the oval, release it on the right.'],
  ['MNUVWXYZ', 'Capital: start with a small entry curve, then let the first downstroke carry the weight.'],
  ['AJS', 'Capital: a long compound curve. Keep the slant at 55° from top to bottom.'],
]

// Lowercase families in business cursive.
const LOWER_TIPS: [string, string][] = [
  ['acdgoq', 'Lowercase: close the oval at the waistline before you add the stem.'],
  ['bfhklt', 'Lowercase: loop up past the waistline, come straight down through it.'],
  ['ijmnpruvwxy', 'Lowercase: an upstroke from the baseline, then even, parallel downstrokes.'],
  ['esz', 'Lowercase: small and light. Keep the loop or turn inside the x-height.'],
]

const find = (table: [string, string][], ch: string) => table.find(([set]) => set.includes(ch))?.[1] ?? ''

export function letterInfo(upper: string) {
  const lower = upper.toLowerCase()
  return {
    upper,
    lower,
    word: WORDS[upper],
    capTip: find(CAP_TIPS, upper),
    lowerTip: find(LOWER_TIPS, lower),
  }
}
