import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
  TILE_PASS,
} from '../../config/constants.js'

const TILE_COLORS = {
  [TILE_EMPTY]: 0x263440,
  [TILE_WALL]: 0x64707a,
  [TILE_DESTRUCTIBLE]: 0xa87342,
  [TILE_PASS]: 0x3c8991,
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

        graphics.fillStyle(TILE_COLORS[tile] ?? TILE_COLORS[TILE_EMPTY])
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

    this.lastGridState = state
  }
}
