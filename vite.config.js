import { defineConfig } from 'vite'
import { cpSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Copia la carpeta de assets del juego a dist/assets (junto al JS/CSS de Vite).
 * Necesario porque Phaser carga rutas tipo `assets/sprites/...` en runtime.
 */
function copyGameAssets() {
  return {
    name: 'copy-game-assets',
    closeBundle() {
      const from = 'assets'
      const to = join('dist', 'assets')
      if (!existsSync(from)) return
      mkdirSync(to, { recursive: true })
      cpSync(from, to, { recursive: true })
    },
  }
}

// GitHub Pages (proyecto): VITE_BASE_PATH=/Uncover2/
// Local / preview en raíz: sin variable → '/'
const base = process.env.VITE_BASE_PATH || '/'

export default defineConfig({
  base,
  root: '.',
  publicDir: false,
  plugins: [copyGameAssets()],
  server: {
    open: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  test: {
    include: ['tests/**/*.test.js'],
  },
})
