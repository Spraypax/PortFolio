import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/reset.css'
import './styles/variables.css'
import './styles/typography.css'
import './styles/globals.css'
import App from './App'
import { IntroExperience } from './components/intro/IntroExperience'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <IntroExperience>
      <App />
    </IntroExperience>
  </StrictMode>,
)
