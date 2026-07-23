import {
  HUD_HEIGHT,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../config/constants.js'
import {
  COLOR_BODY,
  COLOR_TITLE,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiNineSlice } from '../ui/uiAtlas.js'

/** Área de mapa fija (divisible por 8 para zoom 1/2/4/8). */
const MAP_W = 120
const MAP_H = 88
const MARGIN = 6
const FRAME_PAD = 6
const ZOOM_MIN = 1
const ZOOM_MAX = 8
const ZOOM_DEFAULT = 2
const ZOOM_BTN_R = 9
const ZOOM_BTN_GAP = 6
const ZOOM_DEPTH = 993

const PANEL_FILL = 0x0a0e14
const FLOOR_COLOR = 0x3d4650
const WALL_COLOR = 0x161b21
const DESTRUCTIBLE_COLOR = 0x6b5335
const PLAYER_COLOR = 0x4ea5ff
const ENTRY_COLOR = 0x3c8991
const EXIT_COLOR = 0xffc857
const ZOOM_BTN_FILL = 0x121820
const ZOOM_BTN_STROKE = 0x6a7480
const DEBUG_ALWAYS_SHOW_EXIT = true

/**
 * Botón circular mínimo para zoom del minimapa.
 * @returns {{ bg: Phaser.GameObjects.Arc, text: Phaser.GameObjects.Text, destroy: () => void }}
 */
function createRoundZoomBtn(scene, { x, y, label, onClick, depth }) {
  const bg = scene.add.circle(x, y, ZOOM_BTN_R, ZOOM_BTN_FILL, 0.92)
    .setStrokeStyle(1.5, ZOOM_BTN_STROKE, 1)
    .setScrollFactor(0)
    .setDepth(depth)
    .setInteractive({ useHandCursor: true })

  const text = scene.add.text(
    x,
    y,
    label,
    textStyleDisplay({
      fontSize: '14px',
      color: COLOR_BODY,
    }),
  ).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1)

  bg.on('pointerover', () => {
    bg.setStrokeStyle(1.5, EXIT_COLOR, 1)
    text.setColor(COLOR_TITLE)
  })
  bg.on('pointerout', () => {
    bg.setStrokeStyle(1.5, ZOOM_BTN_STROKE, 1)
    text.setColor(COLOR_BODY)
    bg.setScale(1)
    text.setScale(1)
  })
  bg.on('pointerdown', () => {
    bg.setScale(0.92)
    text.setScale(0.92)
  })
  bg.on('pointerup', () => {
    bg.setScale(1)
    text.setScale(1)
    onClick()
  })
  bg.on('pointerupoutside', () => {
    bg.setScale(1)
    text.setScale(1)
  })

  return {
    bg,
    text,
    destroy() {
      bg.destroy()
      text.destroy()
    },
  }
}

function oddFloor(n) {
  const f = Math.floor(n)
  return f % 2 === 0 ? Math.max(1, f - 1) : f
}

export class MinimapView {
  constructor(scene, world) {
    this.world = world
    this.scene = scene
    this.pixelsPerTile = ZOOM_DEFAULT

    const frameW = MAP_W + FRAME_PAD * 2
    const frameH = MAP_H + FRAME_PAD * 2

    this.frameX = scene.scale.width - frameW - MARGIN
    this.frameY = HUD_HEIGHT + MARGIN
    this.mapX = this.frameX + FRAME_PAD
    this.mapY = this.frameY + FRAME_PAD
    this.width = MAP_W
    this.height = MAP_H

    this.panelFill = scene.add.rectangle(
      this.frameX + 3,
      this.frameY + 3,
      frameW - 6,
      frameH - 6,
      PANEL_FILL,
      0.94,
    ).setOrigin(0).setScrollFactor(0).setDepth(988)

    this.frame = createUiNineSlice(
      scene,
      'dialogue_frame',
      this.frameX,
      this.frameY,
      frameW,
      frameH,
    ).setScrollFactor(0).setDepth(991)

    this.graphics = scene.add.graphics({ x: 0, y: 0 })
      .setScrollFactor(0)
      .setDepth(990)

    this.hitZone = scene.add.zone(
      this.frameX + frameW / 2,
      this.frameY + frameH / 2,
      frameW,
      frameH,
    ).setScrollFactor(0).setDepth(992).setInteractive()

    this.hitZone.on('wheel', (_pointer, _dx, dy) => {
      if (dy < 0) this.zoomIn()
      else if (dy > 0) this.zoomOut()
    })

    const btnCx = this.frameX + frameW / 2
    const btnCy = this.frameY + frameH
    const step = ZOOM_BTN_R * 2 + ZOOM_BTN_GAP
    this.btnZoomOut = createRoundZoomBtn(scene, {
      x: btnCx - step / 2,
      y: btnCy,
      label: '−',
      depth: ZOOM_DEPTH,
      onClick: () => this.zoomOut(),
    })
    this.btnZoomIn = createRoundZoomBtn(scene, {
      x: btnCx + step / 2,
      y: btnCy,
      label: '+',
      depth: ZOOM_DEPTH,
      onClick: () => this.zoomIn(),
    })

    this._onKeyDown = (event) => {
      if (event.code === 'Equal' || event.code === 'NumpadAdd') {
        this.zoomIn()
      } else if (event.code === 'Minus' || event.code === 'NumpadSubtract') {
        this.zoomOut()
      }
    }
    scene.input.keyboard.on('keydown', this._onKeyDown)

    this.lastSignature = ''
    this.update()
  }

