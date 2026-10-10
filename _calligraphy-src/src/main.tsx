import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from 'styled-components'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/inter'
import '@fontsource/pinyon-script/400.css'
import '@fontsource/ephesis/400.css'
import './index.css'
import App from './App.tsx'
import { theme } from './theme'
import { PracticeProvider } from './state/practice'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <PracticeProvider>
        <App />
      </PracticeProvider>
    </ThemeProvider>
  </StrictMode>,
)
