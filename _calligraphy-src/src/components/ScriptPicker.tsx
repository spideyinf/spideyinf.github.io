import styled from 'styled-components'
import { SCRIPTS } from '../lib/scripts'
import { usePractice } from '../state/practice'
import { Hand, Ring } from './ui'

/* Large picker for Home: each hand written in itself; the chosen one is circled. */
const Option = styled.button<{ $on: boolean }>`
  flex: 0 0 48%;
  min-width: 0;
  padding: 3cqw 2cqw;
  border: 0;
  background: none;
  text-align: center;
  color: ${({ theme }) => theme.color.ink};
  opacity: ${({ $on }) => ($on ? 1 : 0.62)};
  transition: opacity 0.2s;
`
/* The name, with room around it for the pencil ring. */
const Name = styled.span`
  position: relative;
  display: inline-block;
  padding: 2.4cqw 4cqw;
  white-space: nowrap;
  svg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    color: ${({ theme }) => theme.color.vermilion};
  }
`

export function ScriptPicker() {
  const { script, setScript } = usePractice()
  return (
    <section aria-label="Choose the hand to learn" className="px-[14px] [container-type:inline-size]">
      <h2 className="m-0 text-center font-sans text-[12.5px] font-normal text-ink-soft">The hand you're learning</h2>
      <div role="radiogroup" aria-label="Script" className="mt-1 flex flex-wrap justify-center">
        {SCRIPTS.map((s) => (
          <Option
            key={s.id}
            type="button"
            role="radio"
            aria-checked={s.id === script.id}
            $on={s.id === script.id}
            onClick={() => setScript(s.id)}
          >
            <Name className="inked">
              {s.id === script.id && <Ring />}
              <Hand text={s.name} size="2.9cqw" font={s.font} />
            </Name>
            <span className="mt-[0.5cqw] block font-sans text-[clamp(11.5px,3.2cqw,13px)] leading-snug text-ink-soft">
              {s.blurb}
            </span>
          </Option>
        ))}
      </div>
    </section>
  )
}

/* Compact tabs for screens with less room (the letter grid). */
const Tab = styled.button<{ $on: boolean }>`
  flex: none;
  padding: 6px 0 5px;
  border: 0;
  background: none;
  font-family: ${({ theme }) => theme.font.sans};
  font-size: 13.5px;
  color: ${({ $on, theme }) => ($on ? theme.color.ink : theme.color.inkSoft)};
  box-shadow: inset 0 -1.5px 0 ${({ $on, theme }) => ($on ? theme.color.ink : 'transparent')};
`

export function ScriptTabs() {
  const { script, setScript } = usePractice()
  return (
    <div role="radiogroup" aria-label="Script" className="flex gap-[18px] overflow-x-auto px-[14px]">
      {SCRIPTS.map((s) => (
        <Tab
          key={s.id}
          type="button"
          role="radio"
          aria-checked={s.id === script.id}
          $on={s.id === script.id}
          onClick={() => setScript(s.id)}
        >
          {s.name}
        </Tab>
      ))}
    </div>
  )
}
