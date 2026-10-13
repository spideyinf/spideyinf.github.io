// Prefaces: short letters to the person holding the pen. They open the app,
// turn up on Home one a day, and can be copied out by hand in Paragraph.
// Written for Writing to Learn. Add more by appending to the list.

export type Preface = { id: string; title: string; body: string[]; sign?: string }

/** The hand the letters are written in. Swap for your own hand's font once you've added one. */
export const PREFACE_FONT = 'Merienda'

export const PREFACES: Preface[] = [
  {
    id: 'begin',
    title: 'Before you begin',
    body: [
      'Dear reader,',
      'This is not a course. It is a page, a pen, and a little time each day.',
      'You do not need beautiful handwriting to start. You need a line, then another. The hand you have today is the hand you will slowly teach, the way a garden is taught: by showing up.',
      'Write slowly. Listen to the nib. Watch the ink darken as it dries. When a letter goes wrong, leave it there; it is part of the page.',
      'We learn by writing things down. So let us write.',
    ],
    sign: 'Yours, in ink',
  },
  {
    id: 'learn',
    title: 'On writing to learn',
    body: [
      'There is an old idea that we do not really understand a thing until we have written it out ourselves. Not copied. Written, in our own words, at the speed of a hand.',
      'The hand is slow, and that is its gift. It gives the mind time to catch up. Every sentence becomes a small decision: this word, not that one.',
      'Today, write down one thing you learned. Just one. It will stay with you longer than anything you scrolled past.',
    ],
  },
  {
    id: 'pen',
    title: 'On the pen',
    body: [
      'A fountain pen asks almost nothing of you. No pressure, only a light hand and a little patience.',
      'Hold it lower than you think, rest your arm, and let the weight of the pen do the work. The tines part on their own and the ink follows.',
      'A fine nib keeps you precise. A broad one makes you generous. A stub turns every downstroke into a small ceremony. Try them all. One of them will feel as if it was waiting for you.',
    ],
  },
  {
    id: 'ink',
    title: 'On ink',
    body: [
      'Ink is the part of writing that is alive.',
      'It shades where you slow down and pales where you hurry, so every line keeps a record of how you felt as you wrote it. Some inks blush red or gold where they pool. Iron gall goes down blue and turns, while you watch, to the colour of old letters.',
      'Choose an ink for the day the way you would choose a shirt. It changes the mood of the page.',
    ],
  },
  {
    id: 'paper',
    title: 'On paper',
    body: [
      'Paper is the other half of every stroke.',
      'Rough paper drinks the ink and softens its edges; smooth paper lets it sit and shine. Neither is better. They are different rooms for the same voice.',
      'Notice the tooth under the nib, the small resistance that tells your hand where it is. That feeling is half of why we write by hand at all.',
    ],
  },
  {
    id: 'slow',
    title: 'On going slowly',
    body: [
      'Most of the day asks us to be fast. This page does not.',
      'Write as if you were speaking to someone across a table: unhurried, clear, one word after another. Speed comes later, and it comes on its own.',
      'If you only have five minutes, write five lines slowly rather than a page quickly. Slowness is not wasted time. It is where the letters learn their shape.',
    ],
  },
  {
    id: 'mistakes',
    title: 'On mistakes',
    body: [
      'Ink does not forgive, and that is a kindness.',
      'On paper, a wrong stroke stays. You see it, you understand it, and the next one is better. Nothing is hidden, so nothing is pretended.',
      'Do not start a fresh page every time a letter wobbles. Keep the wobble. In a month you will look back at it and see how far your hand has come.',
    ],
  },
  {
    id: 'daily',
    title: 'On every day',
    body: [
      'Nulla dies sine linea: no day without a line.',
      'A line is enough. Not a page, not an hour. One sentence written with care on a busy day counts as much as a long practice on a quiet one.',
      'The habit is the hand. Come back tomorrow, write one line, and the day after that. That is the whole method.',
    ],
  },
]

export const prefaceById = (id: string) => PREFACES.find((p) => p.id === id)

/** A different letter each day, after the first. */
export function prefaceOfTheDay(d = new Date()) {
  const day = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000)
  return PREFACES[1 + (day % (PREFACES.length - 1))]
}

/** As one text, for copying out in Paragraph. */
export const prefaceText = (p: Preface) => [...p.body, ...(p.sign ? [p.sign] : [])].join('\n')
