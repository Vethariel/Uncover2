import {
  TILE_DESTRUCTIBLE,
  TILE_EMPTY,
  TILE_PASS,
  TILE_WALL,
} from '../../config/constants.js'
import { TERRAIN_TILES, terrainTileFor } from '../../config/terrainTypes.js'
import {
  MINE_WALLS_TEXTURE,
  Q_NE,
  Q_NW,
  Q_SE,
  Q_SW,
  isMineWallTile,
  mineWallFrameIndex,
  mineWallNeighborMask,
  quarterLocalRect,
  wallIsRevealed,
  isWallFullyEnclosed3x3,
} from '../../config/mineWalls.js'
import { displayedLightWithVisionEdge } from '../../config/visionFog.js'
import { enemyLightTint, multiplyTint } from './enemyLighting.js'
import { collectDoorWallKeys, drawDoorPortal, drawDoorLightCircle, AMBER_GLOW } from './doorVisual.js'

const WALL_DEPTH = 0.5
/** Muro en niebla de memoria (descubierto, sin luz): sprite completo, casi negro. */
const WALL_MEMORY_TINT = 0x030304
/** Interior de masa 3×3: negro pleno. */
const WALL_ENCLOSED_TINT = 0x000000

const QUARTER_IDS = [Q_NW, Q_NE, Q_SW, Q_SE]

const TILE_COLORS = {
  [TILE_DESTRUCTIBLE]: 0xa87342,
  [TILE_PASS]: 0x3c8991,
}

const TERRAIN_TILE_COLORS = {
  [TERRAIN_TILES.outside.empty]: 0x8fa3b3,
  [TERRAIN_TILES.outside.wall]: 0x14181d,
  [TERRAIN_TILES.corridor.empty]: 0xa4b2ba,
  [TERRAIN_TILES.corridor.wall]: 0x21262a,
  [TERRAIN_TILES.entry.empty]: 0x97c0b4,
  [TERRAIN_TILES.entry.wall]: 0x18251f,
  [TERRAIN_TILES.exit.empty]: 0xc9bd92,
  [TERRAIN_TILES.exit.wall]: 0x272212,
  [TERRAIN_TILES.vein.empty]: 0xb3a1b5,
  [TERRAIN_TILES.vein.wall]: 0x241b23,
  [TERRAIN_TILES.den.empty]: 0xbe9f9a,
  [TERRAIN_TILES.den.wall]: 0x261513,
  [TERRAIN_TILES.mixed.empty]: 0x9fb4c4,
  [TERRAIN_TILES.mixed.wall]: 0x1b2229,
  [TERRAIN_TILES.relic.empty]: 0xa79fc9,
  [TERRAIN_TILES.relic.wall]: 0x1d1930,
  [TERRAIN_TILES.agora.empty]: 0xb4b5a2,
  [TERRAIN_TILES.agora.wall]: 0x212217,
}

// Destello de menas/fragmentos visibles: pulso breve cada SPARKLE_PERIOD.
const SPARKLE_PERIOD = 5.0
const SPARKLE_DURATION = 0.45
const CHEST_OPEN_ANIM = 'chest-open'
const CHEST_OPEN_DURATION_MS = 700
const CHEST_FRAME_CLOSED = 0
const CHEST_FRAME_OPEN = 6

