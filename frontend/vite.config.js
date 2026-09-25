import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/login': 'http://localhost:8000',
      '/projects': 'http://localhost:8000',
      '/publications': 'http://localhost:8000',
      '/session': 'http://localhost:8000',
    },
  },
})
