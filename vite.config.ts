import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  base: '/quasantum/',
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'artifacts/field_index_enriched.json', dest: '' },
        { src: 'artifacts/field_centrality.json', dest: '' },
        { src: 'artifacts/field_roles.json', dest: '' },
        { src: 'artifacts/field_graph.json', dest: '' },
      ],
    }),
  ],
  server: {
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    cssMinify: false,
  },
})
