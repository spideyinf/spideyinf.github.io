import { useCallback, useEffect, useMemo, useState } from 'react'
import { Fretboard } from './components/Fretboard'
import { Piano } from './components/Piano'
import { Staff } from './components/Staff'
import { Card, CardTitle, PillButton, Segmented, Switch } from './components/ui'
import { LEVELS, useQuiz, type Level, type Prompt } from './hooks/useQuiz'
import { play, type Voice } from './lib/audio'
import {
  clefFor,
  describeStaff,
  frequency,
  guitarPositions,
  noteName,
  ordinal,
  PIANO_HIGH,
  PIANO_LOW,
  pitchClass,
  solfege,
  STAFF_LINE_NAMES,
  type Spelling,
} from './lib/music'
import type { MarkFn } from './lib/types'

type Mode = 'explore' | 'quiz'

export default function App() {
  const [mode, setMode] = useState<Mode>('explore')
  const [spelling, setSpelling] = useState<Spelling>('sharp')
  const [labels, setLabels] = useState(false)
  const [allOctaves, setAllOctaves] = useState(true)
  const [sound, setSound] = useState(true)
  const [selected, setSelected] = useState(60)

  const [prompt, setPrompt] = useState<Prompt>('staff')
  const [level, setLevel] = useState<Level>('treble')
  const [naturalsOnly, setNaturalsOnly] = useState(true)
  const [anyOctave, setAnyOctave] = useState(false)
  const quiz = useQuiz({ level, naturalsOnly, anyOctave })
  const { q } = quiz

  const sounding = useCallback((midi: number, voice: Voice) => sound && play(midi, voice), [sound])

  // Play the prompt in "listen" quizzes whenever a new note comes up
  useEffect(() => {
    if (mode === 'quiz' && prompt === 'sound') sounding(q.target, 'piano')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.target, mode, prompt])

  const press = (midi: number, voice: Voice) => {
    sounding(midi, voice)
    if (mode === 'explore') setSelected(midi)
    else quiz.answer(midi)
  }

  // Arrow keys step through notes in explore mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== 'explore' || (e.target as HTMLElement).closest('input,select,textarea')) return
      const d = e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
      if (!d) return
      e.preventDefault()
      setSelected((s) => {
        const n = Math.min(PIANO_HIGH, Math.max(PIANO_LOW, s + d))
        sounding(n, 'piano')
        return n
      })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mode, sounding])

  const current = mode === 'explore' ? selected : q.target
  const reveal = mode === 'explore' || q.answered

  const mark: MarkFn = useMemo(() => {
    if (mode === 'explore') {
      return (m) => (m === selected ? 'selected' : allOctaves && pitchClass(m) === pitchClass(selected) ? 'related' : undefined)
    }
    return (m) => {
      if (q.answered) {
        if (m === q.target) return 'answer'
        if (anyOctave && pitchClass(m) === pitchClass(q.target)) return 'related'
      }
      return m === q.wrong ? 'wrong' : undefined
    }
  }, [mode, selected, allOctaves, q.answered, q.target, q.wrong, anyOctave])

  const clef = clefFor(current)
  const staffMidi = reveal || prompt === 'staff' ? current : null
  const positions = guitarPositions(current)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-hot">Piano · staff · guitar</p>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">Note map</h1>
          <p className="mt-2 max-w-xl text-ink-soft">
            Tap a key, a fret, or a spot on the staff — the same note lights up everywhere, so you learn both instruments
            from one picture.
          </p>
        </div>
        <Segmented
          label="Mode"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'explore', label: 'Explore' },
            { value: 'quiz', label: 'Quiz' },
          ]}
        />
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-rule bg-card px-4 py-3">
        <Segmented
          label="Accidentals"
          value={spelling}
          onChange={setSpelling}
          options={[
            { value: 'sharp', label: '♯ Sharps' },
            { value: 'flat', label: '♭ Flats' },
          ]}
        />
        <Switch on={labels} onChange={setLabels}>
          All note names
        </Switch>
        {mode === 'explore' && (
          <Switch on={allOctaves} onChange={setAllOctaves}>
            Same note, other octaves
          </Switch>
        )}
        <Switch on={sound} onChange={setSound}>
          Sound
        </Switch>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {mode === 'explore' ? (
          <Card className="flex flex-col">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-display text-7xl font-semibold leading-none">
                  {noteName(current, spelling, false)}
                  <span className="text-4xl text-ink-faint">{Math.floor(current / 12) - 1}</span>
                </div>
                <p className="mt-2 text-sm text-ink-soft">
                  {solfege(current, spelling)} · {frequency(current).toFixed(1)} Hz
                  {current === 60 && <span className="ml-2 rounded-full bg-hot-soft px-2 py-0.5 text-xs text-ink">Middle C</span>}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <PillButton onClick={() => play(current, 'piano')}>▶ Piano</PillButton>
                <PillButton onClick={() => play(current, 'guitar')}>▶ Guitar</PillButton>
              </div>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">Staff (sounding)</dt>
                <dd className="mt-0.5">{describeStaff(current, clef, spelling)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">Guitar sheet music</dt>
                <dd className="mt-0.5">Written an octave higher: {describeStaff(current + 12, 'treble', spelling)}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">On guitar</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {positions.length ? (
                    positions.map((p) => (
                      <span key={p.string} className="rounded-full border border-rule px-2.5 py-0.5 text-xs">
                        {ordinal(p.number)} string · {p.fret === 0 ? 'open' : `fret ${p.fret}`}
                      </span>
                    ))
                  ) : (
                    <span className="text-ink-soft">
                      {current < 40 ? 'Below the lowest guitar string (E2)' : 'Above fret 15 on the high E string'}
                    </span>
                  )}
                </dd>
              </div>
            </dl>
            <p className="mt-auto pt-5 text-xs text-ink-faint">Tip: use ← → to step by half-steps.</p>
          </Card>
        ) : (
          <QuizCard
            prompt={prompt}
            setPrompt={setPrompt}
            level={level}
            setLevel={setLevel}
            naturalsOnly={naturalsOnly}
            setNaturalsOnly={setNaturalsOnly}
            anyOctave={anyOctave}
            setAnyOctave={setAnyOctave}
            spelling={spelling}
            quiz={quiz}
            replay={() => play(q.target, 'piano')}
          />
        )}

        <Card>
          <CardTitle hint={mode === 'explore' ? 'Tap a line or space to pick a note' : undefined}>Staff</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-ink-soft">Piano — grand staff</p>
              <Staff
                title="Treble staff"
                clef="treble"
                crop={[18, 132]}
                midi={staffMidi != null && clef === 'treble' ? staffMidi : null}
                spelling={spelling}
                color={mode === 'quiz' && !q.answered ? 'var(--ink)' : undefined}
                onPick={(m) => press(m, 'piano')}
                pickRange={[PIANO_LOW, PIANO_HIGH]}
              />
              <Staff
                title="Bass staff"
                clef="bass"
                crop={[40, 150]}
                midi={staffMidi != null && clef === 'bass' ? staffMidi : null}
                spelling={spelling}
                color={mode === 'quiz' && !q.answered ? 'var(--ink)' : undefined}
                onPick={(m) => press(m, 'piano')}
                pickRange={[PIANO_LOW, PIANO_HIGH]}
              />
              <p className="mt-1 text-xs text-ink-faint">
                Treble lines {STAFF_LINE_NAMES.treble.lines} · spaces {STAFF_LINE_NAMES.treble.spaces}
                <br />
                Bass lines {STAFF_LINE_NAMES.bass.lines} · spaces {STAFF_LINE_NAMES.bass.spaces}
              </p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-ink-soft">Guitar — written one octave up</p>
              <Staff
                title="Guitar staff"
                clef="treble"
                midi={reveal ? current + 12 : null}
                spelling={spelling}
                onPick={(m) => press(m - 12, 'guitar')}
                pickRange={[52, 91]}
              />
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                Guitar parts use a treble clef but sound an octave lower than written, so they stay on the staff
                instead of piling up ledger lines. A guitar note written in the 3rd space (C5) sounds like piano's middle
                C (C4).
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardTitle hint="88 keys, A0 – C8 · scroll sideways · each key is one half-step">Piano</CardTitle>
        <Piano mark={mark} spelling={spelling} showLabels={labels} focus={reveal ? current : null} onPress={(m) => press(m, 'piano')} />
      </Card>

      <Card className="mt-5">
        <CardTitle hint="Standard tuning E A D G B E · each fret is one half-step">Guitar</CardTitle>
        <Fretboard mark={mark} spelling={spelling} showLabels={labels} onPress={(m) => press(m, 'guitar')} />
      </Card>

      <footer className="mt-10 text-center text-xs text-ink-faint">
        Built with React, styled-components and Tailwind CSS ·{' '}
        <a className="underline decoration-rule underline-offset-2 hover:text-ink" href="https://github.com/spideyinf/spideyinf.github.io">
          source
        </a>
      </footer>
    </div>
  )
}

