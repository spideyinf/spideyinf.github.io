import { Screen, Voice } from '../components/b'
import { Avatar, Glyph, PageArt, Reactions, SampleNote } from '../components/feed'
import { IconButton, Icons } from '../components/ui'
import { SAMPLE_FEED, timeAgo, unlocked, usePreview } from '../lib/feed'
import { go, href } from '../lib/router'

/** Every page shared today, with reactions. Unlocked feature; shown here as a preview until payments and sharing open. */
export function FeedScreen() {
  const preview = usePreview()
  const posts = preview ? SAMPLE_FEED.all : []

  return (
    <Screen style={{ paddingLeft: 16, paddingRight: 16 }}>
      <header className="flex flex-col gap-1 px-1 pt-3">
        <div className="-ml-2">
          <IconButton label="Back to the top three" onClick={() => go(href.achievement)}>
            {Icons.back}
          </IconButton>
        </div>
        <h1 className="m-0 px-1 text-[30px] leading-[1.05] font-extrabold tracking-[-0.03em]">
          The <Voice>greatest</Voice> achievement
        </h1>
        <p className="m-0 mt-1 flex items-center gap-2 px-1 font-serif text-[18px] text-ink-soft italic">
          <span className="rounded-[9px] bg-vermilion px-2 py-0.5 font-sans text-[13px] font-bold text-paper not-italic">{unlocked ? 'Unlocked' : 'Preview'}</span>
          Every page, shared by hand.
        </p>
        <button
          type="button"
          disabled
          className="mt-2.5 flex min-h-[52px] items-center justify-center gap-2.5 rounded-[14px] border-2 border-dashed border-cobalt/40 bg-transparent text-[17px] font-bold text-cobalt"
        >
          Posting your page opens soon
        </button>
      </header>

      {preview && (
        <div className="mt-3">
          <SampleNote />
        </div>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {!posts.length && (
          <p className="m-0 rounded-[18px] bg-[rgb(120_98_60/0.07)] p-5 text-[16px] leading-relaxed text-ink-soft">
            The full feed opens with sharing. <a href={href.achievement} className="text-cobalt underline underline-offset-4">See a preview</a> from the top three.
          </p>
        )}
        {posts.map((p, i) => (
          <article key={p.id} aria-label={`Page by ${p.author.name}, ${p.handName}`} className="flex flex-col gap-2.5 rounded-[18px] bg-[rgb(120_98_60/0.07)] p-3.5">
            <div className="flex items-center gap-2.5">
              <Avatar post={p} size={40} />
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[17px] leading-tight font-bold">{p.author.name}</span>
                <span className="text-[15px] text-ink-soft">{timeAgo(p.at)}</span>
              </div>
              <span className="rounded-[10px] bg-[rgb(30_58_95/0.1)] px-2.5 py-0.5 text-[15px] text-cobalt">{p.handName}</span>
            </div>
            <div className="min-h-[196px] overflow-hidden rounded-[12px] px-[18px] pt-4 pb-5">
              <PageArt post={p} line={38} xh={9} tilt={(i % 2 ? 0.6 : -0.6)} />
            </div>
            {(p.tools.pen || p.tools.ink || p.tools.paper) && (
              <ul aria-label="Writing tools" className="m-0 flex list-none flex-wrap gap-1.5 p-0">
                {(['pen', 'ink', 'paper'] as const).map((k) =>
                  p.tools[k] ? (
                    <li key={k} className="flex items-center gap-1.5 rounded-[10px] bg-[rgb(120_98_60/0.1)] py-1 pr-2.5 pl-2 text-[15px]">
                      <Glyph d={k} size={16} />
                      <span>
                        <span className="sr-only">{k}: </span>
                        {p.tools[k]}
                      </span>
                    </li>
                  ) : null,
                )}
              </ul>
            )}
            <div className="flex items-center">
              <Reactions post={p} />
              <span title="Comments are coming soon" className="ml-auto text-[14px] text-[#6B655C]">
                Comments soon
              </span>
            </div>
          </article>
        ))}
      </div>
    </Screen>
  )
}
