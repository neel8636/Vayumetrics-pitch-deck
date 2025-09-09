import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  // IMPORTANT: must match your repo name exactly (case-sensitive)
  base: '/Vayumetrics-pitch-deck/',
})
