import styled from 'styled-components'
import type { ChordState } from '../hooks/useChord'
import { ROLE_COLOR } from '../hooks/useChord'
import { playChord } from '../lib/audio'
import { guitarRules, intervalLabel, pianoRules, staffRules } from '../lib/chordRules'
import { INVERSIONS, QUALITIES, shapeString } from '../lib/chords'
import { GUITAR_STRINGS, noteName, type Spelling } from '../lib/music'
import type { StaffNote } from '../lib/types'
import { ChordChart } from './ChordChart'
import { Staff } from './Staff'
import { Card, CardTitle, PillButton, Segmented } from './ui'

const Choice = styled.button<{ $on: boolean }>`
  border-radius: 10px;
  border: 1px solid ${(p) => (p.$on ? 'var(--ink)' : 'var(--rule)')};
  background: ${(p) => (p.$on ? 'var(--ink)' : 'var(--card)')};
  color: ${(p) => (p.$on ? 'var(--card)' : 'var(--ink)')};
  padding: 6px 4px;
  font-size: 13px;
  font-weight: 500;
  transition: border-color 0.15s;
  &:hover {
    border-color: var(--ink-soft);
  }
  small {
    display: block;
    font-size: 10px;
    font-weight: 400;
    opacity: 0.7;
  }
`

const Step = styled.button<{ $on: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 92px;
  text-align: left;
  border-radius: 12px;
  padding: 8px 10px;
  border: 1.5px solid ${(p) => (p.$on ? p.$color : 'var(--rule)')};
  background: ${(p) => (p.$on ? `color-mix(in srgb, ${p.$color} 16%, var(--card))` : 'var(--card)')};
  opacity: ${(p) => (p.$on ? 1 : 0.55)};
  transition: all 0.15s;
  .n {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--ink-faint);
  }
  .t {
    font-weight: 600;
  }
  .i {
    font-size: 11px;
    color: var(--ink-soft);
  }
