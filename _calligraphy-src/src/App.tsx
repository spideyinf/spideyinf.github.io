import { lazy, Suspense, useEffect } from 'react'
import { TabBar, TAB_ROUTES } from './components/b'
import { useRoute } from './lib/router'
import { AbcScreen } from './screens/AbcScreen'
import { GuideScreen } from './screens/GuideScreen'
import { HandsScreen } from './screens/HandsScreen'
import { HomeScreen } from './screens/HomeScreen'
import { PagesScreen } from './screens/PagesScreen'
import { ParagraphScreen } from './screens/ParagraphScreen'
import { PrefaceScreen } from './screens/PrefaceScreen'
import { RecordScreen } from './screens/RecordScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { TraceScreen } from './screens/TraceScreen'

// Dev-only contact sheets; never shipped in the production bundle.
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

  return (
    <>
      {screen(route)}
      {TAB_ROUTES.includes(route.name) && <TabBar />}
    </>
  )
}

function screen(route: ReturnType<typeof useRoute>) {
  switch (route.name) {
    case 'letters':
      return <AbcScreen />
    case 'abc':
      return <AbcScreen letter={route.letter} />
    case 'quotes':
      return <ParagraphScreen />
    case 'write':
      return <ParagraphScreen quoteId={route.quoteId} />
    case 'pages':
      return <PagesScreen />
    case 'settings':
      return <SettingsScreen />
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
    default:
      return <HomeScreen />
  }
}
