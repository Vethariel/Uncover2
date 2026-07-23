import { TILE_WALL } from '../../config/constants.js'
import {
  createBrunSprite,
  placeBrunOnTile,
} from './brunIdle.js'
import {
  createExcavatorSprite,
  placeExcavatorOnTile,
} from './excavatorIdle.js'
import {
  createPlayerSprite,
  ensurePlayerLocomotionAnims,
  playPlayerIdle,
  syncPlayerLocomotion,
} from './playerLocomotion.js'
import {
  FONT_SIZE_HINT,
  textStyleBody,
} from '../../config/typography.js'

const FLOOR = 0x3a4038
const WALL = 0x1a1f18
const FURNACE = 0xb85c38
const ANVIL = 0x7a8490
const DOOR = 0xffc857

export class WorkshopView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(0)
    /** @type {{ body: Phaser.GameObjects.GameObject, label?: Phaser.GameObjects.Text, feetY: number }[]} */
    this.npcActors = []
    this._drawStatic()

    ensurePlayerLocomotionAnims(scene)
    this.playerSprite = createPlayerSprite(scene, 0)
    this.lastPlayerPosition = null
    this.lastPlayerPosition = syncPlayerLocomotion(
      this.playerSprite,
      world.player,
      null,
    )
    this._syncDepths()
  }

  update() {
    this.lastPlayerPosition = syncPlayerLocomotion(
      this.playerSprite,
      this.world.player,
      this.lastPlayerPosition,
    )
    this._syncDepths()
  }

  freezePlayerIdle() {
    const player = this.world.player
    if (!player || !this.playerSprite) return
    playPlayerIdle(this.playerSprite, player)
    this.lastPlayerPosition = { x: player.posX, y: player.posY }
    this._syncDepths()
  }

  destroy() {
    this.graphics.destroy()
    this.playerSprite.destroy()
    for (const actor of this.npcActors) {
      actor.body.destroy()
      actor.label?.destroy()
    }
    this.npcActors = []
  }

  /** Depth = pies en Y: quien está más abajo en pantalla tapa a quien está detrás. */
  _syncDepths() {
    const player = this.world.player
    if (player && this.playerSprite) {
      const feetY = player.posY + player.size
      this.playerSprite.setDepth(feetY)
    }
    for (const actor of this.npcActors) {
      actor.body.setDepth(actor.feetY)
      actor.label?.setDepth(actor.feetY + 0.1)
    }
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

    // NPCs bloquean como muro, pero el suelo sigue siendo suelo.
    for (const npc of npcs ?? []) {
      g.fillStyle(FLOOR)
      g.fillRect(
        npc.tile.x * tileSize,
        npc.tile.y * tileSize,
        tileSize,
        tileSize,
      )
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

    for (const actor of this.npcActors) {
      actor.body.destroy()
      actor.label?.destroy()
    }
    this.npcActors = []

    for (const npc of npcs ?? []) {
      const feetY = (npc.tile.y + 1) * tileSize
      const spriteNpc = npc.id === 'brun' || npc.kind === 'smith'
        ? { create: createBrunSprite, place: placeBrunOnTile }
        : (npc.id === 'excavator' || npc.kind === 'excavator')
          ? { create: createExcavatorSprite, place: placeExcavatorOnTile }
          : null

      if (spriteNpc) {
        const sprite = spriteNpc.create(this.scene, feetY)
        spriteNpc.place(sprite, npc.tile, tileSize)
        const label = this.scene.add.text(
          sprite.x,
          sprite.y - 50,
          npc.label,
          textStyleBody({
            fontSize: `${FONT_SIZE_HINT}px`,
            color: '#ffffff',
            backgroundColor: '#111820cc',
            padding: { x: 3, y: 1 },
          }),
        ).setOrigin(0.5, 1).setDepth(feetY + 0.1)
        this.npcActors.push({ body: sprite, label, feetY })
        continue
      }

      const cx = npc.tile.x * tileSize + tileSize / 2
      const cy = npc.tile.y * tileSize + tileSize / 2
      const body = this.scene.add.circle(cx, cy, tileSize * 0.32, npc.color ?? 0x888888, 1)
        .setStrokeStyle(2, 0x1a1f18, 0.9)
        .setDepth(feetY)
      const label = this.scene.add.text(
        cx,
        cy - tileSize * 0.55,
        npc.label,
        textStyleBody({
          fontSize: `${FONT_SIZE_HINT}px`,
          color: '#ffffff',
          backgroundColor: '#111820cc',
          padding: { x: 3, y: 1 },
        }),
      ).setOrigin(0.5, 1).setDepth(feetY + 0.1)
      this.npcActors.push({ body, label, feetY })
    }
  }
}
