import { PenCase } from '../components/PenCase'
import { IconButton, Icons, TopBar } from '../components/ui'
import { go, href } from '../lib/router'

export function PensScreen() {
  return (
    <main className="min-h-dvh pb-10" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <TopBar>
        <IconButton label="Back" onClick={() => (history.length > 1 ? history.back() : go(href.home))}>
          {Icons.back}
        </IconButton>
        <div className="flex-1 leading-tight">
          <div className="text-[17px]">Pen case</div>
          <div className="font-sans text-[12.5px] text-ink-soft">Pen, nib, ink and paper: feel each one</div>
        </div>
      </TopBar>
      <PenCase />
    </main>
  )
}
