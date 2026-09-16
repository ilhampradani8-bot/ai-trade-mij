import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    allowedHosts: [
      'ai-trade.mijdigital.my',
      'www.ai-trade.mijdigital.my',
      '166.0.112.212',
      'localhost',
      '127.0.0.1'
    ]
  }
})
