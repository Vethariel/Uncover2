import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: false,
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
