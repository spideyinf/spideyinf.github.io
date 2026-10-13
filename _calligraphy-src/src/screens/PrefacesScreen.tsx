import { useCallback, useState } from 'react'
import styled from 'styled-components'
import { PrefaceWriter } from '../components/PrefaceWriter'
import { Hand, IconButton, Icons, SaveButton, TopBar } from '../components/ui'
import { PREFACE_FONT, PREFACES, prefaceById } from '../lib/prefaces'
import { go, href } from '../lib/router'
import fibers from '../assets/paper/lightpaperfibers.png'

const Letter = styled.a<{ $tilt: number }>`
  position: relative;
  display: block;
  margin: 0 14px;
  padding: 16px 18px 18px;
  color: ${({ theme }) => theme.color.ink};
  text-decoration: none;
  transform: rotate(${({ $tilt }) => $tilt}deg);
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background-color: ${({ theme }) => theme.color.note};
    background-image: url(${fibers});
    background-size: 500px 300px;
    background-blend-mode: multiply;
    filter: url('#deckle') drop-shadow(0 1px 1px rgb(70 50 25 / 0.2)) drop-shadow(0 5px 10px rgb(70 50 25 / 0.1));
  }
`

/** All the prefaces, as a little stack of letters. */
export function PrefacesScreen() {
  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back to home" onClick={() => go(href.home)}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Prefaces</div>
          <div className="font-sans text-[12.5px] text-ink-soft">Short letters on pens, ink, paper and practice</div>
        </div>
      </TopBar>
      <div className="flex flex-col gap-5 pt-4" style={{ isolation: 'isolate' }}>
        {PREFACES.map((p, i) => (
          <Letter key={p.id} href={href.preface(p.id)} $tilt={i % 2 ? 0.5 : -0.6}>
            <div className="inked">
              <Hand text={p.title} size={11} font={PREFACE_FONT} />
            </div>
            <p className="m-0 mt-1 line-clamp-2 font-sans text-[13px] leading-snug text-ink-soft">
              {p.body.find((b) => !b.endsWith(','))}
            </p>
          </Letter>
        ))}
      </div>
    </main>
  )
}

/** One preface, written out live. Then: copy it out by hand, or read the next. */
export function PrefaceScreen({ id }: { id: string }) {
  const preface = prefaceById(id) ?? PREFACES[0]
  const i = PREFACES.indexOf(preface)
  const next = PREFACES[(i + 1) % PREFACES.length]
  const [finished, setFinished] = useState(false)
  const onDone = useCallback(() => setFinished(true), [])

  return (
    <main className="min-h-dvh pb-14" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="All prefaces" onClick={() => go(href.prefaces)}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">A preface</div>
          <div className="font-sans text-[12.5px] text-ink-soft">
            {finished ? `${i + 1} of ${PREFACES.length}` : 'Tap the page to finish writing'}
          </div>
        </div>
      </TopBar>

      <div className="pt-4">
        <PrefaceWriter key={preface.id} preface={preface} onDone={onDone} />
      </div>

      <div
        className="flex flex-wrap items-center gap-3 px-[14px] pt-6 transition-opacity duration-500"
        style={{ opacity: finished ? 1 : 0, pointerEvents: finished ? 'auto' : 'none' }}
      >
        <SaveButton type="button" onClick={() => go(href.write(`preface-${preface.id}`))}>
          Copy it out by hand
        </SaveButton>
        <a className="font-sans text-[14px] text-cobalt underline underline-offset-2" href={href.preface(next.id)}>
          Next: {next.title}
        </a>
      </div>
    </main>
  )
}