function QuizCard(props: {
  prompt: Prompt
  setPrompt: (p: Prompt) => void
  level: Level
  setLevel: (l: Level) => void
  naturalsOnly: boolean
  setNaturalsOnly: (v: boolean) => void
  anyOctave: boolean
  setAnyOctave: (v: boolean) => void
  spelling: Spelling
  quiz: ReturnType<typeof useQuiz>
  replay: () => void
}) {
  const { prompt, quiz, spelling } = props
  const { q } = quiz
  const name = noteName(q.target, spelling, !props.anyOctave)
  const ask =
    prompt === 'staff'
      ? 'Find the note shown on the staff'
      : prompt === 'name'
        ? (
            <>
              Find <span className="font-display text-2xl font-semibold text-ink">{name}</span>
            </>
          )
        : 'Listen, then find the note'

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label="Prompt"
          value={prompt}
          onChange={props.setPrompt}
          options={[
            { value: 'staff', label: 'Read' },
            { value: 'name', label: 'Name' },
            { value: 'sound', label: 'Ear' },
          ]}
        />
        <Segmented
          label="Range"
          value={props.level}
          onChange={props.setLevel}
          options={(Object.keys(LEVELS) as Level[]).map((l) => ({ value: l, label: LEVELS[l].label }))}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5">
        <Switch on={!props.naturalsOnly} onChange={(v) => props.setNaturalsOnly(!v)}>
          Include ♯/♭
        </Switch>
        <Switch on={props.anyOctave} onChange={props.setAnyOctave}>
          Any octave counts
        </Switch>
      </div>

      <div className="my-6 min-h-[88px]" aria-live="polite">
        <p className="text-lg text-ink-soft">{ask}</p>
        <p className="mt-1 text-sm text-ink-faint">Answer on the piano, the fretboard, or the staff.</p>
        {q.answered ? (
          <p className={`mt-3 font-medium ${q.solved ? 'text-good' : 'text-hot'}`}>
            {q.solved ? `${noteName(q.target, spelling)} ✓` : `It's ${noteName(q.target, spelling)}`}{' '}
            <span className="font-normal text-ink-soft">
              — {guitarPositions(q.target)
                .map((p) => `${ordinal(p.number)} string ${p.fret === 0 ? 'open' : `fret ${p.fret}`}`)
                .join(', ')}
            </span>
          </p>
        ) : (
          q.wrong != null && (
            <p className="mt-3 font-medium text-bad">Not {noteName(q.wrong, spelling)} — try again</p>
          )
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-6">
          <Stat label="Score" value={`${q.score}/${q.total}`} />
          <Stat label="Streak" value={q.streak} />
          <Stat label="Best" value={q.best} />
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt === 'sound' && <PillButton onClick={props.replay}>▶ Replay</PillButton>}
          {!q.answered && <PillButton onClick={quiz.reveal}>Show me</PillButton>}
          <PillButton $primary onClick={quiz.next}>
            Next →
          </PillButton>
        </div>
      </div>
      {q.total > 0 && (
        <button className="mt-3 self-start text-xs text-ink-faint underline underline-offset-2" onClick={quiz.reset}>
          Reset score
        </button>
      )}
    </Card>
  )
}

const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div>
    <div className="text-xs uppercase tracking-wider text-ink-faint">{label}</div>
    <div className="font-display text-2xl font-semibold">{value}</div>
  </div>
)
