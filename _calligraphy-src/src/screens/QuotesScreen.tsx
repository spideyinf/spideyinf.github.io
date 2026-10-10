import { useState } from 'react'
import styled, { keyframes } from 'styled-components'
import { Hand, IconButton, Icons, SaveButton, TopBar } from '../components/ui'
import { go, href } from '../lib/router'
import { usePractice } from '../state/practice'

// Full-bleed rows that alternate paper tones instead of outlined cards.
const Card = styled.li<{ $mine?: boolean }>`
  position: relative;
  list-style: none;
  background: ${({ $mine, theme }) => ($mine ? theme.color.cobalt : 'transparent')};
  color: ${({ $mine, theme }) => ($mine ? '#fff' : theme.color.ink)};
  &:nth-child(even) {
    background: ${({ $mine, theme }) => ($mine ? theme.color.cobalt : theme.color.paperDeep)};
  }
  a {
    display: block;
    padding: 20px 14px 18px;
    color: inherit;
    text-decoration: none;
  }
`

const up = keyframes`from { transform: translateY(100%); } to { transform: none; }`
const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(43, 29, 26, 0.35);
  display: flex;
  align-items: flex-end;
`
const Drawer = styled.form`
  width: 100%;
  background: ${({ theme }) => theme.color.paper};
  
  padding: 18px 18px calc(18px + env(safe-area-inset-bottom));
  animation: ${up} 0.22s ease-out;
  textarea,
  input {
    width: 100%;
    box-sizing: border-box;
    border: 0;
    border-radius: 0;
    background: ${({ theme }) => theme.color.paperDeep};
    padding: 12px 14px;
    font: 17px/1.45 ${({ theme }) => theme.font.serif};
    color: ${({ theme }) => theme.color.ink};
  }
  textarea {
    min-height: 120px;
    resize: none;
  }
  label {
    display: block;
    margin: 12px 0 6px;
    font: 13px ${({ theme }) => theme.font.sans};
    color: ${({ theme }) => theme.color.inkSoft};
  }
`

export function QuotesScreen() {
  const { quotes, today, addQuote, deleteQuote } = usePractice()
  const [adding, setAdding] = useState(false)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    const q = addQuote(text, author)
    setAdding(false)
    setText('')
    setAuthor('')
    go(href.write(q.id))
  }

  return (
    <main className="min-h-dvh pb-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back to home" onClick={() => go(href.home)}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Paragraph</div>
          <div className="font-sans text-[12.5px] text-ink-soft">Pick a line to write by hand, or bring your own</div>
        </div>
      </TopBar>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center gap-3 border-0 bg-transparent px-[14px] py-4 text-left text-cobalt"
        >
          {Icons.plus}
          <span className="text-[17px]">Write your own quote</span>
        </button>

        <ul className="m-0 p-0">
          {quotes.map((q) => (
            <Card key={q.id} $mine={q.custom}>
              <a href={href.write(q.id)}>
                <Hand text={q.text} size={8.5} className="block" />
                <div className={`mt-2 font-sans text-[12.5px] ${q.custom ? 'text-white/75' : 'text-ink-soft'}`}>
                  {q.author || 'Your quote'}
                  {today.quotes.includes(q.id) && ', written today'}
                </div>
              </a>
              {q.custom && (
                <div className="absolute top-1.5 right-1.5">
                  <IconButton label="Delete this quote" onClick={() => deleteQuote(q.id)} style={{ color: '#fff' }}>
                    {Icons.close}
                  </IconButton>
                </div>
              )}
            </Card>
          ))}
        </ul>
      </div>

      {adding && (
        <Backdrop onClick={(e) => e.target === e.currentTarget && setAdding(false)}>
          <Drawer onSubmit={submit} aria-label="Write your own quote">
            <div className="flex items-center justify-between">
              <h2 className="m-0 text-[22px] font-normal">Your quote</h2>
              <IconButton label="Close" type="button" onClick={() => setAdding(false)}>
                {Icons.close}
              </IconButton>
            </div>
            <label htmlFor="q-text">Words to write</label>
            <textarea id="q-text" autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="A sentence you'd like to have in your own hand" />
            <label htmlFor="q-author">Who said it (optional)</label>
            <input id="q-author" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <SaveButton type="submit" disabled={!text.trim()} className="mt-4 w-full">
              Save and start writing
            </SaveButton>
          </Drawer>
        </Backdrop>
      )}
    </main>
  )
}
