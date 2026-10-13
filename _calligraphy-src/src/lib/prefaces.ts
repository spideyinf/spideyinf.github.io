// The preface: one short letter that opens the app, written out on the page
// by an unseen hand, stroke by stroke, in the italic hand.

export type Preface = { body: string[]; sign: string }

export const PREFACE: Preface = {
  body: [
    'Dear reader,',
    'This is not a course. It is a page, a pen, and a little time each day.',
    'You need no beautiful hand to begin. Only a line, then another.',
    'Write slowly. Watch the ink dry. Keep the wobbles; they are part of the page.',
  ],
  sign: 'Yours, in ink',
}
