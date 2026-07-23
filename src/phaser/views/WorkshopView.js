import { TILE_EMPTY } from '../../config/constants.js'
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
  createFurnaceSprite,
  syncFurnaceSprite,
} from './furnaceSprite.js'
import {
  createAnvilSprite,
  syncAnvilSprite,
} from './anvilSprite.js'

const WALL = 0x1a1f18
const DOOR = 0xffc857

export class WorkshopView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    // Textura 128×128 seamless → se repite cada 4 tiles de 32.
    const { grid, tileSize } = world
    this.floor = scene.add.tileSprite(
      0,
      0,
      grid.cols * tileSize,
      grid.rows * tileSize,
      'workshopFloor',
    ).setOrigin(0, 0).setDepth(0)
    this.graphics = scene.add.graphics({ x: 0, y: 0 }).setDepth(1)
    this.furnaceSprite = null
    this.anvilSprite = null
    /** @type {{ body: Phaser.GameObjects.GameObject, feetY: number }[]} */
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

  update(furnaceJob = null, anvilJob = null) {
    syncFurnaceSprite(this.furnaceSprite, furnaceJob)
    syncAnvilSprite(this.anvilSprite, anvilJob)
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
    this.floor?.destroy()
    this.floor = null
    this.furnaceSprite?.destroy()
    this.furnaceSprite = null
    this.anvilSprite?.destroy()
    this.anvilSprite = null
    this.graphics.destroy()
    this.playerSprite.destroy()
    for (const actor of this.npcActors) {
      actor.body.destroy()
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
    }
  }

  _drawStatic() {
    const { grid, tileSize, stations, exitDoor, npcs } = this.world
    const g = this.graphics
    g.clear()

    const npcTiles = new Set(
      (npcs ?? []).map((npc) => `${npc.tile.x},${npc.tile.y}`),
    )
    const furnace = stations.find((s) => s.kind === 'furnace')
    const anvil = stations.find((s) => s.kind === 'anvil')

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        if (grid.get(x, y) === TILE_EMPTY) continue
        // NPCs: bloquean, pero el suelo se ve debajo del sprite.
        if (npcTiles.has(`${x},${y}`)) continue
        g.fillStyle(WALL)
        g.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
      }
    }

    this.furnaceSprite?.destroy()
    this.furnaceSprite = null
    if (furnace) {
      this.furnaceSprite = createFurnaceSprite(this.scene, furnace.origin)
      furnace._labelAnchor = {
        x: furnace.origin.x + furnace.size.w / 2,
        y: furnace.origin.y - 4,
      }
    }

    this.anvilSprite?.destroy()
    this.anvilSprite = null
    if (anvil) {
      this.anvilSprite = createAnvilSprite(this.scene, anvil.origin)
      anvil._labelAnchor = {
        x: anvil.origin.x + anvil.size.w / 2,
        y: anvil.origin.y - 4,
      }
    }

    for (const tile of exitDoor.tiles) {
      g.fillStyle(DOOR)
      g.fillRect(tile.x * tileSize + 4, tile.y * tileSize + 8, tileSize - 8, tileSize - 12)
    }

    for (const actor of this.npcActors) {
      actor.body.destroy()
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
        this.npcActors.push({ body: sprite, feetY })
        continue
      }

      const cx = npc.tile.x * tileSize + tileSize / 2
      const cy = npc.tile.y * tileSize + tileSize / 2
      const body = this.scene.add.circle(cx, cy, tileSize * 0.32, npc.color ?? 0x888888, 1)
        .setStrokeStyle(2, 0x1a1f18, 0.9)
        .setDepth(feetY)
      this.npcActors.push({ body, feetY })
    }
  }
}
