import styled from 'styled-components'
import { Hand, IconButton, Icons, TopBar } from '../components/ui'
import { LETTERS } from '../lib/letters'
import { go, href } from '../lib/router'
import { usePractice } from '../state/practice'

// Edge-to-edge grid: cells touch the screen sides and each other, no outlines.
const Grid = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
`
const Cell = styled.a<{ $done: boolean }>`
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  color: ${({ theme }) => theme.color.ink};
  text-decoration: none;
  background: ${({ $done, theme }) => ($done ? theme.color.paperDeep : 'transparent')};
  transition: background 0.15s;
  &:active {
    background: ${({ theme }) => theme.color.rule};
  }
  &::after {
    content: '';
    display: ${({ $done }) => ($done ? 'block' : 'none')};
    position: absolute;
    top: 10px;
    right: 10px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.cobalt};
  }
`

export function LettersScreen() {
  const { today } = usePractice()
  const done = today.letters.length

  return (
    <main className="min-h-dvh pb-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back to home" onClick={() => go(href.home)}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">ABC</div>
          <div className="font-sans text-[12.5px] text-ink-soft">
            {done ? `${done} of 26 written today` : 'Pick any letter to start'}
          </div>
        </div>
      </TopBar>
      <p className="m-0 px-[14px] pt-1 pb-4 font-sans text-[13px] leading-snug text-ink-soft">
        Copperplate capitals with business cursive lowercase. The point is a hand that inspires you, not perfect
        strokes.
      </p>
      <Grid>
        {LETTERS.map((l) => (
          <li key={l}>
            <Cell href={href.abc(l)} $done={today.letters.includes(l)} aria-label={`Letter ${l}${today.letters.includes(l) ? ', written today' : ''}`}>
              <Hand text={l + l.toLowerCase()} size={14} />
            </Cell>
          </li>
        ))}
      </Grid>
    </main>
  )
}
