import Phaser from 'phaser'
import { placeholderFrameForRank } from '../../config/crafting.js'
import { sealIconFrame } from '../../config/iconsAtlas.js'
import { createUiNineSlice } from './uiAtlas.js'
import { createIconImage } from './iconsAtlas.js'

const SEAL_SIZE = 32
const ICON_INSET = 28

/**
 * Sello arrastrable: placeholder por rareza + icono del atlas.
 *
 * @param {Phaser.Scene} scene
 * @param {{
 *   x: number,
 *   y: number,
 *   upgradeId: string,
 *   rank: number,
 *   depth?: number,
 *   draggable?: boolean,
 *   onDragEnd?: (upgradeId: string, pointer: Phaser.Input.Pointer) => void,
 *   onClick?: (upgradeId: string) => void,
 * }} opts
 */
export function createSealToken(scene, opts) {
  const {
    x,
    y,
    upgradeId,
    rank,
    depth = 1210,
    draggable = true,
    onDragEnd = null,
    onClick = null,
  } = opts

  const frameId = placeholderFrameForRank(rank)
  const iconFrame = sealIconFrame(upgradeId, rank)
  const home = { x, y }

  const bg = createUiNineSlice(
    scene,
    frameId,
    x - SEAL_SIZE / 2,
    y - SEAL_SIZE / 2,
    SEAL_SIZE,
    SEAL_SIZE,
  ).setScrollFactor(0).setDepth(depth)

  const icon = createIconImage(scene, iconFrame, x, y, {
    displayWidth: ICON_INSET,
    displayHeight: ICON_INSET,
  }).setScrollFactor(0).setDepth(depth + 1)

  bg.setInteractive({ useHandCursor: true, draggable: Boolean(draggable) })

  const syncFollowers = (cx, cy) => {
    icon.setPosition(cx, cy)
  }

  if (draggable) {
    scene.input.setDraggable(bg)
    bg.on('drag', (_pointer, dragX, dragY) => {
      bg.x = dragX
      bg.y = dragY
      const cx = dragX + SEAL_SIZE / 2
      const cy = dragY + SEAL_SIZE / 2
      syncFollowers(cx, cy)
      bg.setDepth(depth + 20)
      icon.setDepth(depth + 21)
    })
    bg.on('dragend', (pointer) => {
      bg.setDepth(depth)
      icon.setDepth(depth + 1)
      onDragEnd?.(upgradeId, pointer)
    })
  }

  bg.on('pointerup', () => {
    if (!bg.input?.dragState) onClick?.(upgradeId)
  })

  return {
    upgradeId,
    bg,
    icon,
    home,
    setPosition(nx, ny) {
      home.x = nx
      home.y = ny
      bg.x = nx - SEAL_SIZE / 2
      bg.y = ny - SEAL_SIZE / 2
      syncFollowers(nx, ny)
    },
    snapHome() {
      this.setPosition(home.x, home.y)
    },
    destroy() {
      bg.destroy()
      icon.destroy()
    },
  }
}

/**
 * Slot de instalación (placeholder vacío).
 */
export function createEquipSlot(scene, {
  x,
  y,
  slotIndex,
  depth = 1200,
  onClick = null,
}) {
  const size = SEAL_SIZE
  const bg = createUiNineSlice(
    scene,
    'item_placeholder',
    x - size / 2,
    y - size / 2,
    size,
    size,
  ).setScrollFactor(0).setDepth(depth).setInteractive({ useHandCursor: true })

  const hit = new Phaser.Geom.Rectangle(x - size / 2, y - size / 2, size, size)

  bg.on('pointerup', () => onClick?.(slotIndex))

  return {
    slotIndex,
    x,
    y,
    bg,
    hit,
    contains(px, py) {
      return Phaser.Geom.Rectangle.Contains(hit, px, py)
    },
    setFrame(rankOrNull) {
      bg.setAlpha(rankOrNull ? 1 : 0.55)
    },
    destroy() {
      bg.destroy()
    },
  }
}
