import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {}
  },
  server: {
    allowedHosts: [
      '34e27de4-5ef2-4ac3-a873-76d4d8983829-00-z74knzzypso4.sisko.replit.dev'
    ]
  }
})
