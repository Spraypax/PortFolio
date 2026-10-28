import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  define: {
    // Stored in the production bundle, never recalculated when someone visits.
    __PORTFOLIO_BUILD_DATE__: JSON.stringify(
      command === 'build'
        ? new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Paris' })
        : null,
    ),
  },
}))
