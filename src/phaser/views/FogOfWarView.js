import {
  Q_NE,
  Q_NW,
  Q_SE,
  Q_SW,
  isMineWallTile,
  makeWallLightSampler,
  mineWallNeighborMask,
  wallQuarterLights,
  isWallFullyEnclosed3x3,
} from '../../config/mineWalls.js'
import {
  bilinearQuarterLight,
  visionEdgeDarken,
} from '../../config/visionFog.js'
import { collectDoorWallKeys } from './doorVisual.js'

/** Niebla = negro con alpha sobre fondo negro (sin gris). */
const FOG_COLOR = 0x000000
/** Memoria explorada: casi negro puro (1 = indistingible de no explorado). */
const EXPLORED_FOG_ALPHA = 0.996
const LIT_CLEAR_ALPHA = 0
const MAX_LIGHT = 10
const LIGHT_TRANSITION_SECONDS = 0.42
/** Subceldas por eje para degradado bilineal en muros. */
const WALL_FOG_GRID = 4

/** Bajo el sprite de muro (0.5): oscurece suelo visto por transparencia del muro. */
export const FLOOR_FOG_DEPTH = 0.25

function tileKey(x, y) {
  return `${x},${y}`
}

function quartersToArray(lights) {
  return new Float32Array([
    lights[Q_NW] ?? 0,
    lights[Q_NE] ?? 0,
    lights[Q_SW] ?? 0,
    lights[Q_SE] ?? 0,
  ])
}

function arrayToQuarters(arr) {
  return {
    [Q_NW]: arr[0] ?? 0,
    [Q_NE]: arr[1] ?? 0,
    [Q_SW]: arr[2] ?? 0,
    [Q_SE]: arr[3] ?? 0,
  }
}

/** Alpha de negro: 1 = vacío total, 0 = suelo/luz plena. */
function fogAlphaForLight(light, discovered) {
  const fogAlpha = discovered ? EXPLORED_FOG_ALPHA : 1
  if (light <= 0) return fogAlpha
  const clear = discovered ? LIT_CLEAR_ALPHA : LIT_CLEAR_ALPHA * 0.5
  return fogAlpha - (Math.min(light, MAX_LIGHT) / MAX_LIGHT) * (fogAlpha - clear)
}

export class FogOfWarView {
  constructor(scene, world) {
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(FLOOR_FOG_DEPTH)
    this.lastRevision = world.visionRevision
    this.displayedLightLevels = new Map(world.lightLevels)
    this.transitionFrom = new Map(world.lightLevels)
    this.transitionTo = new Map(world.lightLevels)
    this.transitionElapsed = LIGHT_TRANSITION_SECONDS
    this.displayedWallQuarters = new Map()

    const px = world.player?.tileX ?? 0
    const py = world.player?.tileY ?? 0
    this.visionFromX = px
    this.visionFromY = py
    this.visionToX = px
    this.visionToY = py
    this.displayedVisionX = px
    this.displayedVisionY = py

    this.world.displayedLightLevels = this.displayedLightLevels
    this.world.displayedWallQuarters = this.displayedWallQuarters
    this.world.lightDisplayRevision = (this.world.lightDisplayRevision ?? 0) + 1
    this._refreshWallQuarterTargets(true)
    this._draw()
  }

  update(dt = 0) {
    let needsDraw = false

    if (this.lastRevision !== this.world.visionRevision) {
      this.lastRevision = this.world.visionRevision
      this._doorWallKeys = null
      this.transitionFrom = new Map(this.displayedLightLevels)
      this.transitionTo = new Map(this.world.lightLevels)
      this.visionFromX = this.displayedVisionX
      this.visionFromY = this.displayedVisionY
      this.visionToX = this.world.player?.tileX ?? this.displayedVisionX
      this.visionToY = this.world.player?.tileY ?? this.displayedVisionY
      this.transitionElapsed = 0
      needsDraw = true
    }

    const lightBusy = this.transitionElapsed < LIGHT_TRANSITION_SECONDS
    // Cuartos de muro: siempre persiguen la posición del viewer (degradado + delay).
    const wallMoved = this._chaseWallQuarters(dt)

    if (!lightBusy && !wallMoved && !needsDraw) return

    if (lightBusy || needsDraw) {
      this.transitionElapsed = Math.min(
        LIGHT_TRANSITION_SECONDS,
        this.transitionElapsed + Math.max(0, dt),
      )
      const progress = this.transitionElapsed / LIGHT_TRANSITION_SECONDS
      const eased = progress * progress * (3 - 2 * progress)
      const keys = new Set([
        ...this.transitionFrom.keys(),
        ...this.transitionTo.keys(),
      ])
      this.displayedLightLevels.clear()
      for (const key of keys) {
        const from = this.transitionFrom.get(key) ?? 0
        const to = this.transitionTo.get(key) ?? 0
        const light = from + (to - from) * eased
        if (light > 0.01) this.displayedLightLevels.set(key, light)
      }
      this.displayedVisionX = this.visionFromX
        + (this.visionToX - this.visionFromX) * eased
      this.displayedVisionY = this.visionFromY
        + (this.visionToY - this.visionFromY) * eased
      this.world.displayedLightLevels = this.displayedLightLevels
    }

    this.world.lightDisplayRevision = (this.world.lightDisplayRevision ?? 0) + 1
    this._draw()
  }

