import { PLAYER_VISION_RADIUS } from '../../config/constants.js'

const UNEXPLORED_COLOR = 0x010203
const EXPLORED_COLOR = 0x020305
/** Niebla de memoria: casi negra. */
const EXPLORED_FOG_ALPHA = 0.995
/** Con luz máxima y visión plena, sin velo. */
const LIT_CLEAR_ALPHA = 0
const MAX_LIGHT = 10
/** Suavizado al cambiar luz y el anillo de visión (antes 0.14s). */
const LIGHT_TRANSITION_SECONDS = 0.42
/** Distancia a la que empieza a “no alcanzar a ver”. */
const VISION_SOFT_START = 5

function tileKey(x, y) {
  return `${x},${y}`
}

/**
 * 0 = visión plena, 1 = niebla total.
 * Entre softStart y softEnd: oscurecimiento por distancia (sin borde duro).
 */
function visionEdgeDarken(dist, softStart = VISION_SOFT_START, softEnd = PLAYER_VISION_RADIUS) {
  if (dist >= softEnd) return 1
  if (dist <= softStart) return 0
  const t = (dist - softStart) / (softEnd - softStart)
  return t * t * (3 - 2 * t)
}

function fogAlphaForLight(light, discovered) {
  const fogAlpha = discovered ? EXPLORED_FOG_ALPHA : 1
  if (light <= 0) return fogAlpha
  const clear = discovered ? LIT_CLEAR_ALPHA : LIT_CLEAR_ALPHA * 0.5
  return fogAlpha - (Math.min(light, MAX_LIGHT) / MAX_LIGHT) * (fogAlpha - clear)
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

    const px = world.player?.tileX ?? 0
    const py = world.player?.tileY ?? 0
    this.visionFromX = px
    this.visionFromY = py
    this.visionToX = px
    this.visionToY = py
    this.displayedVisionX = px
    this.displayedVisionY = py

    this.world.displayedLightLevels = this.displayedLightLevels
    this._draw()
  }

  update(dt = 0) {
    if (this.lastRevision !== this.world.visionRevision) {
      this.lastRevision = this.world.visionRevision
      this.transitionFrom = new Map(this.displayedLightLevels)
      this.transitionTo = new Map(this.world.lightLevels)
      this.visionFromX = this.displayedVisionX
      this.visionFromY = this.displayedVisionY
      this.visionToX = this.world.player?.tileX ?? this.displayedVisionX
      this.visionToY = this.world.player?.tileY ?? this.displayedVisionY
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

    this.displayedVisionX = this.visionFromX
      + (this.visionToX - this.visionFromX) * easedProgress
    this.displayedVisionY = this.visionFromY
      + (this.visionToY - this.visionFromY) * easedProgress

    this.world.displayedLightLevels = this.displayedLightLevels
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
    const px = this.displayedVisionX
    const py = this.displayedVisionY

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
        const discovered = discoveredTiles.has(key)
        const edge = visionEdgeDarken(Math.hypot(x - px, y - py))
        const litAlpha = fogAlphaForLight(light, discovered)
        const fogAlpha = discovered ? EXPLORED_FOG_ALPHA : 1
        const alpha = litAlpha + (fogAlpha - litAlpha) * edge

        if (alpha <= 0.02) continue

        const color = discovered ? EXPLORED_COLOR : UNEXPLORED_COLOR
        this.graphics.fillStyle(color, Math.min(1, alpha))
        this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }
  }

  destroy() {
    this.graphics.destroy()
  }
}
