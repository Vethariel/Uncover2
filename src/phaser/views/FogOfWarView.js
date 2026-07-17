const FOG_COLOR = 0x05080b
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

    const { grid, tileSize, lightLevels, visionViewport } = this.world
    this.graphics.clear()

    const minX = visionViewport?.minX ?? 0
    const maxX = visionViewport?.maxX ?? grid.cols - 1
    const minY = visionViewport?.minY ?? 0
    const maxY = visionViewport?.maxY ?? grid.rows - 1

    // Fuera del viewport: negro total (culling de niebla).
    if (minY > 0) {
      this.graphics.fillStyle(FOG_COLOR, 1)
      this.graphics.fillRect(0, 0, grid.cols * tileSize, minY * tileSize)
    }
    if (maxY < grid.rows - 1) {
      this.graphics.fillStyle(FOG_COLOR, 1)
      this.graphics.fillRect(
        0,
        (maxY + 1) * tileSize,
        grid.cols * tileSize,
        (grid.rows - maxY - 1) * tileSize,
      )
    }
    if (minX > 0) {
      this.graphics.fillStyle(FOG_COLOR, 1)
      this.graphics.fillRect(
        0,
        minY * tileSize,
        minX * tileSize,
        (maxY - minY + 1) * tileSize,
      )
    }
    if (maxX < grid.cols - 1) {
      this.graphics.fillStyle(FOG_COLOR, 1)
      this.graphics.fillRect(
        (maxX + 1) * tileSize,
        minY * tileSize,
        (grid.cols - maxX - 1) * tileSize,
        (maxY - minY + 1) * tileSize,
      )
    }

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const light = lightLevels.get(tileKey(x, y)) ?? 0
        if (light >= MAX_LIGHT) continue

        // Fuera de visión / sin luz: oscuridad total. El descubrimiento va al minimapa.
        const alpha = light <= 0
          ? 1
          : 1 - (light / MAX_LIGHT) * 0.92
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
