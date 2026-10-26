import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  define: {
    // Stored in the production bundle, never recalculated when someone visits.
    __PORTFOLIO_BUILD_DATE__: JSON.stringify(
      command === 'build'
        ? new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
        : null,
    ),
  },
}))
