import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://q9kzb7l9-3000.asse.devtunnels.ms',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'https://q9kzb7l9-3000.asse.devtunnels.ms/',
        changeOrigin: true,
      },
    },
  },
})
