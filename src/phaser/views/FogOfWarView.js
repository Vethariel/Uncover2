const FOG_COLOR = 0x05080b
const EXPLORED_ALPHA = 0.68
const LIGHT_ALPHA = {
  0: 1,
  1: 0.82,
  2: 0.64,
  3: 0.46,
  4: 0.28,
  5: 0.14,
}

function tileKey(x, y) {
  return `${x},${y}`
}

export class FogOfWarView {
  constructor(scene, world) {
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(950)
    this.lastRevision = -1
    this.update()
  }

  update() {
    if (this.lastRevision === this.world.visionRevision) return

    const { grid, tileSize, discoveredTiles, lightLevels } = this.world
    this.graphics.clear()

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const key = tileKey(x, y)
        const light = lightLevels.get(key) ?? 0
        if (light >= 5) continue

        const baseAlpha = discoveredTiles.has(key) ? EXPLORED_ALPHA : 1
        const alpha = Math.min(baseAlpha, LIGHT_ALPHA[light] ?? baseAlpha)
        this.graphics.fillStyle(FOG_COLOR, alpha)
        this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    this.lastRevision = this.world.visionRevision
  }

  destroy() {
    this.graphics.destroy()
  }
}
