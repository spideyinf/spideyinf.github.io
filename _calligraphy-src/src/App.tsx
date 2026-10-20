import { lazy, Suspense, useEffect } from 'react'
import { useRoute } from './lib/router'
import { AbcScreen } from './screens/AbcScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LettersScreen } from './screens/LettersScreen'
import { TraceScreen } from './screens/TraceScreen'
import { GuideScreen } from './screens/GuideScreen'
import { HandsScreen } from './screens/HandsScreen'
import { PrefaceScreen } from './screens/PrefaceScreen'
import { QuotesScreen } from './screens/QuotesScreen'
import { RecordScreen } from './screens/RecordScreen'
import { WriteScreen } from './screens/WriteScreen'

// Dev-only letterform contact sheet; never shipped in the production bundle.
const DuctusSheet = import.meta.env.DEV ? lazy(() => import('./dev/DuctusSheet')) : null
const TraceSheet = import.meta.env.DEV ? lazy(() => import('./dev/TraceSheet')) : null

export default function App() {
  const route = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name])

  if (TraceSheet && location.hash.startsWith('#/tracesheet'))
    return (
      <Suspense>
        <TraceSheet />
      </Suspense>
    )
  if (DuctusSheet && location.hash.startsWith('#/ductus'))
    return (
      <Suspense>
        <DuctusSheet />
      </Suspense>
    )

  switch (route.name) {
    case 'letters':
      return <LettersScreen />
    case 'abc':
      return <AbcScreen letter={route.letter} />
    case 'hands':
      return <HandsScreen />
    case 'trace':
      return <TraceScreen />
    case 'guide':
      return <GuideScreen />
    case 'preface':
      return <PrefaceScreen />
    case 'record':
      return <RecordScreen />
    case 'quotes':
      return <QuotesScreen />
    case 'write':
      return <WriteScreen key={route.quoteId} quoteId={route.quoteId} />
    default:
      return <HomeScreen />
  }
}
