import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Separa dependências grandes em chunks próprios (melhor cache entre deploys).
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          socket: ['socket.io-client'],
        },
      },
    },
  },
})
