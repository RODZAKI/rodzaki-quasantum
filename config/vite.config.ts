import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/quasantum/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  build: {
    cssMinify: false,
  },
  css: {
    postcss: path.resolve(__dirname, './postcss.config.js'),
  },
})
