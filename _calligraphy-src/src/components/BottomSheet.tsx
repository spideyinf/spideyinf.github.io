import { useEffect, type ReactNode } from 'react'
import styled, { keyframes } from 'styled-components'
import { IconButton, Icons } from './ui'
import fibers from '../assets/paper/lightpaperfibers.png'

const up = keyframes`from { transform: translateY(100%); } to { transform: none; }`

const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  background: rgb(43 29 26 / 0.32);
`
/* A sheet of note paper slid up over the page. */
const Panel = styled.div`
  width: 100%;
  max-height: 88dvh;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: ${({ theme }) => theme.color.note};
  background-image: url(${fibers});
  background-size: 500px 300px;
  background-blend-mode: multiply;
  box-shadow: 0 -8px 24px rgb(70 50 25 / 0.2);
  animation: ${up} 0.24s ease-out;
`

const Header = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px 0;
  background-color: ${({ theme }) => theme.color.note};
  background-image: url(${fibers});
  background-size: 500px 300px;
  background-blend-mode: multiply;
`

export function BottomSheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <Backdrop onClick={(e) => e.target === e.currentTarget && onClose()}>
      <Panel role="dialog" aria-modal="true" aria-label={title}>
        <Header>
          <h2 className="m-0 text-[22px] font-normal">{title}</h2>
          <IconButton label="Close" onClick={onClose}>
            {Icons.close}
          </IconButton>
        </Header>
        {children}
      </Panel>
    </Backdrop>
  )
}
