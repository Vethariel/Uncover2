import {
  TILE_DESTRUCTIBLE,
  TILE_PASS,
} from '../../config/constants.js'
import { TERRAIN_TILES, terrainTileFor } from '../../config/terrainTypes.js'

const TILE_COLORS = {
  [TILE_DESTRUCTIBLE]: 0xa87342,
  [TILE_PASS]: 0x3c8991,
}

const TERRAIN_TILE_COLORS = {
  [TERRAIN_TILES.outside.empty]: 0x263440,
  [TERRAIN_TILES.outside.wall]: 0x4d5862,
  [TERRAIN_TILES.corridor.empty]: 0x39434a,
  [TERRAIN_TILES.corridor.wall]: 0x737b80,
  [TERRAIN_TILES.entry.empty]: 0x2f4a43,
  [TERRAIN_TILES.entry.wall]: 0x5f766d,
  [TERRAIN_TILES.exit.empty]: 0x4c4430,
  [TERRAIN_TILES.exit.wall]: 0x7c704e,
  [TERRAIN_TILES.vein.empty]: 0x3e3540,
  [TERRAIN_TILES.vein.wall]: 0x755b70,
  [TERRAIN_TILES.den.empty]: 0x44302f,
  [TERRAIN_TILES.den.wall]: 0x744945,
  [TERRAIN_TILES.mixed.empty]: 0x34404a,
  [TERRAIN_TILES.mixed.wall]: 0x627584,
  [TERRAIN_TILES.relic.empty]: 0x373252,
  [TERRAIN_TILES.relic.wall]: 0x665c8d,
  [TERRAIN_TILES.agora.empty]: 0x3f4036,
  [TERRAIN_TILES.agora.wall]: 0x727361,
}

export class TilemapView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
    this.lastGridState = ''
    this.build()
  }

  build() {
    this._drawGrid()
  }

  update() {
    const state = this.world.grid.tiles.flat().join('')
    if (state !== this.lastGridState) this._drawGrid(state)
  }

  destroy() {
    this.graphics.destroy()
  }

  _drawGrid(state = this.world.grid.tiles.flat().join('')) {
    const { grid, tileSize } = this.world
    const graphics = this.graphics
    graphics.clear()

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const tile = grid.get(x, y)
        const px = x * tileSize
        const py = y * tileSize
        const region = this.world.terrainRegions?.get(x, y)
        const terrainTile = terrainTileFor(region, tile)
        const color = TILE_COLORS[tile]
          ?? TERRAIN_TILE_COLORS[terrainTile]
          ?? TERRAIN_TILE_COLORS[TERRAIN_TILES.outside.empty]

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
  }

  _drawGeneratedContent(graphics, tileSize) {
    const resourceColors = {
      bronze: 0xc77b3f,
      iron: 0xb9c0c7,
      crystal: 0x78d7e8,
    }

    for (const resource of this.world.resourceSpawns ?? []) {
      if (this.world.grid.get(resource.x, resource.y) !== TILE_DESTRUCTIBLE) continue
      const color = resourceColors[resource.material] ?? 0xffffff
      graphics.fillStyle(color, 0.9)
      graphics.fillCircle(
        resource.x * tileSize + tileSize / 2,
        resource.y * tileSize + tileSize / 2,
        tileSize * 0.16,
      )
    }

    for (const fragment of this.world.recipeFragmentSpawns ?? []) {
      const px = fragment.x * tileSize
      const py = fragment.y * tileSize
      graphics.fillStyle(0xd28cff, 0.95)
      graphics.fillTriangle(
        px + tileSize / 2, py + 5,
        px + tileSize - 5, py + tileSize - 5,
        px + 5, py + tileSize - 5,
      )
    }

    this._drawDoor(graphics, this.world.entryDoor, tileSize, 0x3c8991)
    this._drawDoor(graphics, this.world.exitDoor, tileSize, 0xffc857)
  }

  _drawDoor(graphics, door, tileSize, fillColor) {
    if (!door) return
    for (const tile of door.tiles) {
      const px = tile.x * tileSize
      const py = tile.y * tileSize
      graphics.lineStyle(2, 0xb08d57, 0.95)
      graphics.strokeRect(px + 1, py + 1, tileSize - 2, tileSize - 2)
    }
    const trigger = door.trigger ?? door.center
    graphics.fillStyle(fillColor, 0.45)
    graphics.fillRect(
      trigger.x * tileSize,
      trigger.y * tileSize,
      tileSize,
      tileSize,
    )
  }
}
