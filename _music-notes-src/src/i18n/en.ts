/**
 * English UI text. Every user-facing string lives here so the Vietnamese
 * catalogue can mirror it key for key (vi.ts is type-checked against this).
 * Messages use ICU syntax: {name} placeholders, plural / select / selectordinal.
 */
export const en = {
  // Ordinal numbers, used inside other messages ("2nd line", "3rd string")
  ord: '{n, selectordinal, one {#st} two {#nd} few {#rd} other {#th}}',

  'app.eyebrow': 'Piano · staff · guitar',
  'app.title': 'Note map',
  'app.tagline':
    'Tap a key, a fret, or a spot on the staff — the same note or chord lights up everywhere, so you learn both instruments from one picture.',
  'app.docTitle': 'Note map — piano, staff, guitar',

  'lang.label': 'Language',

  'mode.label': 'Mode',
  'mode.explore': 'Notes',
  'mode.chords': 'Chords',
  'mode.quiz': 'Quiz',

  'settings.accidentals': 'Accidentals',
  'settings.sharps': '♯ Sharps',
  'settings.flats': '♭ Flats',
  'settings.allNames': 'All note names',
  'settings.octaves': 'Same note, other octaves',
  'settings.everywhere': 'Chord tones everywhere',
  'settings.sound': 'Sound',

  'play.piano': '▶ Piano',
  'play.guitar': '▶ Guitar',
  'play.oneByOne': '▶ One by one',
  'play.strum': '▶ Strum',

  'note.middleC': 'Middle C',
  'note.staffSounding': 'Staff (sounding)',
  'note.guitarSheet': 'Guitar sheet music',
  'note.writtenHigher': 'Written an octave higher: {where}',
  'note.onGuitar': 'On guitar',
  'note.position': '{ord} string · {fret}',
  'note.belowGuitar': 'Below the lowest guitar string (E2)',
  'note.aboveGuitar': 'Above fret 15 on the high E string',
  'note.tip': 'Tip: use ← → to step by half-steps.',

  'fret.open': 'open',
  'fret.n': 'fret {n}',

  'staff.title': 'Staff',
  'staff.hint': 'Hover a line or space to learn its name · tap to pick it',
  'staff.pianoGrand': 'Piano — grand staff',
  'staff.treble': 'Treble staff',
  'staff.bass': 'Bass staff',
  'staff.guitar': 'Guitar staff',
  'staff.trebleNames': 'Treble lines {lines} · spaces {spaces}',
  'staff.bassNames': 'Bass lines {lines} · spaces {spaces}',
  'staff.guitarWritten': 'Guitar — written one octave up',
  'staff.guitarExplain':
    'Guitar parts use a treble clef but sound an octave lower than written, so they stay on the staff instead of piling up ledger lines. A guitar note written in the 3rd space (C5) sounds like piano’s middle C (C4).',

  // Staff hover tip (short — it sits in a small card)
  'tip.line': '{ord} line',
  'tip.space': '{ord} space',
  'tip.belowStaff': 'below the staff',
  'tip.aboveStaff': 'above the staff',
  'tip.ledgerOn': 'ledger line {n} {dir, select, below {below} other {above}}',
  'tip.ledgerOff': '{dir, select, below {below} other {above}} ledger line {n}',

  // Full description of a note's place on the staff
  'desc.line': '{ord} line of the {clef, select, treble {treble} other {bass}} staff',
  'desc.space': '{ord} space of the {clef, select, treble {treble} other {bass}} staff',
  'desc.justBelow': 'just below the {clef, select, treble {treble} other {bass}} staff',
  'desc.justAbove': 'just above the {clef, select, treble {treble} other {bass}} staff',
  'desc.ledgerOn':
    'on the {ord} ledger line {dir, select, below {below} other {above}} the {clef, select, treble {treble} other {bass}} staff',
  'desc.ledgerNear':
    'just {dir, select, below {below} other {above}} the {ord} ledger line {dir, select, below {below} other {above}} the {clef, select, treble {treble} other {bass}} staff',

  'piano.title': 'Piano',
  'piano.hint': '88 keys, A0 – C8 · scroll sideways · each key is one half-step',
  'piano.hintChords': 'Tap any key to make it the root · labels show note and degree',
  'guitar.title': 'Guitar',
  'guitar.hint': 'Standard tuning E A D G B E · each fret is one half-step',
  'guitar.hintChords': 'Big dots = the chord shape (degree shown) · × = string not played',
  'drag.label': 'Move {name} {dir, select, up {up} other {down}} (drag, or use the arrow keys)',

  'fretboard.aria': 'Guitar fretboard, standard tuning',
  'fretboard.cell': '{note}, string {n}, {fret}',
  'chart.aria': 'Chord chart',
  'chart.fret': '{n}fr',

  'quiz.prompt': 'Prompt',
  'quiz.read': 'Read',
  'quiz.name': 'Name',
  'quiz.ear': 'Ear',
  'quiz.range': 'Range',
  'quiz.accidentals': 'Include ♯/♭',
  'quiz.anyOctave': 'Any octave counts',
  'quiz.askStaff': 'Find the note shown on the staff',
  'quiz.askName': 'Find {note}',
  'quiz.askEar': 'Listen, then find the note',
  'quiz.answerOn': 'Answer on the piano, the fretboard, or the staff.',
  'quiz.correct': '{note} ✓',
  'quiz.itIs': 'It’s {note}',
  'quiz.wrong': 'Not {note} — try again',
  'quiz.score': 'Score',
  'quiz.streak': 'Streak',
  'quiz.best': 'Best',
  'quiz.replay': '▶ Replay',
  'quiz.showMe': 'Show me',
  'quiz.next': 'Next →',
  'quiz.reset': 'Reset score',

  'chords.pick': 'Pick a chord',
  'chords.root': 'Root',
  'chords.type': 'Type',
  'chords.lowest': 'Which note is lowest',
  'chords.inversion': 'Inversion',
  'chords.invRoot': 'Root',
  'chords.invN': '{ord} inv',
  'chords.subtitle': '{root} {quality}',
  'chords.rule': 'Rule:',
  'chords.buildTitle': 'Build it step by step — tap to add each note',
  'chords.step': 'Step {n}',
  'chords.stepRoot': 'Root',
  'chords.stepAdd': '+ {degree}',
  'chords.stepFirst': 'the chord’s name',
  'chords.stepGap': '{up} up · {interval} from root',
  'chords.staffHint': 'Colors match on every instrument · hover to name a line or space',
  'chords.guitarThisShape': 'Guitar — this shape, written one octave up',
  'chords.shapeTitle': 'Guitar shape',
  'chords.shape': 'Shape',
  'chords.open': 'Open',
  'chords.fretN': 'Fret {n}',
  'chords.noShape': 'No common shape for this voicing — use the fretboard below.',
  'chords.howTitle': 'How to find {symbol} on each instrument',
  'chords.howHint': 'Updates for the chord you picked',
  'strip.note': 'Half-steps above the root — the same pattern works from any starting note.',
  'badge.back': '{symbol}: back to chord details',
  'badge.play': 'Play {symbol}',

  // Degree names spelled out where a bare number would read oddly
  'solfege.C': 'Do',
  'solfege.D': 'Re',
  'solfege.E': 'Mi',
  'solfege.F': 'Fa',
  'solfege.G': 'Sol',
  'solfege.A': 'La',
  'solfege.B': 'Si',

  'degree.2': '2nd',
  'degree.4': '4th',

  'quality.maj.name': 'Major',
  'quality.maj.sound': 'Bright, stable, “home”. The chord most songs start and end on.',
  'quality.maj.rule': 'Major 3rd (4 half-steps) on the bottom, minor 3rd (3) on top.',
  'quality.min.name': 'Minor',
  'quality.min.sound': 'Darker, sad or serious. Only one note differs from major.',
  'quality.min.rule': 'Lower the major chord’s 3rd by one half-step: minor 3rd (3) then major 3rd (4).',
  'quality.dim.name': 'Diminished',
  'quality.dim.sound': 'Tense and unstable — it wants to move to another chord.',
  'quality.dim.rule': 'Two minor 3rds stacked (3 + 3). Like minor, but the 5th is lowered too.',
  'quality.aug.name': 'Augmented',
  'quality.aug.sound': 'Dreamy and floating, a bit eerie. Used as a passing chord.',
  'quality.aug.rule': 'Two major 3rds stacked (4 + 4). Like major, but the 5th is raised.',
  'quality.sus2.name': 'Suspended 2nd',
  'quality.sus2.sound': 'Open and airy — neither happy nor sad, because there’s no 3rd.',
  'quality.sus2.rule': 'Replace the 3rd with the 2nd (2 half-steps above the root).',
  'quality.sus4.name': 'Suspended 4th',
  'quality.sus4.sound': 'Hanging tension that usually falls back to the major chord (4 → 3).',
  'quality.sus4.rule': 'Replace the 3rd with the 4th (5 half-steps above the root).',
  'quality.7.name': 'Dominant 7th',
  'quality.7.sound': 'Bluesy and restless; pulls hard toward the chord a 5th below (G7 → C).',
  'quality.7.rule': 'Major triad plus a minor 7th (10 half-steps above the root).',
  'quality.maj7.name': 'Major 7th',
  'quality.maj7.sound': 'Soft, warm and jazzy. Common in ballads, bossa nova and city pop.',
  'quality.maj7.rule': 'Major triad plus a major 7th — one half-step below the octave.',
  'quality.m7.name': 'Minor 7th',
  'quality.m7.sound': 'Mellow and smooth; a staple of soul, R&B and jazz.',
  'quality.m7.rule': 'Minor triad plus a minor 7th (10 half-steps above the root).',

  'inv.0': 'Root position',
  'inv.1': '1st inversion',
  'inv.2': '2nd inversion',
  'inv.3': '3rd inversion',

  'interval.2': 'major 2nd',
  'interval.3': 'minor 3rd',
  'interval.4': 'major 3rd',
  'interval.5': 'perfect 4th',
  'interval.6': 'diminished 5th',
  'interval.7': 'perfect 5th',
  'interval.8': 'augmented 5th',
  'interval.10': 'minor 7th',
  'interval.11': 'major 7th',
  'interval.other': '{n} half-steps',

  'rules.then': ', then ',
  'rules.piano.walkStep': '{n} keys up to {note}',
  'rules.piano.count': 'Count every key, black and white. From {root}: {walk}.',
  'rules.piano.fingers': 'Right hand fingers {rh} (thumb on the lowest note); left hand {lh}.',
  'rules.piano.pattern':
    'The pattern of distances is what makes it {quality} — start the same count from any key to get that chord in a new key.',
  'rules.piano.inversion':
    '{inv}: the same notes, but the lowest {count, plural, one {note moves} other {# notes move}} up an octave, so {note} is on the bottom. Inversions let your hand stay in one place between chords.',
  'rules.piano.white':
    'On white keys only (C, Dm, Em, F, G, Am) a triad is just “play one, skip one, play one, skip one, play one”.',
  'rules.staff.snowman':
    'Root position chords are stacked in 3rds: each note skips one letter ({letters}), so they sit all on {where, select, lines {lines} other {spaces}} — the “snowman” shape.',
  'rules.staff.sus':
    'Sus chords break the snowman: the {which, select, sus2 {2nd sits right next to the root} other {4th sits right next to the 5th}}, so two noteheads are a step apart and print side by side.',
  'rules.staff.inversion':
    'In an inversion one gap becomes a 4th (two letters skipped), so the stack is no longer all lines or all spaces. Find the 4th gap — the note above it is the root ({root}).',
  'rules.staff.letters':
    'Letters come from the chord, not the keyboard: {names}. Every {quality} chord keeps the same letter pattern, which is why you may see ♭, ♯ or even 𝄫.',
  'rules.staff.guitar': 'Guitar sheet music writes the same chord one octave higher than it sounds.',
  'rules.guitar.none':
    'No comfortable 4-string-or-more shape for this inversion. Play the highlighted notes on the fretboard as an arpeggio instead.',
  'rules.guitar.shape': 'Shape {shape}, read from the low E string to the high E. × = don’t play, ○ = open string.',
  'rules.guitar.startRoot': 'Start the strum on the {ord} string so the lowest note is {note}, the root.',
  'rules.guitar.startInv': 'Start the strum on the {ord} string so the lowest note is {note} (the {inv}).',
  'rules.guitar.barre':
    'Barre: lay your index finger flat across fret {fret}. Barre shapes are movable — slide the whole shape up 2 frets and you get the same chord type a whole step higher.',
  'rules.guitar.open':
    'Open-position shape: it uses open strings, so it only works for this root. For other keys, use a barre shape further up the neck.',
  'rules.guitar.movable':
    'No open strings, so this shape is movable: slide it along the neck to play the same chord type from another root.',
  'rules.guitar.double':
    'Guitars double notes: {strings} strings sound but only {distinct} different note names — the root is usually repeated.',

  'footer.text':
    'Built with React, styled-components and Tailwind CSS · Piano and guitar samples from {samples} (CC BY 3.0) · {source}',
  'footer.source': 'source',
} as const

export type MessageId = keyof typeof en
