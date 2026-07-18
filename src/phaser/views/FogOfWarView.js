const UNEXPLORED_COLOR = 0x05080b
const EXPLORED_COLOR = 0x12151a
const MAX_LIGHT = 10
const LIGHT_TRANSITION_SECONDS = 0.14

function tileKey(x, y) {
  return `${x},${y}`
}

export class FogOfWarView {
  constructor(scene, world) {
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(950)
    this.lastRevision = world.visionRevision
    this.displayedLightLevels = new Map(world.lightLevels)
    this.transitionFrom = new Map(world.lightLevels)
    this.transitionTo = new Map(world.lightLevels)
    this.transitionElapsed = LIGHT_TRANSITION_SECONDS
    this._draw()
  }

  update(dt = 0) {
    if (this.lastRevision !== this.world.visionRevision) {
      this.lastRevision = this.world.visionRevision
      this.transitionFrom = new Map(this.displayedLightLevels)
      this.transitionTo = new Map(this.world.lightLevels)
      this.transitionElapsed = 0
    }

    if (this.transitionElapsed >= LIGHT_TRANSITION_SECONDS) return

    this.transitionElapsed = Math.min(
      LIGHT_TRANSITION_SECONDS,
      this.transitionElapsed + Math.max(0, dt),
    )
    const progress = this.transitionElapsed / LIGHT_TRANSITION_SECONDS
    const easedProgress = progress * progress * (3 - 2 * progress)
    const keys = new Set([
      ...this.transitionFrom.keys(),
      ...this.transitionTo.keys(),
    ])

    this.displayedLightLevels.clear()
    for (const key of keys) {
      const from = this.transitionFrom.get(key) ?? 0
      const to = this.transitionTo.get(key) ?? 0
      const light = from + (to - from) * easedProgress
      if (light > 0.01) this.displayedLightLevels.set(key, light)
    }

    this._draw()
  }

  _draw() {
    const {
      grid,
      tileSize,
      discoveredTiles,
      visionViewport,
    } = this.world
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
        const light = this.displayedLightLevels.get(key) ?? 0
        if (light >= MAX_LIGHT) continue

        const discovered = discoveredTiles.has(key)

        if (light > 0) {
          if (discovered) {
            // El gradiente converge al tono de niebla explorada, no a negro:
            // así el apagado no produce un destello oscuro antes de la memoria.
            const alpha = 0.94 - (light / MAX_LIGHT) * 0.86
            this.graphics.fillStyle(EXPLORED_COLOR, alpha)
          } else {
            const alpha = 1 - (light / MAX_LIGHT) * 0.92
            this.graphics.fillStyle(UNEXPLORED_COLOR, alpha)
          }
          this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          continue
        }

        if (discovered) {
          // Memoria explorada: tono neutro muy oscuro, sin parecer iluminación.
          this.graphics.fillStyle(EXPLORED_COLOR, 0.94)
          this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
          continue
        }

        this.graphics.fillStyle(UNEXPLORED_COLOR, 1)
        this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

  }

  destroy() {
    this.graphics.destroy()
  }
}
