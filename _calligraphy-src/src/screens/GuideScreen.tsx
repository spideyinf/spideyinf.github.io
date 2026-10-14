import { IconButton, Icons, TopBar } from '../components/ui'
import { InkArt } from '../components/InkArt'
import { INKS, PENS, type GuideEntry } from '../lib/fieldGuide'
import { go, href } from '../lib/router'

function Entry({ e, flip }: { e: GuideEntry; flip: boolean }) {
  return (
    <li className="relative list-none overflow-hidden px-[14px] py-5">
      <InkArt
        kind={e.art}
        className={`pointer-events-none absolute top-1/2 h-[150px] w-[150px] -translate-y-1/2 text-ink opacity-[0.13] ${
          flip ? '-left-6 -scale-x-100' : '-right-6'
        }`}
      />
      <div className={`relative ${flip ? 'pl-[18%]' : 'pr-[18%]'}`}>
        <div className="font-sans text-[11.5px] tracking-[0.08em] text-ink-soft uppercase">{e.maker}</div>
        <div className="mt-0.5 flex items-center gap-2 text-[20px] leading-tight">
          {e.swatch && (
            <span
              aria-hidden
              className="inked inline-block h-[13px] w-[15px] flex-none rounded-[50%_45%_55%_48%] opacity-85"
              style={{ background: e.swatch }}
            />
          )}
          {e.name}
        </div>
        <div className="mt-0.5 font-sans text-[12px] text-ink-soft italic">{e.origin}</div>
        <p className="m-0 mt-1.5 font-sans text-[13.5px] leading-snug text-ink">{e.note}</p>
      </div>
    </li>
  )
}

/** A short field guide to pens and inks many writers love. */
export function GuideScreen() {
  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back" onClick={() => (history.length > 1 ? history.back() : go(href.home))}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Pens &amp; inks</div>
          <div className="font-sans text-[12.5px] text-ink-soft">A small field guide</div>
        </div>
      </TopBar>

      <p className="m-0 px-[14px] pt-3 font-sans text-[13.5px] leading-relaxed text-ink-soft">
        Any pen that feels good in your hand is the right one. These are a few that writers have loved for years, if you
        are curious where to look next.
      </p>

      <section aria-label="Pens" className="pt-5">
        <h2 className="m-0 px-[14px] font-caps text-[34px] leading-none font-normal">Pens</h2>
        <ul className="m-0 p-0">
          {PENS.map((e, i) => (
            <Entry key={e.id} e={e} flip={i % 2 === 1} />
          ))}
        </ul>
      </section>

      <section aria-label="Inks" className="pt-6">
        <h2 className="m-0 px-[14px] font-caps text-[34px] leading-none font-normal">Inks</h2>
        <ul className="m-0 p-0">
          {INKS.map((e, i) => (
            <Entry key={e.id} e={e} flip={i % 2 === 1} />
          ))}
        </ul>
      </section>

      <p className="m-0 px-6 pt-8 text-center font-sans text-[11px] leading-relaxed text-ink-soft opacity-80">
        Names belong to their makers. Writing to Learn is not affiliated with any of them, and the drawings are of
        pen parts and bottles in general, not of these products.
      </p>
    </main>
  )
}
