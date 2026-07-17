const UNEXPLORED_COLOR = 0x05080b
const EXPLORED_COLOR = 0x12151a
const MAX_LIGHT = 10

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

    const { grid, tileSize, lightLevels, discoveredTiles, visionViewport } = this.world
    this.graphics.clear()

    const minX = visionViewport?.minX ?? 0
    const maxX = visionViewport?.maxX ?? grid.cols - 1
    const minY = visionViewport?.minY ?? 0
    const maxY = visionViewport?.maxY ?? grid.rows - 1

    // Fuera del viewport: negro total (culling de niebla).
    if (minY > 0) {
      this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
      this.graphics.fillRect(0, 0, grid.cols * tileSize, minY * tileSize)
    }
    if (maxY < grid.rows - 1) {
      this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
      this.graphics.fillRect(
        0,
        (maxY + 1) * tileSize,
        grid.cols * tileSize,
        (grid.rows - maxY - 1) * tileSize,
      )
    }
    if (minX > 0) {
      this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
      this.graphics.fillRect(
        0,
        minY * tileSize,
        minX * tileSize,
        (maxY - minY + 1) * tileSize,
      )
    }
    if (maxX < grid.cols - 1) {
      this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
      this.graphics.fillRect(
        (maxX + 1) * tileSize,
        minY * tileSize,
        (grid.cols - maxX - 1) * tileSize,
        (maxY - minY + 1) * tileSize,
      )
    }

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const key = tileKey(x, y)
        const light = lightLevels.get(key) ?? 0
        if (light >= MAX_LIGHT) continue

        if (light > 0) {
          // Gradiente de luz actual: no choca con la memoria explorada.
          const alpha = 1 - (light / MAX_LIGHT) * 0.92
          this.graphics.fillStyle(UNEXPLORED_COLOR, alpha)
          this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          continue
        }

        if (discoveredTiles.has(key)) {
          // Memoria explorada: tono neutro muy oscuro, sin parecer iluminación.
          this.graphics.fillStyle(EXPLORED_COLOR, 0.94)
          this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          continue
        }

        this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
        this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    this.lastRevision = this.world.visionRevision
  }

  destroy() {
    this.graphics.destroy()
  }
}
