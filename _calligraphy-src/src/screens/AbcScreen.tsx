import { useEffect, useRef, useState } from 'react'
import { DoneToggle, PageHeader, PaperSheet, ProgressRing, RoundButton, Segmented, Screen, TintButton, ruled } from '../components/b'
import { LetterTutorial, type Case } from '../components/LetterTutorial'
import { Hand, Icons, Toast } from '../components/ui'
import { LETTERS, letterInfo } from '../lib/letters'
import { photoToPage } from '../lib/photo'
import { go, href } from '../lib/router'
import { usePractice } from '../state/practice'

/**
 * ABC: watch the letter written stroke by stroke (the tracing player), then
 * write a line of it on real paper, mark it written or keep a photo.
 * Without a letter in the address, it opens on the first one not yet written today.
 */
export function AbcScreen({ letter }: { letter?: string }) {
  const { lettersToday, markWritten, savePage, script } = usePractice()
  const [kase, setKase] = useState<Case>('lower')
  const [toast, setToast] = useState<string | null>(null)
  const file = useRef<HTMLInputElement>(null)
  const [first] = useState(() => LETTERS.find((l) => !lettersToday.includes(l)) ?? 'A')
  const cur = letter ?? first
  const i = LETTERS.indexOf(cur)
  const info = letterInfo(cur)
  const show = (l: string) => (kase === 'upper' ? l : l.toLowerCase())
  const done = lettersToday.includes(cur)
  const prev = LETTERS[(i + 25) % 26]
  const next = LETTERS[(i + 1) % 26]
  const to = (l: string) => go(href.abc(l), true)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const onFile = async (f: File | undefined) => {
    if (!f) return
    try {
      savePage({ kind: 'abc', label: info.upper + info.lower, src: await photoToPage(f) }, { letter: cur })
      setToast('Photo kept in My pages')
    } catch {
      setToast('That photo could not be opened')
    }
  }

  return (
    <Screen>
      <PageHeader title="ABC" right={<ProgressRing value={lettersToday.length} max={26} label={`${lettersToday.length} of 26 letters written today`} />} />

      <div className="flex min-h-[44px] items-center justify-between gap-3">
        <a href={href.hands} className="flex min-h-[44px] items-center text-[18px] text-ink-soft underline decoration-ink-soft/40 underline-offset-4">
          {script.name}
        </a>
        <Segmented
          label="Letter case"
          value={kase}
          onChange={setKase}
          options={[
            { value: 'lower', label: 'abc' },
            { value: 'upper', label: 'ABC' },
          ]}
        />
      </div>

      {/* The tracing player, on its own sheet of paper. */}
      <div className="-mx-[14px] mt-2">
        <LetterTutorial key={`${script.id}:${cur}`} letter={cur} kase={kase} />
      </div>

      <div className="mt-1 flex items-center justify-between">
        <RoundButton type="button" onClick={() => to(prev)} aria-label={`Previous letter, ${show(prev)}`}>
          <Hand text={show(prev)} size={kase === 'upper' ? 9 : 12} />
        </RoundButton>
        <p className="m-0 text-center text-[15px] text-ink-soft">
          Letter {i + 1} of 26
        </p>
        <RoundButton type="button" onClick={() => to(next)} aria-label={`Next letter, ${show(next)}`}>
          <Hand text={show(next)} size={kase === 'upper' ? 9 : 12} />
        </RoundButton>
      </div>

      <p className="m-0 mt-5 font-serif text-[19px] leading-snug italic">
        Now write one line of{' '}
        <span className="text-cobalt not-italic">
          <Hand text={show(cur)} size={13} />
        </span>{' '}
        on paper.
      </p>

      {/* The model to copy: the letter in the hand's own font, on ruled paper. */}
      <PaperSheet className="-mx-2 mt-3 px-4 pt-1 pb-2" $tilt={-0.4} aria-label={`Model: ${show(cur)} and the word ${info.word}`} role="img">
        <div className="overflow-hidden whitespace-nowrap text-cobalt" style={{ ...ruled(54), lineHeight: '54px' }}>
          {[0.9, 0.7, 0.5, 0.35, 0.22].map((a, k) => (
            <span key={k} style={{ opacity: a, marginRight: '0.45em' }}>
              <Hand text={show(cur)} size={16} />
            </span>
          ))}
          <br />
          <span style={{ opacity: 0.85 }}>
            <Hand text={info.word} size={16} />
          </span>
        </div>
      </PaperSheet>

      <div className="mt-4 flex gap-2">
        <DoneToggle done={done} onClick={() => markWritten({ letter: cur })} todo="I wrote a line" doneText="Written on paper" />
        <TintButton label="Keep a photo of your page" onClick={() => file.current?.click()}>
          {Icons.camera}
        </TintButton>
        <input ref={file} type="file" accept="image/*" capture="environment" hidden onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      <div role="group" aria-label="Alphabet" className="mt-5 grid grid-cols-7 gap-0.5">
        {LETTERS.map((l) => {
          const on = l === cur
          const written = lettersToday.includes(l)
          return (
            <button
              key={l}
              type="button"
              onClick={() => to(l)}
              aria-label={`Letter ${show(l)}${written ? ', written today' : ''}`}
              aria-current={on ? 'true' : undefined}
              className="press relative flex min-h-[46px] items-center justify-center rounded-[10px] border-0 p-0"
              style={{ background: on ? '#1E3A5F' : 'transparent', color: on ? '#FBF6EA' : written ? '#1C2433' : '#6B655C' }}
            >
              <Hand text={show(l)} size={kase === 'upper' ? 8.5 : 11} />
              {written && !on && (
                <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden className="absolute top-1 right-1">
                  <path d="M2.5 6.2 L5 8.6 L9.6 3.4" fill="none" stroke="#92400E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )
        })}
      </div>

      <Toast $show={!!toast} role="status" style={{ bottom: 'calc(104px + env(safe-area-inset-bottom))' }}>
        {toast}
      </Toast>
    </Screen>
  )
}