export class TilemapView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    // Textura 128×128 seamless → se repite cada 4 tiles de 32.
    this.floor = null
    /** @type {Map<string, { quarters: Phaser.GameObjects.Image[] }>} */
    this.wallSprites = new Map()
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(1)
    // Encima de la niebla (depth 950): señala menas/fragmentos aún no visibles.
    this.sparkleGraphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(960)
    this.sparkleTimer = 0
    this.lastGridState = ''
    this.chestSprite = null
    this.chestOpenKey = null
    this._createChestAnimation()
    this.build()
  }

  _createChestAnimation() {
    if (this.scene.anims.exists(CHEST_OPEN_ANIM)) return
    this.scene.anims.create({
      key: CHEST_OPEN_ANIM,
      frames: this.scene.anims.generateFrameNumbers('chest', {
        start: CHEST_FRAME_CLOSED,
        end: CHEST_FRAME_OPEN,
      }),
      duration: CHEST_OPEN_DURATION_MS,
      repeat: 0,
    })
  }

  build() {
    this._drawGrid()
  }

  update(dt = 0) {
    const tablets = (this.world.puzzleTablets ?? [])
      .map((tablet) => `${tablet.x},${tablet.y}:${tablet.visual}`)
      .join(';')
    const chest = this.world.chest
      ? `${this.world.chest.x},${this.world.chest.y}:${this.world.chest.opened ? 1 : 0}`
      : ''
    const traps = (this.world.traps ?? [])
      .map((trap) => `${trap.id}:${trap.state}`)
      .join(';')
    const state = [
      this.world.grid.tiles.flat().join(''),
      this.world.visionRevision,
      this.world.lightDisplayRevision ?? 0,
      tablets,
      chest,
      traps,
    ].join('|')
    if (state !== this.lastGridState) this._drawGrid(state)

    this._syncWallLighting()
    this._syncChestSprite()
    this.sparkleTimer += dt
    this._drawSparkles()
  }

  destroy() {
    this.chestSprite?.destroy()
    this.chestSprite = null
    this.floor?.destroy()
    this.floor = null
    this._clearWallSprites()
    this.graphics.destroy()
    this.sparkleGraphics.destroy()
  }

  _clearWallSprites() {
    for (const entry of this.wallSprites.values()) {
      for (const img of entry.quarters) img.destroy()
    }
    this.wallSprites.clear()
  }

  _ensureFloor() {
    const { grid, tileSize } = this.world
    const w = grid.cols * tileSize
    const h = grid.rows * tileSize
    if (!this.floor) {
      this.floor = this.scene.add.tileSprite(0, 0, w, h, 'mineFloor')
        .setOrigin(0, 0)
        .setDepth(0)
      return
    }
    if (this.floor.width !== w || this.floor.height !== h) {
      this.floor.setSize(w, h)
    }
  }

  _makeWallImage(x, y, tileSize, frame) {
    return this.scene.add.image(x * tileSize, y * tileSize, MINE_WALLS_TEXTURE, frame)
      .setOrigin(0, 0)
      .setDepth(WALL_DEPTH)
  }

  _applyQuarterCrop(image, tileSize, quarter) {
    const local = quarterLocalRect(quarter)
    image.setCrop(
      local.u * tileSize,
      local.v * tileSize,
      local.w * tileSize,
      local.h * tileSize,
    )
  }

  _syncWallSprites() {
    const { grid, tileSize } = this.world
    const seen = new Set()

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        if (!isMineWallTile(grid.get(x, y))) continue
        const key = `${x},${y}`
        seen.add(key)
        const frame = mineWallFrameIndex(mineWallNeighborMask(grid, x, y), x, y)
        let entry = this.wallSprites.get(key)
        if (!entry) {
          const quarters = QUARTER_IDS.map((q) => {
            const img = this._makeWallImage(x, y, tileSize, frame)
            this._applyQuarterCrop(img, tileSize, q)
            return img
          })
          entry = { quarters }
          this.wallSprites.set(key, entry)
        } else {
          for (let i = 0; i < entry.quarters.length; i++) {
            const img = entry.quarters[i]
            img.setFrame(frame).setPosition(x * tileSize, y * tileSize)
            this._applyQuarterCrop(img, tileSize, QUARTER_IDS[i])
          }
        }
      }
    }

    for (const [key, entry] of this.wallSprites) {
      if (seen.has(key)) continue
      for (const img of entry.quarters) img.destroy()
      this.wallSprites.delete(key)
    }
  }

  _syncWallLighting() {
    const { grid, tileSize } = this.world
    const doorWalls = collectDoorWallKeys(this.world)

    for (const [key, entry] of this.wallSprites) {
      const [xs, ys] = key.split(',')
      const x = Number(xs)
      const y = Number(ys)

      if (doorWalls.has(key) || isWallFullyEnclosed3x3(grid, x, y)) {
        // Marco de puerta o masa interior: tile entero negro.
        entry.quarters[0].setCrop().setTint(WALL_ENCLOSED_TINT).setVisible(true)
        for (let i = 1; i < entry.quarters.length; i++) {
          entry.quarters[i].setVisible(false)
        }
        continue
      }

      if (!wallIsRevealed(this.world, x, y)) {
        for (const img of entry.quarters) img.setVisible(false)
        continue
      }

      const arr = this.world.displayedWallQuarters?.get(key)
      const lights = [
        arr?.[0] ?? 0,
        arr?.[1] ?? 0,
        arr?.[2] ?? 0,
        arr?.[3] ?? 0,
      ]
      const maxL = Math.max(...lights)

      if (maxL <= 0.01) {
        entry.quarters[0].setCrop().setTint(WALL_MEMORY_TINT).setVisible(true)
        for (let i = 1; i < entry.quarters.length; i++) {
          entry.quarters[i].setVisible(false)
        }
        continue
      }

      for (let i = 0; i < entry.quarters.length; i++) {
        const img = entry.quarters[i]
        this._applyQuarterCrop(img, tileSize, QUARTER_IDS[i])
        img.setTint(enemyLightTint(lights[i])).setVisible(true)
      }
    }
  }

  _drawGrid(state = this.world.grid.tiles.flat().join('')) {
    const {
      grid,
      tileSize,
      discoveredTiles,
      displayedLightLevels,
      lightLevels,
      player,
    } = this.world
    this._ensureFloor()
    this._syncWallSprites()
    const graphics = this.graphics
    graphics.clear()

    const levels = displayedLightLevels ?? lightLevels
    const visionX = player
      ? (player.posX + player.size / 2) / tileSize
      : 0
    const visionY = player
      ? (player.posY + player.size / 2) / tileSize
      : 0

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const tile = grid.get(x, y)
        const px = x * tileSize
        const py = y * tileSize

        // Suelo / muros con tileset: sin fill de color.
        if (tile === TILE_EMPTY || isMineWallTile(tile)) continue
        // Fog bajo (0.25): overlays en depth 1 no deben asomar en no descubierto.
        if (!discoveredTiles?.has(`${x},${y}`)) continue

        const region = this.world.terrainRegions?.get(x, y)
        const terrainTile = terrainTileFor(region, tile)
        let color = TILE_COLORS[tile]
          ?? TERRAIN_TILE_COLORS[terrainTile]
          ?? TERRAIN_TILE_COLORS[TERRAIN_TILES.outside.empty]

        if (tile === TILE_DESTRUCTIBLE) {
          const raw = levels?.get(`${x},${y}`) ?? 0
          const dist = Math.hypot(x + 0.5 - visionX, y + 0.5 - visionY)
          const light = displayedLightWithVisionEdge(raw, dist)
          color = multiplyTint(color, enemyLightTint(light))
        }

        graphics.fillStyle(color)
        graphics.fillRect(px, py, tileSize, tileSize)
        graphics.lineStyle(1, 0x101820, 0.38)
        graphics.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1)

        if (tile === TILE_DESTRUCTIBLE) {
          graphics.lineStyle(1, 0x4d2f22, 0.8)
          graphics.lineBetween(px + 3, py + 3, px + tileSize - 3, py + tileSize - 3)
          graphics.lineBetween(px + tileSize - 3, py + 3, px + 3, py + tileSize - 3)
        } else if (tile === TILE_PASS) {
          graphics.lineStyle(1, 0xb9e8e7, 0.6)
          graphics.lineBetween(px + 3, py + tileSize / 2, px + tileSize - 3, py + tileSize / 2)
        }
      }
    }

    this._drawGeneratedContent(graphics, tileSize)
    this.lastGridState = state
    this._syncWallLighting()
  }

  _tileDiscovered(x, y) {
    return this.world.discoveredTiles?.has(`${x},${y}`) ?? false
  }

  _drawGeneratedContent(graphics, tileSize) {
    const resourceColors = {
      bronze: 0xc77b3f,
      iron: 0xb9c0c7,
      crystal: 0x78d7e8,
    }

    for (const resource of this.world.resourceSpawns ?? []) {
      if (this.world.grid.get(resource.x, resource.y) !== TILE_DESTRUCTIBLE) continue
      if (!this._tileDiscovered(resource.x, resource.y)) continue
      const color = resourceColors[resource.material] ?? 0xffffff
      graphics.fillStyle(color, 0.9)
      graphics.fillCircle(
        resource.x * tileSize + tileSize / 2,
        resource.y * tileSize + tileSize / 2,
        tileSize * 0.16,
      )
    }

    for (const fragment of this.world.recipeFragmentSpawns ?? []) {
      if (this.world.grid.get(fragment.x, fragment.y) !== TILE_WALL) continue
      if (!this._tileDiscovered(fragment.x, fragment.y)) continue
      drawDoorLightCircle(graphics, fragment.x, fragment.y, tileSize, AMBER_GLOW)
    }

    for (const tablet of this.world.puzzleTablets ?? []) {
      if (!this._tileDiscovered(tablet.x, tablet.y)) continue
      const px = tablet.x * tileSize
      const py = tablet.y * tileSize
      const inset = 4 + Math.max(0, 3 - tablet.order)
      const base = tablet.visual === 'on' ? 0xc9a35a : 0x6a6254
      graphics.fillStyle(base, 0.9)
      graphics.fillRect(px + inset, py + inset, tileSize - inset * 2, tileSize - inset * 2)
      graphics.lineStyle(1, 0xb08d57, 0.85)
      graphics.strokeRect(px + inset, py + inset, tileSize - inset * 2, tileSize - inset * 2)
      // Marca de orden (1..N).
      graphics.fillStyle(0x1a1f18, 0.8)
      graphics.fillCircle(px + tileSize / 2, py + tileSize / 2, 2 + tablet.order * 0.6)
    }

    for (const trap of this.world.traps ?? []) {
      if (trap.state === 'disabled') continue
      if (!this._tileDiscovered(trap.plate.x, trap.plate.y)) continue
      const platePx = trap.plate.x * tileSize
      const platePy = trap.plate.y * tileSize
      graphics.fillStyle(0x8a4f3a, 0.75)
      graphics.fillRect(platePx + 5, platePy + 5, tileSize - 10, tileSize - 10)
      graphics.lineStyle(1, 0xff9f6b, 0.8)
      graphics.strokeRect(platePx + 5, platePy + 5, tileSize - 10, tileSize - 10)

      const lx = trap.launcher.x * tileSize + tileSize / 2
      const ly = trap.launcher.y * tileSize + tileSize / 2
      graphics.fillStyle(0x4a5560, 0.95)
      graphics.fillCircle(lx, ly, tileSize * 0.18)
      graphics.lineStyle(2, 0xc8d0d8, 0.9)
      graphics.lineBetween(
        lx,
        ly,
        lx + trap.dir.x * tileSize * 0.28,
        ly + trap.dir.y * tileSize * 0.28,
      )
    }

    for (const light of this.world.wallLightSpawns ?? []) {
      // Solo se ve la fuente si su tile está dentro de la visión actual.
      // Fuera del radio puede iluminar el área, pero la antorcha permanece oculta.
      const lightKey = `${light.x},${light.y}`
      if (!this.world.visibleTiles?.has(lightKey)) continue

      const px = light.x * tileSize
      const py = light.y * tileSize
      const cx = px + tileSize / 2
      const cy = py + tileSize / 2
      let ox = 0
      let oy = 0
      if (light.orientation === 'east') ox = tileSize * 0.22
      else if (light.orientation === 'west') ox = -tileSize * 0.22
      else if (light.orientation === 'south') oy = tileSize * 0.22
      else if (light.orientation === 'north') oy = -tileSize * 0.22

      graphics.fillStyle(0xffd27a, 0.9)
      graphics.fillCircle(cx + ox, cy + oy, tileSize * 0.12)
      graphics.lineStyle(2, 0x8a6b3f, 0.9)
      graphics.lineBetween(cx, cy, cx + ox, cy + oy)
    }

    this._drawDoor(graphics, this.world.entryDoor, tileSize, 'entry')
    this._drawDoor(graphics, this.world.exitDoor, tileSize, 'exit')
  }

  _syncChestSprite() {
    const chest = this.world.chest
    if (!chest) {
      this.chestSprite?.destroy()
      this.chestSprite = null
      this.chestOpenKey = null
      return
    }

    const tileSize = this.world.tileSize
    const key = `${chest.x},${chest.y}`
    if (!this.chestSprite) {
      this.chestSprite = this.scene.add.sprite(0, 0, 'chest', CHEST_FRAME_CLOSED)
        .setOrigin(0.5, 0.5)
        .setDepth(5)
    }

    this.chestSprite.setPosition(
      chest.x * tileSize + tileSize / 2,
      chest.y * tileSize + tileSize / 2,
    )
    this.chestSprite.setVisible(this._tileDiscovered(chest.x, chest.y))

    if (!chest.opened) {
      this.chestOpenKey = null
      if (this.chestSprite.anims.isPlaying) this.chestSprite.anims.stop()
      this.chestSprite.setTexture('chest', CHEST_FRAME_CLOSED)
      return
    }

    if (this.chestOpenKey === key) return
    this.chestOpenKey = key
    this.chestSprite.play(CHEST_OPEN_ANIM)
  }

  _drawSparkles() {
    const graphics = this.sparkleGraphics
    graphics.clear()

    const phase = this.sparkleTimer % SPARKLE_PERIOD
    if (phase > SPARKLE_DURATION) return

    const visible = this.world.visibleTiles ?? new Set()

    // Fade in-out del pulso (0 → 1 → 0).
    const t = phase / SPARKLE_DURATION
    const intensity = Math.sin(t * Math.PI)
    const alpha = 0.35 * intensity
    const tileSize = this.world.tileSize
    const radius = tileSize * (0.2 + 0.16 * intensity)

    const targets = []
    for (const resource of this.world.resourceSpawns ?? []) {
      if (this.world.grid.get(resource.x, resource.y) !== TILE_DESTRUCTIBLE) continue
      targets.push(resource)
    }
    for (const fragment of this.world.recipeFragmentSpawns ?? []) {
      if (this.world.grid.get(fragment.x, fragment.y) !== TILE_WALL) continue
      targets.push(fragment)
    }

    for (const target of targets) {
      // Solo destellan los que la niebla aún oculta; al hacerse visibles cesan.
      if (visible.has(`${target.x},${target.y}`)) continue
      const cx = target.x * tileSize + tileSize / 2
      const cy = target.y * tileSize + tileSize / 2
      graphics.fillStyle(0xffffff, alpha)
      graphics.fillCircle(cx, cy, radius)
      graphics.fillStyle(0xffffff, Math.min(1, alpha * 2))
      graphics.fillCircle(cx, cy, radius * 0.4)
    }
  }

  _drawDoor(graphics, door, tileSize, kind) {
    if (!door) return
    const center = door.trigger ?? door.center
    const frame = [
      ...(door.sideTiles ?? []),
      ...(door.backingTiles ?? []),
      ...(door.tiles ?? []).filter(
        (t) => !center || t.x !== center.x || t.y !== center.y,
      ),
    ]
    const anyFrame = frame.some((t) => this._tileDiscovered(t.x, t.y))
    const centerOk = center && this._tileDiscovered(center.x, center.y)
    if (!anyFrame && !centerOk) return
    drawDoorPortal(graphics, door, tileSize, kind)
  }
}
