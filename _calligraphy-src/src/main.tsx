import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import '@fontsource/pinyon-script/400.css'
import '@fontsource/ephesis/400.css'
import '@fontsource/merienda/400.css'
import '@fontsource/patrick-hand/400.css'
import '@fontsource/sacramento/400.css'
import './index.css'
import App from './App.tsx'
import { PaperFilters } from './components/ui'
import { theme } from './theme'
import { PracticeProvider } from './state/practice'
import playwriteVn from '@fontsource/playwrite-vn/files/playwrite-vn-latin-400-normal.woff2?url'

// The packaged stylesheet limits this font to basic Latin, but the file carries every
// Vietnamese letter. Registering it ourselves lets ư, ơ, ữ… use the school hand too.
if (typeof FontFace !== 'undefined') document.fonts.add(new FontFace('Playwrite VN', `url(${playwriteVn})`))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <PracticeProvider>
        <PaperFilters />
        <App />
      </PracticeProvider>
    </ThemeProvider>
  </StrictMode>,
)