  _viewerOffset(wallX, wallY, tileSize) {
    const player = this.world.player
    if (!player) {
      return {
        dx: this.displayedVisionX - (wallX + 0.5),
        dy: this.displayedVisionY - (wallY + 0.5),
      }
    }
    const cx = (player.posX + player.size / 2) / tileSize
    const cy = (player.posY + player.size / 2) / tileSize
    return {
      dx: cx - (wallX + 0.5),
      dy: cy - (wallY + 0.5),
    }
  }

  _computeWallQuarterTarget(x, y) {
    const { grid, tileSize, visibleTiles, discoveredTiles, player } = this.world
    if (
      isWallFullyEnclosed3x3(grid, x, y)
      || (this._doorWallKeys ??= collectDoorWallKeys(this.world)).has(`${x},${y}`)
    ) {
      return { [Q_NW]: 0, [Q_NE]: 0, [Q_SW]: 0, [Q_SE]: 0 }
    }
    const mask = mineWallNeighborMask(grid, x, y)
    const { dx, dy } = this._viewerOffset(x, y, tileSize)
    const visionX = player
      ? (player.posX + player.size / 2) / tileSize
      : this.displayedVisionX
    const visionY = player
      ? (player.posY + player.size / 2) / tileSize
      : this.displayedVisionY
    const levels = this.displayedLightLevels.size
      ? this.displayedLightLevels
      : this.world.lightLevels
    const { sampleFrontLight, wallSelfLight } = makeWallLightSampler({
      levels,
      grid,
      wallX: x,
      wallY: y,
      visibleTiles,
      discoveredTiles,
      visionX,
      visionY,
    })
    return wallQuarterLights(mask, dx, dy, sampleFrontLight, wallSelfLight)
  }

