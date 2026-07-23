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
import {
  MINE_PROPS_TEXTURE,
  genericDestructibleFrame,
  resourceBlockFrame,
  MINE_PROP_FRAME,
} from '../../config/mineProps.js'
import {
  TORCH_TEXTURE,
  ensureTorchAnims,
} from '../../config/torch.js'
import {
  RAIL_TEXTURE,
  railRotation,
} from '../../config/rail.js'
import { enemyLightTint } from './enemyLighting.js'
import {
  AMBER_GLOW,
  collectDoorWallKeys,
  drawDoorLightCircle,
  drawDoorPortal,
} from './doorVisual.js'

const WALL_DEPTH = 0.5
const RAIL_DEPTH = 0.35
const PROP_DEPTH = 0.55
const TORCH_DEPTH = 0.6
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
    /** @type {Map<string, Phaser.GameObjects.Image>} */
    this.propSprites = new Map()
    /** @type {Map<string, Phaser.GameObjects.Sprite>} */
    this.torchSprites = new Map()
    /** @type {Map<string, Phaser.GameObjects.Image>} */
    this.railSprites = new Map()
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(1)
    // Encima de la niebla (depth 950): señala menas/fragmentos aún no visibles.
    this.sparkleGraphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(960)
    this.sparkleTimer = 0
    this.lastGridState = ''
    this.chestSprite = null
    this.chestOpenKey = null
    this._createChestAnimation()
    ensureTorchAnims(scene)
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
    this._syncMineProps()
    this._syncRailSprites()
    this._syncTorchSprites()
    this._syncChestSprite()
    this._syncFloor()
    this.sparkleTimer += dt
    this._drawSparkles()
  }

  destroy() {
    this.chestSprite?.destroy()
    this.chestSprite = null
    this.floor?.destroy()
    this.floor = null
    this._clearWallSprites()
    this._clearPropSprites()
    this._clearRailSprites()
    this._clearTorchSprites()
    this.graphics.destroy()
    this.sparkleGraphics.destroy()
  }

  _clearWallSprites() {
    for (const entry of this.wallSprites.values()) {
      for (const img of entry.quarters) img.destroy()
    }
    this.wallSprites.clear()
  }

  _clearPropSprites() {
    for (const img of this.propSprites.values()) img.destroy()
    this.propSprites.clear()
  }

  _clearTorchSprites() {
    for (const sprite of this.torchSprites.values()) sprite.destroy()
    this.torchSprites.clear()
  }

  _clearRailSprites() {
    for (const img of this.railSprites.values()) img.destroy()
    this.railSprites.clear()
  }

  _ensureFloor() {
    const cam = this.scene.cameras.main
    // Solo el viewport: tileSprite a mapa completo se “desliza” al hacer scroll.
    const w = Math.ceil(cam.width) + 2
    const h = Math.ceil(cam.height) + 2
    if (!this.floor) {
      this.floor = this.scene.add.tileSprite(0, 0, w, h, 'mineFloor')
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setDepth(0)
      return
    }
    if (this.floor.width !== w || this.floor.height !== h) {
      this.floor.setSize(w, h)
    }
  }

  /** Patrón del piso anclado al mundo (coincide con el scroll que usará la cámara). */
  _syncFloor() {
    this._ensureFloor()
    const cam = this.scene.cameras.main
    const player = this.world.player
    let scrollX = cam.scrollX
    let scrollY = cam.scrollY
    if (player) {
      const halfW = cam.width * 0.5
      const halfH = cam.height * 0.5
      const bounds = cam.getBounds()
      const cx = player.posX + player.size / 2
      const cy = player.posY + player.size / 2
      const maxX = Math.max(bounds.x, bounds.right - cam.width)
      const maxY = Math.max(bounds.y, bounds.bottom - cam.height)
      scrollX = Math.min(maxX, Math.max(bounds.x, cx - halfW))
      scrollY = Math.min(maxY, Math.max(bounds.y, cy - halfH))
    }
    // roundPixels de la cámara: el patrón debe usar el mismo scroll entero.
    this.floor.setPosition(0, 0)
    this.floor.tilePositionX = Math.round(scrollX)
    this.floor.tilePositionY = Math.round(scrollY)
  }

  _viewportBounds() {
    const { grid, visionViewport } = this.world
    if (!grid) {
      return { minX: 0, maxX: -1, minY: 0, maxY: -1 }
    }
    return {
      minX: visionViewport?.minX ?? 0,
      maxX: visionViewport?.maxX ?? grid.cols - 1,
      minY: visionViewport?.minY ?? 0,
      maxY: visionViewport?.maxY ?? grid.rows - 1,
    }
  }

  _inViewport(x, y, vp = this._viewportBounds()) {
    return x >= vp.minX && x <= vp.maxX && y >= vp.minY && y <= vp.maxY
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
        // Relleno 3×3: la niebla lo pinta negro; sin GameObjects.
        if (isWallFullyEnclosed3x3(grid, x, y)) continue
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
    if (!grid) return
    const doorWalls = collectDoorWallKeys(this.world)
    const vp = this._viewportBounds()

    for (let y = vp.minY; y <= vp.maxY; y++) {
      for (let x = vp.minX; x <= vp.maxX; x++) {
        const key = `${x},${y}`
        const entry = this.wallSprites.get(key)
        if (!entry) continue

        if (doorWalls.has(key)) {
          // Marco de puerta: tile entero negro.
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
    this._syncFloor()
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

        // Suelo / muros / destructibles con sprites: sin fill de color.
        if (tile === TILE_EMPTY || isMineWallTile(tile) || tile === TILE_DESTRUCTIBLE) continue
        // Fog bajo (0.25): overlays en depth 1 no deben asomar en no descubierto.
        if (!discoveredTiles?.has(`${x},${y}`)) continue

        const region = this.world.terrainRegions?.get(x, y)
        const terrainTile = terrainTileFor(region, tile)
        const color = TILE_COLORS[tile]
          ?? TERRAIN_TILE_COLORS[terrainTile]
          ?? TERRAIN_TILE_COLORS[TERRAIN_TILES.outside.empty]

        graphics.fillStyle(color)
        graphics.fillRect(px, py, tileSize, tileSize)
        graphics.lineStyle(1, 0x101820, 0.38)
        graphics.strokeRect(px + 0.5, py + 0.5, tileSize - 1, tileSize - 1)

        if (tile === TILE_PASS) {
          graphics.lineStyle(1, 0xb9e8e7, 0.6)
          graphics.lineBetween(px + 3, py + tileSize / 2, px + tileSize - 3, py + tileSize / 2)
        }
      }
    }

    this._drawGeneratedContent(graphics, tileSize)
    this.lastGridState = state
    this._syncWallLighting()
    this._syncMineProps()
  }

  _tileDiscovered(x, y) {
    return this.world.discoveredTiles?.has(`${x},${y}`) ?? false
  }

  _ensurePropImage(key, frame, x, y, tileSize) {
    let img = this.propSprites.get(key)
    if (!img) {
      img = this.scene.add.image(0, 0, MINE_PROPS_TEXTURE, frame)
        .setOrigin(0, 0)
        .setDepth(PROP_DEPTH)
      this.propSprites.set(key, img)
    }
    img.setFrame(frame)
      .setPosition(x * tileSize, y * tileSize)
      .setDisplaySize(tileSize, tileSize)
      .setVisible(true)
    return img
  }

  _syncMineProps() {
    const {
      grid,
      tileSize,
      discoveredTiles,
      displayedLightLevels,
      lightLevels,
      player,
    } = this.world
    if (!grid) return

    const levels = displayedLightLevels ?? lightLevels
    const visionX = player
      ? (player.posX + player.size / 2) / tileSize
      : 0
    const visionY = player
      ? (player.posY + player.size / 2) / tileSize
      : 0
    const vp = this._viewportBounds()
    const seen = new Set()
    const resourceAt = new Map(
      (this.world.resourceSpawns ?? []).map((r) => [`${r.x},${r.y}`, r]),
    )

    for (let y = vp.minY; y <= vp.maxY; y++) {
      for (let x = vp.minX; x <= vp.maxX; x++) {
        if (grid.get(x, y) !== TILE_DESTRUCTIBLE) continue
        const key = `block:${x},${y}`
        if (!discoveredTiles?.has(`${x},${y}`)) continue
        const resource = resourceAt.get(`${x},${y}`)
        const frame = resource
          ? resourceBlockFrame(resource.material)
          : genericDestructibleFrame(x, y)
        const img = this._ensurePropImage(key, frame, x, y, tileSize)
        seen.add(key)
        const raw = levels?.get(`${x},${y}`) ?? 0
        const dist = Math.hypot(x + 0.5 - visionX, y + 0.5 - visionY)
        const light = displayedLightWithVisionEdge(raw, dist)
        img.setTint(enemyLightTint(light))
      }
    }

    for (const trap of this.world.traps ?? []) {
      if (trap.state === 'disabled') continue
      const { x, y } = trap.plate

      if (this._inViewport(x, y, vp) && discoveredTiles?.has(`${x},${y}`)) {
        const key = `plate:${trap.id}`
        const active = trap.state === 'warning'
          || (trap.occupiedLastFrame && trap.state !== 'idle')
        const frame = active
          ? MINE_PROP_FRAME.plateActive
          : MINE_PROP_FRAME.plateIdle
        const img = this._ensurePropImage(key, frame, x, y, tileSize)
        seen.add(key)
        const raw = levels?.get(`${x},${y}`) ?? 0
        const dist = Math.hypot(x + 0.5 - visionX, y + 0.5 - visionY)
        const light = displayedLightWithVisionEdge(raw, dist)
        img.setTint(enemyLightTint(Math.max(light, 2)))
      }

      // Launcher: solo visible mientras la trampa está activada.
      if (trap.state === 'warning' || trap.state === 'fired') {
        const lx = trap.launcher.x
        const ly = trap.launcher.y
        if (!this._inViewport(lx, ly, vp)) continue
        const lTile = `${lx},${ly}`
        discoveredTiles?.add(lTile)
        const lKey = `launcher:${trap.id}`
        const lImg = this._ensurePropImage(
          lKey,
          MINE_PROP_FRAME.launcher,
          lx,
          ly,
          tileSize,
        )
        seen.add(lKey)
        const lRaw = levels?.get(lTile) ?? 0
        const lDist = Math.hypot(lx + 0.5 - visionX, ly + 0.5 - visionY)
        const lLight = displayedLightWithVisionEdge(lRaw, lDist)
        lImg.setTint(enemyLightTint(Math.max(lLight, 2)))
      }
    }

    for (const [key, img] of this.propSprites) {
      if (seen.has(key)) continue
      img.destroy()
      this.propSprites.delete(key)
    }
  }

  _drawGeneratedContent(graphics, tileSize) {
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
      graphics.fillStyle(0x1a1f18, 0.8)
      graphics.fillCircle(px + tileSize / 2, py + tileSize / 2, 2 + tablet.order * 0.6)
    }

    // Trampas: placa siempre; launcher solo al activar (sprites).
    // Antorchas de suelo: sprites animados en _syncTorchSprites.

    this._drawDoor(graphics, this.world.entryDoor, tileSize, 'entry')
    this._drawDoor(graphics, this.world.exitDoor, tileSize, 'exit')
  }

  _syncRailSprites() {
    const {
      tileSize,
      discoveredTiles,
      displayedLightLevels,
      lightLevels,
      player,
    } = this.world
    const vp = this._viewportBounds()
    const levels = displayedLightLevels ?? lightLevels
    const visionX = player
      ? (player.posX + player.size / 2) / tileSize
      : 0
    const visionY = player
      ? (player.posY + player.size / 2) / tileSize
      : 0
    const seen = new Set()

    for (const rail of this.world.railSpawns ?? []) {
      if (!this._inViewport(rail.x, rail.y, vp)) continue
      if (!discoveredTiles?.has(`${rail.x},${rail.y}`)) continue
      const key = `${rail.x},${rail.y}`
      seen.add(key)
      let img = this.railSprites.get(key)
      if (!img) {
        img = this.scene.add.image(0, 0, RAIL_TEXTURE)
          .setOrigin(0.5, 0.5)
          .setDepth(RAIL_DEPTH)
        this.railSprites.set(key, img)
      }
      const raw = levels?.get(key) ?? 0
      const dist = Math.hypot(rail.x + 0.5 - visionX, rail.y + 0.5 - visionY)
      const light = displayedLightWithVisionEdge(raw, dist)
      img
        .setPosition(
          rail.x * tileSize + tileSize / 2,
          rail.y * tileSize + tileSize / 2,
        )
        .setDisplaySize(tileSize, tileSize)
        .setRotation(railRotation(rail.orientation))
        .setTint(enemyLightTint(Math.max(light, 1)))
        .setVisible(true)
    }

    for (const [key, img] of this.railSprites) {
      if (seen.has(key)) continue
      img.destroy()
      this.railSprites.delete(key)
    }
  }

  _syncTorchSprites() {
    const { tileSize, visibleTiles } = this.world
    const vp = this._viewportBounds()
    const seen = new Set()

    for (const light of this.world.wallLightSpawns ?? []) {
      const key = `${light.x},${light.y}`
      // Solo se ve la fuente si su tile está en visión actual.
      if (!visibleTiles?.has(key)) continue
      if (!this._inViewport(light.x, light.y, vp)) continue

      seen.add(key)
      let sprite = this.torchSprites.get(key)
      if (!sprite) {
        sprite = this.scene.add.sprite(0, 0, TORCH_TEXTURE, 0)
          .setOrigin(0.5, 0.5)
          .setDepth(TORCH_DEPTH)
        this.torchSprites.set(key, sprite)
      }

      // Frame y luz comparten reloj (pico de intensidad en frame 4).
      sprite
        .setFrame(light.animFrame ?? 0)
        .setPosition(
          light.x * tileSize + tileSize / 2,
          light.y * tileSize + tileSize / 2,
        )
        .setDisplaySize(tileSize, tileSize)
        .setVisible(true)
    }

    for (const [key, sprite] of this.torchSprites) {
      if (seen.has(key)) continue
      sprite.destroy()
      this.torchSprites.delete(key)
    }
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
