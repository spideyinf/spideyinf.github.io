import { useCallback, useEffect, useState } from 'react'
import { DiaryWriter } from '../components/DiaryWriter'
import { IconButton, Icons, SaveButton } from '../components/ui'
import { PREFACE } from '../lib/prefaces'
import { go, href } from '../lib/router'

/** The preface: an unseen hand writes to you; when you close it, the ink sinks into the page. */
export function PrefaceScreen() {
  const [finished, setFinished] = useState(false)
  const [sinking, setSinking] = useState(false)
  const onDone = useCallback(() => setFinished(true), [])

  // Reading the letter counts as the welcome, so Home won't send you back here.
  useEffect(() => {
    try {
      localStorage.setItem('wtl:welcomed', '1')
    } catch {
      /* storage unavailable */
    }
  }, [])

  const close = () => {
    setSinking(true)
    setTimeout(() => go(href.home, true), 1900)
  }

  return (
    <main className="min-h-dvh pb-16" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <div className="flex justify-end px-1.5 pt-1.5">
        <IconButton label="Close the letter" onClick={close}>
          {Icons.close}
        </IconButton>
      </div>
      <div className="px-[22px] pt-[6vh]">
        <DiaryWriter paragraphs={PREFACE.body} sign={PREFACE.sign} sinking={sinking} onDone={onDone} />
      </div>
      <div
        className="flex justify-center pt-10 transition-opacity duration-700"
        style={{ opacity: finished && !sinking ? 1 : 0, pointerEvents: finished && !sinking ? 'auto' : 'none' }}
      >
        <SaveButton type="button" onClick={close}>
          Close the letter
        </SaveButton>
      </div>
      {!finished && (
        <p className="m-0 pt-10 text-center font-sans text-[12px] text-ink-soft opacity-70">Tap the page to let it finish</p>
      )}
    </main>
  )
}
