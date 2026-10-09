import { FormattedMessage } from 'react-intl'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChordsView } from './components/ChordsView'
import { Fretboard } from './components/Fretboard'
import { Piano } from './components/Piano'
import { Grip, Handle, SortableStack } from './components/SortableStack'
import { Staff } from './components/Staff'
import { Card, CardTitle, PillButton, Segmented, Switch } from './components/ui'
import { useChord } from './hooks/useChord'
import { LanguageSwitch } from './components/LanguageSwitch'
import { useT } from './i18n'
import { LEVELS, useQuiz, type Level, type Prompt } from './hooks/useQuiz'
import { play, playChord, warmUp, type Voice } from './lib/audio'
import {
  clefFor,
  describeStaff,
  frequency,
  guitarPositions,
  noteName,
  PIANO_HIGH,
  PIANO_LOW,
  pitchClass,
  solfege,
  STAFF_LINE_NAMES,
  staffSpelling,
  type Spelling,
} from './lib/music'
import { markPaint, type MarkFn, type PaintFn, type StaffNote } from './lib/types'

type Mode = 'explore' | 'chords' | 'quiz'

export default function App() {
  const t = useT()
  const fretLabel = (f: number) => (f === 0 ? t('fret.open') : t('fret.n', { n: f }))
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
  const chord = useChord(spelling)

  // Browsers only allow audio after a user gesture; start loading samples then
  useEffect(() => {
    window.addEventListener('pointerdown', warmUp, { once: true })
    return () => window.removeEventListener('pointerdown', warmUp)
  }, [])

  const sounding = useCallback((midi: number, voice: Voice) => sound && play(midi, voice), [sound])

  // Play the prompt in "listen" quizzes whenever a new note comes up
  useEffect(() => {
    if (mode === 'quiz' && prompt === 'sound') sounding(q.target, 'piano')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q.target, mode, prompt])

  const press = (midi: number, voice: Voice) => {
    if (mode === 'chords') {
      // Any key or fret becomes the new root
      chord.setRootPc(pitchClass(midi))
      sounding(midi, voice)
      return
    }
    sounding(midi, voice)
    if (mode === 'explore') setSelected(midi)
    else quiz.answer(midi)
  }

  // Arrow keys step through notes in explore mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (mode !== 'explore' || (e.target as HTMLElement).closest('input,select,textarea')) return
      const d =
        e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowDown' ? -1 : 0
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
      return (m) =>
        m === selected ? 'selected' : allOctaves && pitchClass(m) === pitchClass(selected) ? 'related' : undefined
    }
    return (m) => {
      if (q.answered) {
        if (m === q.target) return 'answer'
        if (anyOctave && pitchClass(m) === pitchClass(q.target)) return 'related'
      }
      return m === q.wrong ? 'wrong' : undefined
    }
  }, [mode, selected, allOctaves, q.answered, q.target, q.wrong, anyOctave])

  const paint: PaintFn = mode === 'chords' ? chord.paint : (m) => markPaint(mark(m))

  const clef = clefFor(current)
  const staffMidi = reveal || prompt === 'staff' ? current : null
  const positions = guitarPositions(current)
  const single = (midi: number | null, color = 'var(--hot)'): StaffNote[] =>
    midi == null ? [] : [{ ...staffSpelling(midi, spelling), color, key: midi }]
  const pianoFocus = mode === 'chords' ? chord.voicing[Math.floor(chord.voicing.length / 2)] : reveal ? current : null

  // A fresh chord plays itself so you hear what changed
  useEffect(() => {
    if (mode === 'chords' && sound) playChord(chord.voicing, 'piano', 'block')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chord.rootPc, chord.quality.id, chord.inversion])

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 pt-5 sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-hot">{t('app.eyebrow')}</p>
        <LanguageSwitch />
      </div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">{t('app.title')}</h1>
          <p className="mt-2 max-w-xl text-ink-soft">{t('app.tagline')}</p>
        </div>
        <Segmented
          label={t('mode.label')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'explore', label: t('mode.explore') },
            { value: 'chords', label: t('mode.chords') },
            { value: 'quiz', label: t('mode.quiz') },
          ]}
        />
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-rule bg-card px-4 py-3">
        <Segmented
          label={t('settings.accidentals')}
          value={spelling}
          onChange={setSpelling}
          options={[
            { value: 'sharp', label: t('settings.sharps') },
            { value: 'flat', label: t('settings.flats') },
          ]}
        />
        <Switch on={labels} onChange={setLabels}>
          {t('settings.allNames')}
        </Switch>
        {mode === 'explore' && (
          <Switch on={allOctaves} onChange={setAllOctaves}>
            {t('settings.octaves')}
          </Switch>
        )}
        {mode === 'chords' && (
          <Switch on={chord.everywhere} onChange={chord.setEverywhere}>
            {t('settings.everywhere')}
          </Switch>
        )}
        <Switch on={sound} onChange={setSound}>
          {t('settings.sound')}
        </Switch>
      </div>

      {mode === 'chords' ? (
        <ChordsView c={chord} spelling={spelling} sound={sound} showNames={labels} />
      ) : (
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
                    {solfege(current, spelling, t)} · {frequency(current).toFixed(1)} Hz
                    {current === 60 && (
                      <span className="ml-2 rounded-full bg-hot-soft px-2 py-0.5 text-xs text-ink">
                        {t('note.middleC')}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <PillButton onClick={() => play(current, 'piano')}>{t('play.piano')}</PillButton>
                  <PillButton onClick={() => play(current, 'guitar')}>{t('play.guitar')}</PillButton>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                    {t('note.staffSounding')}
                  </dt>
                  <dd className="mt-0.5">{describeStaff(current, clef, spelling, t)}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                    {t('note.guitarSheet')}
                  </dt>
                  <dd className="mt-0.5">
                    {t('note.writtenHigher', { where: describeStaff(current + 12, 'treble', spelling, t) })}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">{t('note.onGuitar')}</dt>
                  <dd className="mt-1 flex flex-wrap gap-1.5">
                    {positions.length ? (
                      positions.map((p) => (
                        <span key={p.string} className="rounded-full border border-rule px-2.5 py-0.5 text-xs">
                          {t('note.position', { ord: t('ord', { n: p.number }), fret: fretLabel(p.fret) })}
                        </span>
                      ))
                    ) : (
                      <span className="text-ink-soft">
                        {current < 40 ? t('note.belowGuitar') : t('note.aboveGuitar')}
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
              <p className="mt-auto pt-5 text-xs text-ink-faint">{t('note.tip')}</p>
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
            <CardTitle hint={mode === 'explore' ? t('staff.hint') : undefined}>{t('staff.title')}</CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">{t('staff.pianoGrand')}</p>
                <Staff
                  title={t('staff.treble')}
                  clef="treble"
                  crop={[18, 132]}
                  notes={single(
                    staffMidi != null && clef === 'treble' ? staffMidi : null,
                    mode === 'quiz' && !q.answered ? 'var(--ink)' : undefined,
                  )}
                  onPick={(m) => press(m, 'piano')}
                  showNames={labels && reveal}
                  tips={reveal || prompt !== 'staff'}
                  pickRange={[PIANO_LOW, PIANO_HIGH]}
                />
                <Staff
                  title={t('staff.bass')}
                  clef="bass"
                  crop={[40, 150]}
                  notes={single(
                    staffMidi != null && clef === 'bass' ? staffMidi : null,
                    mode === 'quiz' && !q.answered ? 'var(--ink)' : undefined,
                  )}
                  onPick={(m) => press(m, 'piano')}
                  showNames={labels && reveal}
                  tips={reveal || prompt !== 'staff'}
                  pickRange={[PIANO_LOW, PIANO_HIGH]}
                />
                <p className="mt-1 text-xs text-ink-faint">
                  {t('staff.trebleNames', STAFF_LINE_NAMES.treble)}
                  <br />
                  {t('staff.bassNames', STAFF_LINE_NAMES.bass)}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium text-ink-soft">{t('staff.guitarWritten')}</p>
                <Staff
                  title={t('staff.guitar')}
                  clef="treble"
                  notes={single(reveal ? current + 12 : null)}
                  onPick={(m) => press(m - 12, 'guitar')}
                  showNames={labels && reveal}
                  tips={reveal || prompt !== 'staff'}
                  pickRange={[52, 91]}
                />
                <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t('staff.guitarExplain')}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <div className="mt-5">
        <SortableStack
          initial={['piano', 'guitar']}
          label={(id, dir) => t('drag.label', { name: t(id === 'piano' ? 'piano.title' : 'guitar.title'), dir })}
          render={(id, handle) =>
            id === 'piano' ? (
              <Card>
                <CardTitle hint={mode === 'chords' ? t('piano.hintChords') : t('piano.hint')}>
                  <Handle {...handle}>
                    <Grip />
                    {t('piano.title')}
                  </Handle>
                </CardTitle>
                <Piano
                  paint={paint}
                  spelling={spelling}
                  showLabels={labels}
                  focus={pianoFocus}
                  onPress={(m) => press(m, 'piano')}
                />
              </Card>
            ) : (
              <Card>
                <CardTitle hint={mode === 'chords' ? t('guitar.hintChords') : t('guitar.hint')}>
                  <Handle {...handle}>
                    <Grip />
                    {t('guitar.title')}
                  </Handle>
                </CardTitle>
                <Fretboard
                  paint={paint}
                  muted={mode === 'chords' ? chord.muted : undefined}
                  spelling={spelling}
                  showLabels={labels}
                  onPress={(m) => press(m, 'guitar')}
                />
              </Card>
            )
          }
        />
      </div>

      <footer className="mt-10 text-center text-xs text-ink-faint">
        <FormattedMessage
          id="footer.text"
          values={{
            samples: (
              <a
                className="underline decoration-rule underline-offset-2 hover:text-ink"
                href="https://github.com/nbrosowsky/tonejs-instruments"
              >
                tonejs-instruments
              </a>
            ),
            source: (
              <a
                className="underline decoration-rule underline-offset-2 hover:text-ink"
                href="https://github.com/spideyinf/spideyinf.github.io"
              >
                {t('footer.source')}
              </a>
            ),
          }}
        />
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
  const t = useT()
  const { prompt, quiz, spelling } = props
  const { q } = quiz
  const name = noteName(q.target, spelling, !props.anyOctave)
  const ask =
    prompt === 'staff' ? (
      t('quiz.askStaff')
    ) : prompt === 'name' ? (
      <FormattedMessage
        id="quiz.askName"
        values={{ note: <span className="font-display text-2xl font-semibold text-ink">{name}</span> }}
      />
    ) : (
      t('quiz.askEar')
    )

  return (
    <Card className="flex flex-col">
      <div className="flex flex-wrap items-center gap-3">
        <Segmented
          label={t('quiz.prompt')}
          value={prompt}
          onChange={props.setPrompt}
          options={[
            { value: 'staff', label: t('quiz.read') },
            { value: 'name', label: t('quiz.name') },
            { value: 'sound', label: t('quiz.ear') },
          ]}
        />
        <Segmented
          label={t('quiz.range')}
          value={props.level}
          onChange={props.setLevel}
          options={(Object.keys(LEVELS) as Level[]).map((l) => ({ value: l, label: LEVELS[l].label }))}
        />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5">
        <Switch on={!props.naturalsOnly} onChange={(v) => props.setNaturalsOnly(!v)}>
          {t('quiz.accidentals')}
        </Switch>
        <Switch on={props.anyOctave} onChange={props.setAnyOctave}>
          {t('quiz.anyOctave')}
        </Switch>
      </div>

      <div className="my-6 min-h-[88px]" aria-live="polite">
        <p className="text-lg text-ink-soft">{ask}</p>
        <p className="mt-1 text-sm text-ink-faint">{t('quiz.answerOn')}</p>
        {q.answered ? (
          <p className={`mt-3 font-medium ${q.solved ? 'text-good' : 'text-hot'}`}>
            {t(q.solved ? 'quiz.correct' : 'quiz.itIs', { note: noteName(q.target, spelling) })}{' '}
            <span className="font-normal text-ink-soft">
              —{' '}
              {guitarPositions(q.target)
                .map((p) =>
                  t('note.position', {
                    ord: t('ord', { n: p.number }),
                    fret: p.fret === 0 ? t('fret.open') : t('fret.n', { n: p.fret }),
                  }),
                )
                .join(', ')}
            </span>
          </p>
        ) : (
          q.wrong != null && (
            <p className="mt-3 font-medium text-bad">{t('quiz.wrong', { note: noteName(q.wrong, spelling) })}</p>
          )
        )}
      </div>

      <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
        <div className="flex gap-6">
          <Stat label={t('quiz.score')} value={`${q.score}/${q.total}`} />
          <Stat label={t('quiz.streak')} value={q.streak} />
          <Stat label={t('quiz.best')} value={q.best} />
        </div>
        <div className="flex flex-wrap gap-2">
          {prompt === 'sound' && <PillButton onClick={props.replay}>{t('quiz.replay')}</PillButton>}
          {!q.answered && <PillButton onClick={quiz.reveal}>{t('quiz.showMe')}</PillButton>}
          <PillButton $primary onClick={quiz.next}>
            {t('quiz.next')}
          </PillButton>
        </div>
      </div>
      {q.total > 0 && (
        <button className="mt-3 self-start text-xs text-ink-faint underline underline-offset-2" onClick={quiz.reset}>
          {t('quiz.reset')}
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
