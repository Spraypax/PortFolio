import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.css'
import './styles/variables.css'
import './styles/typography.css'
import './styles/globals.css'
import App from './App'
import { IntroExperience } from './components/intro/IntroExperience'
import { installStartAtTop } from './utils/startAtTop'

const cleanupScrollReset = installStartAtTop()
if (import.meta.hot) import.meta.hot.dispose(cleanupScrollReset)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntroExperience>
      <App />
    </IntroExperience>
  </StrictMode>,
)
