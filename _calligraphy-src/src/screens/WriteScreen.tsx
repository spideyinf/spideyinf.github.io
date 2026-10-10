import { useCallback, useState } from 'react'
import { PracticeShell } from '../components/PracticeShell'
import type { Metrics } from '../lib/hand'
import { href } from '../lib/router'
import { paginateText, stackRows } from '../lib/sheet'
import { usePractice } from '../state/practice'

export function WriteScreen({ quoteId }: { quoteId: string }) {
  const { quotes, savePage } = usePractice()
  const quote = quotes.find((q) => q.id === quoteId)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)

  const text = quote ? quote.text : ''
  const author = quote?.author ?? ''

  const build = useCallback(
    (ctx: CanvasRenderingContext2D, m: Metrics, w: number, h: number) => {
      const xh = Math.min(w / 21, 26)
      const body = author ? `${text}\n${author}` : text
      const pages = paginateText(ctx, m, body, xh, w, h, 0.3)
      if (pages.length !== pageCount) queueMicrotask(() => setPageCount(pages.length))
      const current = pages[Math.min(page, pages.length - 1)]
      return stackRows(current, w, h, xh)
    },
    [text, author, page, pageCount],
  )

  if (!quote) {
    return (
      <main className="grid h-dvh place-items-center p-8 text-center">
        <div>
          <p className="text-[20px]">This quote isn't on this device any more.</p>
          <a className="text-cobalt underline underline-offset-4" href={href.quotes}>
            Choose another quote
          </a>
        </div>
      </main>
    )
  }

  return (
    <PracticeShell
      pageKey={`quote:${quote.id}:${page}`}
      title={quote.author || 'Your quote'}
      subtitle={pageCount > 1 ? `Page ${page + 1} of ${pageCount}` : 'Trace it, then write it from memory'}
      segments={Array.from({ length: pageCount }, (_, i) => (i === page ? 'current' : i < page ? 'done' : 'empty'))}
      segmentsLabel={`Page ${page + 1} of ${pageCount}`}
      build={build}
      backTo={href.quotes}
      prevLabel="Previous page"
      nextLabel="Next page"
      onPrev={page > 0 ? () => setPage(page - 1) : undefined}
      onNext={page < pageCount - 1 ? () => setPage(page + 1) : undefined}
      onSave={(src) =>
        savePage({ kind: 'paragraph', label: quote.author || 'Quote', src }, { quoteId: quote.id })
      }
      savedLabel="Saved to today's pages"
    />
  )
}