  _refreshWallQuarterTargets(instant) {
    const { grid, visionViewport } = this.world
    if (!grid) return

    const minX = visionViewport?.minX ?? 0
    const maxX = visionViewport?.maxX ?? grid.cols - 1
    const minY = visionViewport?.minY ?? 0
    const maxY = visionViewport?.maxY ?? grid.rows - 1

    const next = new Map()
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!isMineWallTile(grid.get(x, y))) continue
        next.set(tileKey(x, y), quartersToArray(this._computeWallQuarterTarget(x, y)))
      }
    }

    this.displayedWallQuarters = next
    this.world.displayedWallQuarters = this.displayedWallQuarters
  }

  /**
   * Persigue luces-objetivo de cuartos (viewer + fuentes) con delay exponencial.
   * @returns {boolean} si hubo cambio visible
   */
  _chaseWallQuarters(dt) {
    const { grid, visionViewport } = this.world
    if (!grid) return false

    const minX = visionViewport?.minX ?? 0
    const maxX = visionViewport?.maxX ?? grid.cols - 1
    const minY = visionViewport?.minY ?? 0
    const maxY = visionViewport?.maxY ?? grid.rows - 1
    const alpha = 1 - Math.exp(-Math.max(0, dt) / (LIGHT_TRANSITION_SECONDS * 0.45))
    let changed = false
    const seen = new Set()

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        if (!isMineWallTile(grid.get(x, y))) continue
        const key = tileKey(x, y)
        seen.add(key)
        const target = quartersToArray(this._computeWallQuarterTarget(x, y))
        let cur = this.displayedWallQuarters.get(key)
        if (!cur) {
          cur = new Float32Array(4)
          this.displayedWallQuarters.set(key, cur)
          changed = true
        }
        const curMax = Math.max(cur[0], cur[1], cur[2], cur[3])
        const tgtMax = Math.max(target[0], target[1], target[2], target[3])
        // De niebla/oscuro → lit: aparece al instante (el delay solo suaviza cambios después).
        if (curMax < 0.01 && tgtMax > 0.01) {
          cur.set(target)
          changed = true
        } else {
          for (let i = 0; i < 4; i++) {
            const next = cur[i] + (target[i] - cur[i]) * alpha
            if (Math.abs(next - cur[i]) > 0.002) changed = true
            cur[i] = next
          }
        }
      }
    }

    for (const key of [...this.displayedWallQuarters.keys()]) {
      if (seen.has(key)) continue
      this.displayedWallQuarters.delete(key)
      changed = true
    }

    this.world.displayedWallQuarters = this.displayedWallQuarters
    return changed
  }

  _drawFogCell(x, y, tileSize, light, discovered, px, py) {
    const fogAlphaBase = discovered ? EXPLORED_FOG_ALPHA : 1
    const edge = visionEdgeDarken(Math.hypot(x + 0.5 - px, y + 0.5 - py))
    const litAlpha = fogAlphaForLight(light, discovered)
    const alpha = litAlpha + (fogAlphaBase - litAlpha) * edge
    if (alpha <= 0.02) return
    this.graphics.fillStyle(FOG_COLOR, Math.min(1, alpha))
    this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
  }

  _drawWallFogCell(x, y, tileSize, quarterArr, discovered) {
    const fogAlphaBase = discovered ? EXPLORED_FOG_ALPHA : 1
    const lights = arrayToQuarters(quarterArr ?? new Float32Array(4))
    const step = 1 / WALL_FOG_GRID
    const cell = tileSize / WALL_FOG_GRID

    for (let j = 0; j < WALL_FOG_GRID; j++) {
      for (let i = 0; i < WALL_FOG_GRID; i++) {
        const u = (i + 0.5) * step
        const v = (j + 0.5) * step
        const light = bilinearQuarterLight(
          lights, u, v, Q_NW, Q_NE, Q_SW, Q_SE,
        )
        // Luz de cuarto ya incluye fundido del piso; sin borde extra.
        const alpha = fogAlphaForLight(light, discovered)
        if (alpha <= 0.02) continue
        this.graphics.fillStyle(FOG_COLOR, Math.min(1, alpha))
        this.graphics.fillRect(
          x * tileSize + i * cell,
          y * tileSize + j * cell,
          cell + 0.5,
          cell + 0.5,
        )
      }
    }
    // Si todo está a 0, asegurar niebla de memoria/desconocido.
    const maxL = Math.max(
      lights[Q_NW], lights[Q_NE], lights[Q_SW], lights[Q_SE],
    )
    if (maxL <= 0.01 && fogAlphaBase > 0.02) {
      this.graphics.fillStyle(FOG_COLOR, Math.min(1, fogAlphaBase))
      this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
    }
  }

  _draw() {
    const {
      grid,
      tileSize,
      discoveredTiles,
      visionViewport,
    } = this.world
    this.graphics.clear()
    if (!grid) return

    const minX = visionViewport?.minX ?? 0
    const maxX = visionViewport?.maxX ?? grid.cols - 1
    const minY = visionViewport?.minY ?? 0
    const maxY = visionViewport?.maxY ?? grid.rows - 1
    const px = this.displayedVisionX
    const py = this.displayedVisionY

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
        const key = tileKey(x, y)
        const discovered = discoveredTiles.has(key)
        if (isMineWallTile(grid.get(x, y))) {
          const doorWalls = this._doorWallKeys ?? collectDoorWallKeys(this.world)
          this._doorWallKeys = doorWalls
          if (isWallFullyEnclosed3x3(grid, x, y) || doorWalls.has(key)) {
            // Interior de masa 3×3 o marco de puerta: tile entero negro.
            this.graphics.fillStyle(FOG_COLOR, 1)
            this.graphics.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
            continue
          }
          this._drawWallFogCell(
            x,
            y,
            tileSize,
            this.displayedWallQuarters.get(key),
            discovered,
          )
          continue
        }
        const light = this.displayedLightLevels.get(key) ?? 0
        this._drawFogCell(x, y, tileSize, light, discovered, px, py)
      }
    }
  }

  destroy() {
    this.graphics.destroy()
  }
}
