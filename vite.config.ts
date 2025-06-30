import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, 'src/ui'),
  build: {
    outDir: resolve(__dirname, 'dist/renderer'),
    emptyOutDir: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/core': resolve(__dirname, './src/core'),
      '@/drivers': resolve(__dirname, './src/drivers'),
      '@/ui': resolve(__dirname, './src/ui'),
      '@/shared': resolve(__dirname, './src/shared')
    }
  },
  server: {
    port: 3000,
    strictPort: false,
    host: true
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  },
  logLevel: 'warn',
  clearScreen: false
}) 