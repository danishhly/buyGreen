import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env': {}
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
  },
  server: {
    port: 5173, // Default port, will use next available if busy
    strictPort: false, // Allow using next available port if 5173 is busy
    allowedHosts: [
      '34e27de4-5ef2-4ac3-a873-76d4d8983829-00-z74knzzypso4.sisko.replit.dev'
    ]
  },
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'google-auth': ['@react-oauth/google'],
        }
      }
    },
    // Enable source maps for production debugging (optional)
    sourcemap: false,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@react-oauth/google', 'axios']
  }
})
