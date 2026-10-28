import { useEffect, useState } from 'react'
import { PrimaryButton, Screen, Voice } from '../components/b'
import { Avatar, Glyph, PageArt, SampleNote } from '../components/feed'
import { fetchFeed, SAMPLE_FEED, setPreview, sharingOpen, usePreview, type Feed, type Post } from '../lib/feed'
import { href } from '../lib/router'

function Loves({ post, size = 15 }: { post: Post; size?: number }) {
  return (
    <span className="flex items-center gap-1 font-semibold" style={{ fontSize: size }}>
      <Glyph d="love" size={size + 2} fill="#92400E" stroke="#92400E" />
      <span className="sr-only">loves: </span>
      {post.counts.love}
    </span>
  )
}

function Rank({ n, big }: { n: number; big?: boolean }) {
  return (
    <span
      className="absolute font-extrabold text-paper"
      style={{ top: big ? 12 : 8, right: big ? 12 : 8, padding: big ? '3px 10px' : '2px 8px', borderRadius: big ? 10 : 8, background: n === 1 ? '#92400E' : '#1C2433', fontSize: big ? 14 : 13 }}
    >
      #{n}
    </span>
  )
}

/** The greatest achievement: today's most loved handwritten pages. */
export function AchievementScreen() {
  const preview = usePreview()
  const [feed, setFeed] = useState<Feed | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let on = true
    fetchFeed()
      .then((f) => on && setFeed(f))
      .catch(() => on && setFailed(true))
    return () => {
      on = false
    }
  }, [])

  const shown = preview ? SAMPLE_FEED : feed
  const [first, ...rest] = shown?.top ?? []

  return (
    <Screen style={{ paddingLeft: 16, paddingRight: 16 }}>
      <header className="flex flex-col gap-1 px-2 pt-5">
        <h1 className="m-0 text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em]">
          The <Voice>greatest</Voice> achievement
        </h1>
        <p className="m-0 mt-0.5 font-serif text-[18px] text-ink-soft italic">The most loved pages written today.</p>
      </header>

      {preview && (
        <div className="mt-3 px-1">
          <SampleNote />
        </div>
      )}

      <section aria-labelledby="top-h" className="mt-4 flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between px-2">
          <h2 id="top-h" className="m-0 text-[19px] font-extrabold tracking-[-0.02em]">
            Top 3 today
          </h2>
          <span className="rounded-[10px] bg-[rgb(120_98_60/0.12)] px-2.5 py-0.5 text-[14px] font-semibold text-ink-soft">Free</span>
        </div>

        {first ? (
          <>
            <article aria-label={`Number 1: page by ${first.author.name}, ${first.handName}`} className="overflow-hidden rounded-[18px] bg-[rgb(120_98_60/0.07)]">
              <div className="h-[200px] px-[18px] pt-3.5 pb-4">
                <PageArt post={first} line={40} xh={10} tilt={-0.8}>
                  <Rank n={1} big />
                </PageArt>
              </div>
              <div className="flex items-center gap-2.5 px-3.5 py-3">
                <Avatar post={first} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-[16px] font-bold">{first.author.name}</span>
                  <span className="truncate text-[14px] text-ink-soft">
                    {first.handName}
                    {first.tools.pen ? ` · ${first.tools.pen}` : ''}
                  </span>
                </span>
                <Loves post={first} />
              </div>
            </article>
            <div className="grid grid-cols-2 gap-2.5">
              {rest.map((p, i) => (
                <article key={p.id} aria-label={`Number ${i + 2}: page by ${p.author.name}, ${p.handName}`} className="overflow-hidden rounded-[16px] bg-[rgb(120_98_60/0.07)]">
                  <div className="h-[136px] px-3 pt-3 pb-3.5">
                    <PageArt post={p} line={34} xh={6.2} tilt={1}>
                      <Rank n={i + 2} />
                    </PageArt>
                  </div>
                  <div className="flex items-center justify-between gap-1.5 px-3 py-2.5">
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[15px] font-bold">{p.author.name}</span>
                      <span className="text-[13px] text-ink-soft">{p.handName}</span>
                    </span>
                    <Loves post={p} size={14} />
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-[18px] bg-[rgb(120_98_60/0.07)] p-5">
            <p className="m-0 text-[19px] leading-snug">
              {failed ? 'Today’s pages couldn’t be loaded.' : sharingOpen ? 'No pages yet today. Be the first.' : 'Sharing opens soon.'}
            </p>
            <p className="m-0 text-[15px] leading-relaxed text-ink-soft">
              Every day, people write a page by hand, photograph it and share it here. The three most loved pages of the day stand at the top, free for
              everyone to see.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <PrimaryButton type="button" onClick={() => setPreview(true)} style={{ minHeight: 46, fontSize: 16 }}>
                See a preview
              </PrimaryButton>
              <a href={href.pages} className="text-[16px] text-cobalt underline underline-offset-4">
                Your own pages
              </a>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="all-h" className="mt-[22px] flex flex-col gap-2.5">
        <div className="flex items-baseline justify-between px-2">
          <h2 id="all-h" className="m-0 text-[19px] font-extrabold tracking-[-0.02em]">
            Everyone’s pages
          </h2>
          <span className="flex items-center gap-1 text-[14px] font-semibold text-vermilion">
            <Glyph d="lock" size={15} />
            Locked
          </span>
        </div>
        <div className="relative">
          <div aria-hidden className="grid grid-cols-3 gap-1 overflow-hidden rounded-[16px]">
            {Array.from({ length: 9 }, (_, i) => {
              const p = SAMPLE_FEED.all[i % SAMPLE_FEED.all.length]
              return (
                <div key={i} className="aspect-square bg-[#F2EADA] opacity-85" style={{ filter: 'blur(5px)' }}>
                  <PageArt post={p} line={22} xh={4.5} tilt={((i % 3) - 1) * 1.5} />
                </div>
              )
            })}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-end gap-2.5 rounded-[16px] bg-[linear-gradient(to_bottom,rgb(251_246_234/0.1),rgb(251_246_234/0.78)_45%,rgb(251_246_234/0.96))] p-5 text-center">
            <p className="m-0 text-[20px] leading-tight font-extrabold tracking-[-0.02em]">See every page, share your own</p>
            <p className="m-0 max-w-[290px] text-[15px] leading-snug text-ink-soft">Free shows the top three. Unlock the full feed, post a page every day and react to others.</p>
            <a href={href.unlock} className="press flex min-h-[48px] items-center rounded-[14px] bg-vermilion px-5 text-[17px] font-bold text-paper no-underline">
              Unlock the full feed
            </a>
            {preview && (
              <a href={href.feed} className="text-[15px] text-cobalt underline underline-offset-4">
                Preview the full feed
              </a>
            )}
          </div>
        </div>
      </section>

      {preview && (
        <button type="button" onClick={() => setPreview(false)} className="mx-auto mt-5 min-h-[44px] border-0 bg-transparent px-3 text-[15px] text-ink-soft underline underline-offset-4">
          Leave the preview
        </button>
      )}
    </Screen>
  )
}