`

const Dot = ({ color, children }: { color: string; children: React.ReactNode }) => (
  <span
    className="inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold"
    style={{ background: color, color: '#1f1b16' }}
  >
    {children}
  </span>
)

type Props = { c: ChordState; spelling: Spelling; sound: boolean }

export function ChordsView({ c, spelling, sound }: Props) {
  const say = (midis: number[], voice: 'piano' | 'guitar', style: 'block' | 'arpeggio' | 'strum') =>
    sound && playChord(midis, voice, style)

  const piano = c.staffNotes(c.voicing)
  const treble = c.staffNotes(c.voicing.filter((m) => m >= 60))
  const bass = c.staffNotes(c.voicing.filter((m) => m < 60))
  const guitarStaff: StaffNote[] = c.staffNotes(c.guitarMidis, 12)
  const rules = [
    pianoRules(c.tones, c.quality, c.inversion),
    staffRules(c.tones, c.quality, c.inversion, piano),
    guitarRules(c.tones, c.inversion, c.shape, c.guitarMidis),
  ]

  return (
    <>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Card>
          <CardTitle>Pick a chord</CardTitle>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-ink-faint">Root</p>
          <div className="grid grid-cols-6 gap-1.5">
            {Array.from({ length: 12 }, (_, pc) => (
              <Choice key={pc} $on={c.rootPc === pc} onClick={() => c.setRootPc(pc)}>
                {noteName(pc, spelling, false)}
              </Choice>
            ))}
          </div>
          <p className="mb-1.5 mt-4 text-xs font-medium uppercase tracking-wider text-ink-faint">Type</p>
          <div className="grid grid-cols-3 gap-1.5">
            {QUALITIES.map((q) => (
              <Choice key={q.id} $on={c.quality.id === q.id} onClick={() => c.setQuality(q.id)}>
                {c.tones[0].name}
                {q.suffix}
                <small>{q.name}</small>
              </Choice>
            ))}
          </div>
          <p className="mb-1.5 mt-4 text-xs font-medium uppercase tracking-wider text-ink-faint">
            Which note is lowest
          </p>
          <Segmented
            label="Inversion"
            value={String(c.inversion)}
            onChange={(v) => c.setInversion(Number(v))}
            options={c.quality.tones.map((_, i) => ({
              value: String(i),
              label: i === 0 ? 'Root' : `${ordinal(i)} inv`,
            }))}
          />
        </Card>

        <Card className="flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="font-display text-6xl font-semibold leading-none">{c.symbol}</div>
              <p className="mt-2 text-sm text-ink-soft">
                {c.tones[0].name} {c.quality.name.toLowerCase()}
                {c.inversion > 0 && ` · ${INVERSIONS[c.inversion].toLowerCase()}`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <PillButton onClick={() => say(c.voicingShown, 'piano', 'block')}>▶ Piano</PillButton>
              <PillButton onClick={() => say(c.voicingShown, 'piano', 'arpeggio')}>▶ One by one</PillButton>
              <PillButton onClick={() => say(c.guitarShown, 'guitar', 'strum')} disabled={!c.shape}>
                ▶ Strum
              </PillButton>
            </div>
          </div>

          <p className="mt-4 text-[15px] leading-relaxed">{c.quality.sound}</p>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="font-medium text-ink">Rule:</span> {c.quality.rule}
          </p>

          <SemitoneStrip c={c} />

          <p className="mb-2 mt-5 text-xs font-medium uppercase tracking-wider text-ink-faint">
            Build it step by step — tap to add each note
          </p>
          <div className="flex flex-wrap gap-2">
            {c.tones.map((t, i) => {
              const prev = i > 0 ? c.tones[i - 1] : null
              return (
                <Step
                  key={t.degree}
                  $on={i < c.shown}
                  $color={ROLE_COLOR[t.role]}
                  onClick={() => {
                    c.setBuild(i + 1)
                    const added = c.voicing.filter((m) => m % 12 === t.pc)
                    say(added, 'piano', 'block')
                  }}
                >
                  <span className="n">Step {i + 1}</span>
                  <span className="t">
                    {i === 0 ? 'Root' : `+ ${t.degree === '2' || t.degree === '4' ? t.degree + 'th' : t.degree}`} ·{' '}
                    {t.name}
                  </span>
                  <span className="i">
                    {prev ? `${t.semis - prev.semis} up · ${intervalLabel(t.semis)} from root` : 'the chord’s name'}
                  </span>
                </Step>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <Card>
          <CardTitle hint="Colors match on every instrument">Staff</CardTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-ink-soft">Piano — grand staff</p>
              <Staff title="Treble staff" clef="treble" crop={[18, 132]} notes={treble} />
              <Staff title="Bass staff" clef="bass" crop={[40, 150]} notes={bass} />
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-ink-soft">Guitar — this shape, written one octave up</p>
              <Staff title="Guitar staff" clef="treble" notes={guitarStaff} />
            </div>
          </div>
          <Legend c={c} />
        </Card>

        <Card>
          <CardTitle hint={c.shape ? shapeString(c.shape) : undefined}>Guitar shape</CardTitle>
          {c.shape ? (
            <>
              <ChordChart
                shape={c.shape}
                dot={(s) => {
                  const f = c.shape!.frets[s]
                  if (f === null) return null
                  const midi = GUITAR_STRINGS[s].midi + f
                  const tone = c.toneOf(midi)
                  return tone ? { fill: ROLE_COLOR[tone.role], label: tone.degree, name: tone.name } : null
                }}
              />
              {c.shapes.length > 1 && (
                <div className="mt-3 flex justify-center">
                  <Segmented
                    label="Shape"
                    value={String(c.shapeIdx)}
                    onChange={(v) => c.setShapeIdx(Number(v))}
                    options={c.shapes.map((s, i) => ({
                      value: String(i),
                      label: s.frets.includes(0)
                        ? 'Open'
                        : `Fret ${Math.min(...s.frets.filter((f): f is number => !!f))}`,
                    }))}
                  />
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-ink-soft">No common shape for this voicing — use the fretboard below.</p>
          )}
        </Card>
      </div>

      <Card className="mt-5">
        <CardTitle hint="Updates for the chord you picked">How to find {c.symbol} on each instrument</CardTitle>
        <div className="grid gap-6 md:grid-cols-3">
          {rules.map((r) => (
            <div key={r.title}>
              <h3 className="mb-2 font-display text-base font-semibold">{r.title}</h3>
              <ul className="space-y-2 text-sm leading-relaxed text-ink-soft">
                {r.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-[var(--role-r)]" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Card>
    </>
  )
}

const ordinal = (n: number) => ['', '1st', '2nd', '3rd'][n]

function Legend({ c }: { c: ChordState }) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-ink-soft">
      {c.visible.map((t) => (
        <span key={t.degree} className="inline-flex items-center gap-1.5">
          <Dot color={ROLE_COLOR[t.role]}>{t.degree}</Dot>
          {t.name}
        </span>
      ))}
    </div>
  )
}

/** One octave of half-steps, with the chord's notes marked — the chord as a pattern of distances */
function SemitoneStrip({ c }: { c: ChordState }) {
  const cells = Array.from({ length: 12 }, (_, i) => i)
  return (
    <div className="mt-4">
      <div className="grid grid-cols-12 gap-[3px]">
        {cells.map((i) => {
          const t = c.tones.find((x) => x.semis === i)
          const on = t && c.visible.includes(t)
          return (
            <div
              key={i}
              className="flex h-9 items-center justify-center rounded-md text-[11px] font-bold"
              style={{
                background: on ? ROLE_COLOR[t.role] : t ? 'var(--rule)' : 'var(--paper)',
                color: on ? '#1f1b16' : 'var(--ink-faint)',
                border: '1px solid var(--rule)',
              }}
              title={t ? `${t.degree}: ${t.name}` : undefined}
            >
              {t ? t.degree : ''}
            </div>
          )
        })}
      </div>
      <div className="mt-1 grid grid-cols-12 gap-[3px] text-center text-[10px] text-ink-faint">
        {cells.map((i) => (
          <span key={i}>{i}</span>
        ))}
      </div>
      <p className="mt-1 text-xs text-ink-faint">
        Half-steps above the root — the same pattern works from any starting note.
      </p>
    </div>
  )
}
