import {
  HUD_HEIGHT,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../config/constants.js'

// Ventana de tiles alrededor del jugador (impar para centrarlo exacto).
const WINDOW_TILES_X = 41
const WINDOW_TILES_Y = 31
const PIXELS_PER_TILE = 2
const MARGIN = 6

const PANEL_COLOR = 0x0a0d12
const BORDER_COLOR = 0x53616d
const FLOOR_COLOR = 0x3d4650
const WALL_COLOR = 0x161b21
const DESTRUCTIBLE_COLOR = 0x6b5335
const PLAYER_COLOR = 0x4ea5ff
const ENTRY_COLOR = 0x3c8991
const EXIT_COLOR = 0xffc857
const DEBUG_ALWAYS_SHOW_EXIT = true

export class MinimapView {
  constructor(scene, world) {
    this.world = world

    const width = WINDOW_TILES_X * PIXELS_PER_TILE
    const height = WINDOW_TILES_Y * PIXELS_PER_TILE
    this.originX = scene.scale.width - width - MARGIN
    this.originY = HUD_HEIGHT + MARGIN
    this.width = width
    this.height = height

    this.graphics = scene.add.graphics({ x: 0, y: 0 })
      .setScrollFactor(0)
      .setDepth(990)
    this.lastSignature = ''
    this.update()
  }

  update() {
    const { player, visionRevision } = this.world
    if (!player) return

    const signature = `${player.tileX},${player.tileY}|${visionRevision}`
    if (signature === this.lastSignature) return
    this.lastSignature = signature

    this._draw()
  }

  _draw() {
    const { grid, player, discoveredTiles } = this.world
    const graphics = this.graphics
    graphics.clear()

    graphics.fillStyle(PANEL_COLOR, 0.92)
    graphics.fillRect(this.originX, this.originY, this.width, this.height)

    const halfX = Math.floor(WINDOW_TILES_X / 2)
    const halfY = Math.floor(WINDOW_TILES_Y / 2)

    for (let wy = 0; wy < WINDOW_TILES_Y; wy++) {
      for (let wx = 0; wx < WINDOW_TILES_X; wx++) {
        const tileX = player.tileX - halfX + wx
        const tileY = player.tileY - halfY + wy
        if (!grid.inBounds(tileX, tileY)) continue
        if (!discoveredTiles.has(`${tileX},${tileY}`)) continue

        const tile = grid.get(tileX, tileY)
        let color = FLOOR_COLOR
        if (tile === TILE_WALL) color = WALL_COLOR
        else if (tile === TILE_DESTRUCTIBLE) color = DESTRUCTIBLE_COLOR

        graphics.fillStyle(color, 1)
        graphics.fillRect(
          this.originX + wx * PIXELS_PER_TILE,
          this.originY + wy * PIXELS_PER_TILE,
          PIXELS_PER_TILE,
          PIXELS_PER_TILE,
        )
      }
    }

    this._drawDoorMarker(graphics, this.world.entryDoor, ENTRY_COLOR, halfX, halfY)
    this._drawDoorMarker(
      graphics,
      this.world.exitDoor,
      EXIT_COLOR,
      halfX,
      halfY,
      DEBUG_ALWAYS_SHOW_EXIT,
    )

    // Jugador fijo en el centro; el mapa se desplaza bajo él.
    graphics.fillStyle(PLAYER_COLOR, 1)
    graphics.fillRect(
      this.originX + halfX * PIXELS_PER_TILE,
      this.originY + halfY * PIXELS_PER_TILE,
      PIXELS_PER_TILE,
      PIXELS_PER_TILE,
    )

    graphics.lineStyle(1, BORDER_COLOR, 1)
    graphics.strokeRect(
      this.originX + 0.5,
      this.originY + 0.5,
      this.width - 1,
      this.height - 1,
    )
  }

  _drawDoorMarker(graphics, door, color, halfX, halfY, alwaysVisible = false) {
    if (!door) return
    const marker = door.trigger
      ?? door.triggerTiles?.[0]
      ?? door.center
      ?? door.tiles?.[Math.floor((door.tiles?.length ?? 1) / 2)]
    if (!marker) return

    const doorTiles = [
      ...(door.tiles ?? []),
      ...(door.triggerTiles ?? []),
      marker,
    ]
    const discovered = doorTiles.some((tile) => (
      this.world.discoveredTiles.has(`${tile.x},${tile.y}`)
    ))
    if (!alwaysVisible && !discovered) return

    let wx = marker.x - this.world.player.tileX + halfX
    let wy = marker.y - this.world.player.tileY + halfY
    const outside = wx < 0 || wy < 0 || wx >= WINDOW_TILES_X || wy >= WINDOW_TILES_Y
    if (outside && !alwaysVisible) return
    if (outside) {
      // Debug: mantener el marcador de salida en el borde indicando su dirección.
      wx = Math.max(1, Math.min(WINDOW_TILES_X - 2, wx))
      wy = Math.max(1, Math.min(WINDOW_TILES_Y - 2, wy))
    }

    graphics.fillStyle(color, 1)
    graphics.fillRect(
      this.originX + wx * PIXELS_PER_TILE - 1,
      this.originY + wy * PIXELS_PER_TILE - 1,
      PIXELS_PER_TILE + 2,
      PIXELS_PER_TILE + 2,
    )
  }

  destroy() {
    this.graphics.destroy()
  }
}
