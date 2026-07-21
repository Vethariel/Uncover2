import { TILE_WALL } from '../../config/constants.js'
import {
  createPlayerSprite,
  ensurePlayerLocomotionAnims,
  playPlayerIdle,
  syncPlayerLocomotion,
} from './playerLocomotion.js'

const FLOOR = 0x3a4038
const WALL = 0x1a1f18
const FURNACE = 0xb85c38
const ANVIL = 0x7a8490
const DOOR = 0xffc857

export class WorkshopView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
    this.npcNodes = []
    this._drawStatic()

    ensurePlayerLocomotionAnims(scene)
    this.playerSprite = createPlayerSprite(scene, 10)
    this.lastPlayerPosition = null
    this.lastPlayerPosition = syncPlayerLocomotion(
      this.playerSprite,
      world.player,
      null,
    )
  }

  update() {
    this.lastPlayerPosition = syncPlayerLocomotion(
      this.playerSprite,
      this.world.player,
      this.lastPlayerPosition,
    )
  }

  freezePlayerIdle() {
    const player = this.world.player
    if (!player || !this.playerSprite) return
    playPlayerIdle(this.playerSprite, player)
    this.lastPlayerPosition = { x: player.posX, y: player.posY }
  }

  destroy() {
    this.graphics.destroy()
    this.playerSprite.destroy()
    for (const node of this.npcNodes) node.destroy()
    this.npcNodes = []
  }

  _drawStatic() {
    const { grid, tileSize, stations, exitDoor, npcs } = this.world
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
      station._labelAnchor = { x: cx, y: cy }
    }

    for (const tile of exitDoor.tiles) {
      g.fillStyle(DOOR)
      g.fillRect(tile.x * tileSize + 4, tile.y * tileSize + 8, tileSize - 8, tileSize - 12)
    }

    for (const node of this.npcNodes) node.destroy()
    this.npcNodes = []
    for (const npc of npcs ?? []) {
      const cx = npc.tile.x * tileSize + tileSize / 2
      const cy = npc.tile.y * tileSize + tileSize / 2
      const body = this.scene.add.circle(cx, cy, tileSize * 0.32, npc.color ?? 0x888888, 1)
        .setStrokeStyle(2, 0x1a1f18, 0.9)
        .setDepth(5)
      const label = this.scene.add.text(cx, cy - tileSize * 0.55, npc.label, {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#ffffff',
        backgroundColor: '#111820cc',
        padding: { x: 3, y: 1 },
      }).setOrigin(0.5, 1).setDepth(6)
      this.npcNodes.push(body, label)
    }
  }
}
