import styled from 'styled-components'
import { Hand, IconButton, Icons, TopBar } from '../components/ui'
import { nibOf } from '../lib/pen'
import { go, href } from '../lib/router'
import { SCRIPTS, type Script } from '../lib/scripts'
import { usePractice } from '../state/practice'

const GROUPS: { id: Script['family']; title: string; note: string }[] = [
  { id: 'modern', title: 'Modern hands', note: 'Simple everyday handwriting, the best place to start.' },
  { id: 'school', title: 'School hands', note: 'Model hands taught to children, written with a fountain pen.' },
  { id: 'formal', title: 'Formal scripts', note: 'Older, slower and more ornamental.' },
  { id: 'yours', title: 'Your hands', note: 'Recorded in your own handwriting.' },
]

// One hand as a specimen: its name, a line written in it, and what it's like.
const Specimen = styled.div<{ $on: boolean }>`
  position: relative;
  padding: 14px 14px 16px;
  background: ${({ $on, theme }) => ($on ? theme.color.tint : 'transparent')};
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 16px;
    width: 3px;
    background: ${({ $on, theme }) => ($on ? theme.color.vermilion : 'transparent')};
  }
  button.pick {
    display: block;
    width: 100%;
    padding: 0;
    border: 0;
    background: none;
    text-align: left;
    color: inherit;
  }
`

export function HandsScreen() {
  const { script, setScript } = usePractice()

  return (
    <main className="min-h-dvh pb-12" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back" onClick={() => history.length > 1 ? history.back() : go(href.home)}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Choose a hand</div>
          <div className="font-sans text-[12.5px] text-ink-soft">The letters, tutorials and pages follow it</div>
        </div>
      </TopBar>

      {GROUPS.map((g) => {
        const hands = SCRIPTS.filter((s) => s.family === g.id)
        if (!hands.length) return null
        return (
          <section key={g.id} aria-label={g.title} className="pt-5">
            <h2 className="m-0 px-[14px] text-[19px] font-normal">{g.title}</h2>
            <p className="m-0 px-[14px] pt-0.5 pb-1 font-sans text-[12.5px] text-ink-soft">{g.note}</p>
            <div role="radiogroup" aria-label={g.title}>
              {hands.map((s) => {
                const on = s.id === script.id
                const best = s.nib ? nibOf(s.nib) : null
                return (
                  <Specimen key={s.id} $on={on}>
                    <button type="button" className="pick" role="radio" aria-checked={on} onClick={() => setScript(s.id)}>
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="text-[17px]">{s.name}</span>
                        {on && <span className="font-sans text-[12px] text-vermilion">Learning</span>}
                      </div>
                      <div className="inked mt-1 overflow-hidden whitespace-nowrap text-ink">
                        <Hand text={s.sample ?? 'Write a little, every day.'} size={13} font={s.font} />
                      </div>
                      <div className="inked overflow-hidden whitespace-nowrap text-ink-soft">
                        <Hand text="Aa Bb Gg Kk Rr Yy" size={9.5} font={s.font} />
                      </div>
                      <p className="m-0 mt-1.5 font-sans text-[13px] leading-snug text-ink-soft">{s.blurb}</p>
                    </button>
                    {best && (
                      <p className="m-0 mt-2 font-sans text-[12.5px] text-ink-soft">
                        Write it with {/^[aeiou]/i.test(best.name) ? 'an' : 'a'} {best.name.toLowerCase()} nib.
                      </p>
                    )}
                  </Specimen>
                )
              })}
            </div>
          </section>
        )
      })}

    </main>
  )
}
