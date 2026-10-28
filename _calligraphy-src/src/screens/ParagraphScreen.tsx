import { useEffect, useState } from 'react'
import { DoneToggle, PageHeader, PaperSheet, RoundButton, Segmented, Screen, TintButton, ruled } from '../components/b'
import { Hand, Icons, Toast } from '../components/ui'
import { go, href } from '../lib/router'
import { usePractice } from '../state/practice'

type Mode = 'quotes' | 'own'
const LINE = 54

/** Paragraph: a quote, or your own words, in the hand you're learning, to copy onto paper. */
export function ParagraphScreen({ quoteId }: { quoteId?: string }) {
  const { quotes, today, markWritten, addQuote, deleteQuote, script } = usePractice()
  const [mode, setMode] = useState<Mode>('quotes')
  const [own, setOwn] = useState('')
  const [toast, setToast] = useState<string | null>(null)
  // Default: today's quote, the same for everyone on a given day.
  const [daily] = useState(() => {
    const d = new Date()
    const n = Math.floor((d.getTime() - d.getTimezoneOffset() * 60000) / 864e5)
    return quotes.filter((q) => !q.custom)[n % quotes.filter((q) => !q.custom).length]?.id
  })
  const idx = Math.max(0, quotes.findIndex((q) => q.id === (quoteId ?? daily)))
  const q = quotes[idx]
  const isOwn = mode === 'own'
  const text = isOwn ? own.trim() : q.text
  const done = !isOwn && today.quotes.includes(q.id)

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2000)
    return () => clearTimeout(t)
  }, [toast])

  const step = (d: number) => go(href.write(quotes[(idx + d + quotes.length) % quotes.length].id), true)

  /** Your own words become a quote of yours, so they're kept and can be marked. */
  const ownQuote = () => {
    const t = own.trim()
    if (!t) return null
    const nq = addQuote(t, '')
    setOwn('')
    setMode('quotes')
    go(href.write(nq.id), true)
    return nq
  }

  const written = () => {
    if (isOwn) {
      const nq = ownQuote()
      if (nq) {
        markWritten({ quoteId: nq.id })
        setToast('Marked as written today')
      }
      return
    }
    markWritten({ quoteId: q.id })
  }

  /** Photograph the page: own words become a line of yours first, so the photo belongs to it. */
  const photograph = () => {
    const target = isOwn ? ownQuote() : q
    if (target) go(href.capture('paragraph', target.id))
  }

  return (
    <Screen>
      <PageHeader
        title="Paragraph"
        right={
          <a href={href.hands} className="flex min-h-[44px] items-center text-[18px] text-ink-soft underline decoration-ink-soft/40 underline-offset-4">
            {script.name}
          </a>
        }
      />

      <div className="mt-1">
        <Segmented
          grow
          label="What to copy"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'quotes', label: 'Famous quotes' },
            { value: 'own', label: 'Your own words' },
          ]}
        />
      </div>

      {isOwn && (
        <div className="mt-4 flex flex-col gap-1">
          <label htmlFor="own-line" className="text-[17px]">
            Your line
          </label>
          <textarea
            id="own-line"
            value={own}
            onChange={(e) => setOwn(e.target.value)}
            rows={2}
            maxLength={400}
            placeholder="e.g. A little every day"
            className="min-h-[48px] resize-none rounded-[12px] border-0 bg-tint px-3.5 py-3 text-[19px] text-ink placeholder:text-[#7A746A]"
          />
          <p className="m-0 text-[15px] text-ink-soft">It appears below in {script.name}.</p>
        </div>
      )}

      {/* The page to copy from: real paper, ruled, the words in the hand's font. */}
      <PaperSheet className="-mx-3 mt-4 px-5 pt-1.5 pb-1" $tilt={0.3}>
        <figure className="m-0 flex flex-col" style={{ ...ruled(LINE), minHeight: LINE * 4 }}>
          <blockquote lang={q.id.startsWith('vn') && !isOwn ? 'vi' : undefined} className="m-0 text-cobalt" style={{ lineHeight: `${LINE}px`, whiteSpace: 'pre-line' }}>
            {text ? <Hand text={text} size={11.5} lineHeight={`${LINE}px`} /> : <span className="font-serif text-[19px] text-ink-soft italic">Your words appear here.</span>}
          </blockquote>
          {!isOwn && q.author && (
            <figcaption className="mt-auto text-right font-serif text-[19px] text-ink-soft italic" style={{ lineHeight: `${LINE}px` }}>
              — {q.author}
            </figcaption>
          )}
        </figure>
      </PaperSheet>

      {!isOwn && (
        <div className="mt-2 flex items-center justify-center gap-6">
          <RoundButton $size={48} type="button" onClick={() => step(-1)} aria-label="Previous quote">
            {Icons.prev}
          </RoundButton>
          <p aria-live="polite" className="m-0 min-w-[64px] text-center text-[18px] text-ink-soft">
            {idx + 1} of {quotes.length}
          </p>
          <RoundButton $size={48} type="button" onClick={() => step(1)} aria-label="Next quote">
            {Icons.next}
          </RoundButton>
        </div>
      )}
      {!isOwn && q.custom && (
        <button
          type="button"
          className="mx-auto mt-1 min-h-[44px] border-0 bg-transparent px-3 text-[15px] text-ink-soft underline underline-offset-4"
          onClick={() => {
            deleteQuote(q.id)
            go(href.quotes, true)
          }}
        >
          Remove this line of yours
        </button>
      )}

      <p className="m-0 mt-4 font-serif text-[19px] leading-snug text-ink-soft italic">Copy it once, slowly, on your own paper.</p>
      <div className="mt-2 flex gap-2">
        <DoneToggle done={done} onClick={written} todo="I’ve written it" doneText="Written on paper" />
        <TintButton label="Photograph your page" onClick={photograph} disabled={isOwn && !own.trim()}>
          {Icons.camera}
        </TintButton>
      </div>

      <Toast $show={!!toast} role="status" style={{ bottom: 'calc(104px + env(safe-area-inset-bottom))' }}>
        {toast}
      </Toast>
    </Screen>
  )
}
