import { useEffect } from 'react'
import { useRoute } from './lib/router'
import { AbcScreen } from './screens/AbcScreen'
import { HomeScreen } from './screens/HomeScreen'
import { LettersScreen } from './screens/LettersScreen'
import { QuotesScreen } from './screens/QuotesScreen'
import { WriteScreen } from './screens/WriteScreen'

export default function App() {
  const route = useRoute()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [route.name])

  switch (route.name) {
    case 'letters':
      return <LettersScreen />
    case 'abc':
      return <AbcScreen letter={route.letter} />
    case 'quotes':
      return <QuotesScreen />
    case 'write':
      return <WriteScreen key={route.quoteId} quoteId={route.quoteId} />
    default:
      return <HomeScreen />
  }
}
