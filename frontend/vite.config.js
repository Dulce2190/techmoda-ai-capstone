import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5175, // <--- Cámbialo a 5175
    allowedHosts: true,
  },
})