  zoomIn() {
    if (this.pixelsPerTile >= ZOOM_MAX) return
    this.pixelsPerTile *= 2
    this.lastSignature = ''
    this.update()
  }

  zoomOut() {
    if (this.pixelsPerTile <= ZOOM_MIN) return
    this.pixelsPerTile = Math.floor(this.pixelsPerTile / 2)
    this.lastSignature = ''
    this.update()
  }

  _windowSize() {
    const ppt = this.pixelsPerTile
    const tilesX = oddFloor(MAP_W / ppt)
    const tilesY = oddFloor(MAP_H / ppt)
    const offsetX = Math.floor((MAP_W - tilesX * ppt) / 2)
    const offsetY = Math.floor((MAP_H - tilesY * ppt) / 2)
    return { ppt, tilesX, tilesY, offsetX, offsetY }
  }

  update() {
    const { player, visionRevision } = this.world
    if (!player) return

    const signature = `${player.tileX},${player.tileY}|${visionRevision}|${this.pixelsPerTile}`
    if (signature === this.lastSignature) return
    this.lastSignature = signature

    this._draw()
  }

  _draw() {
    const { grid, player, discoveredTiles } = this.world
    const graphics = this.graphics
    graphics.clear()

    const { ppt, tilesX, tilesY, offsetX, offsetY } = this._windowSize()
    const halfX = Math.floor(tilesX / 2)
    const halfY = Math.floor(tilesY / 2)
    const originX = this.mapX + offsetX
    const originY = this.mapY + offsetY

    for (let wy = 0; wy < tilesY; wy++) {
      for (let wx = 0; wx < tilesX; wx++) {
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
          originX + wx * ppt,
          originY + wy * ppt,
          ppt,
          ppt,
        )
      }
    }

    this._drawDoorMarker(
      graphics,
      this.world.entryDoor,
      ENTRY_COLOR,
      halfX,
      halfY,
      tilesX,
      tilesY,
      originX,
      originY,
      ppt,
    )
    this._drawDoorMarker(
      graphics,
      this.world.exitDoor,
      EXIT_COLOR,
      halfX,
      halfY,
      tilesX,
      tilesY,
      originX,
      originY,
      ppt,
      DEBUG_ALWAYS_SHOW_EXIT,
    )

    graphics.fillStyle(PLAYER_COLOR, 1)
    graphics.fillRect(
      originX + halfX * ppt,
      originY + halfY * ppt,
      ppt,
      ppt,
    )
  }

  _drawDoorMarker(
    graphics,
    door,
    color,
    halfX,
    halfY,
    tilesX,
    tilesY,
    originX,
    originY,
    ppt,
    alwaysVisible = false,
  ) {
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
    const outside = wx < 0 || wy < 0 || wx >= tilesX || wy >= tilesY
    if (outside && !alwaysVisible) return
    if (outside) {
      wx = Math.max(1, Math.min(tilesX - 2, wx))
      wy = Math.max(1, Math.min(tilesY - 2, wy))
    }

    const pad = Math.max(0, Math.floor(ppt / 4))
    graphics.fillStyle(color, 1)
    graphics.fillRect(
      originX + wx * ppt - pad,
      originY + wy * ppt - pad,
      ppt + pad * 2,
      ppt + pad * 2,
    )
  }

  destroy() {
    this.scene.input.keyboard.off('keydown', this._onKeyDown)
    this.btnZoomIn?.destroy()
    this.btnZoomOut?.destroy()
    this.hitZone?.destroy()
    this.panelFill?.destroy()
    this.frame?.destroy()
    this.graphics.destroy()
  }
}
