import { DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP, TILE_WALL } from '../../config/constants.js'

const FLOOR = 0x3a4038
const WALL = 0x1a1f18
const FURNACE = 0xb85c38
const ANVIL = 0x7a8490
const DOOR = 0xffc857
const PLAYER = 0x4ea5ff
const PLAYER_DIR = 0xd9efff

export class WorkshopView {
  constructor(scene, world) {
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
    this._drawStatic()
    this.playerGraphics = scene.add.graphics({ x: 0, y: 0 })
  }

  update() {
    this.playerGraphics.clear()
    const player = this.world.player
    if (!player) return
    const cx = player.posX + player.size / 2
    const cy = player.posY + player.size / 2
    this.playerGraphics.fillStyle(PLAYER).fillCircle(cx, cy, player.size / 2)
    const dir = this._dir(player.facing)
    this.playerGraphics.lineStyle(2, PLAYER_DIR)
    this.playerGraphics.lineBetween(cx, cy, cx + dir.x * 6, cy + dir.y * 6)
  }

  destroy() {
    this.graphics.destroy()
    this.playerGraphics.destroy()
  }

  _drawStatic() {
    const { grid, tileSize, stations, exitDoor } = this.world
    const g = this.graphics
    g.clear()

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const tile = grid.get(x, y)
        g.fillStyle(tile === TILE_WALL ? WALL : FLOOR)
        g.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    for (const station of stations) {
      const color = station.kind === 'furnace' ? FURNACE : ANVIL
      for (const tile of station.tiles) {
        g.fillStyle(color)
        g.fillRect(tile.x * tileSize + 2, tile.y * tileSize + 2, tileSize - 4, tileSize - 4)
      }
      const cx = (station.tiles[0].x + 1) * tileSize
      const cy = station.tiles[0].y * tileSize - 4
      // Labels drawn via scene text in WorkshopScene for crispness.
      station._labelAnchor = { x: cx, y: cy }
    }

    for (const tile of exitDoor.tiles) {
      g.fillStyle(DOOR)
      g.fillRect(tile.x * tileSize + 4, tile.y * tileSize + 8, tileSize - 8, tileSize - 12)
    }
  }

  _dir(facing) {
    switch (facing) {
      case DIR_UP: return { x: 0, y: -1 }
      case DIR_DOWN: return { x: 0, y: 1 }
      case DIR_LEFT: return { x: -1, y: 0 }
      case DIR_RIGHT: return { x: 1, y: 0 }
      default: return { x: 0, y: 1 }
    }
  }
}
