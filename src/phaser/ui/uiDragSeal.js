import Phaser from 'phaser'
import { placeholderFrameForRank, UPGRADE_DEFS } from '../../config/crafting.js'
import {
  COLOR_BODY,
  FONT_SIZE_HINT,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiImage, createUiNineSlice } from './uiAtlas.js'

const SEAL_SIZE = 32

/**
 * Sello arrastrable (placeholder por rareza + inicial del nombre).
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
  const def = UPGRADE_DEFS[upgradeId]
  const home = { x, y }

  const bg = createUiNineSlice(
    scene,
    frameId,
    x - SEAL_SIZE / 2,
    y - SEAL_SIZE / 2,
    SEAL_SIZE,
    SEAL_SIZE,
  ).setScrollFactor(0).setDepth(depth)

  const label = scene.add.text(
    x,
    y,
    (def?.name ?? '?').slice(0, 1).toUpperCase(),
    textStyleDisplay({
      fontSize: `${FONT_SIZE_HINT + 2}px`,
      color: COLOR_BODY,
    }),
  ).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1)

  const rankText = scene.add.text(
    x + 10,
    y + 10,
    `R${rank}`,
    textStyleDisplay({
      fontSize: '8px',
      color: '#ffc857',
    }),
  ).setOrigin(0.5).setScrollFactor(0).setDepth(depth + 1)

  bg.setInteractive({ useHandCursor: true, draggable: Boolean(draggable) })

  if (draggable) {
    scene.input.setDraggable(bg)
    bg.on('drag', (_pointer, dragX, dragY) => {
      bg.x = dragX
      bg.y = dragY
      const cx = dragX + SEAL_SIZE / 2
      const cy = dragY + SEAL_SIZE / 2
      label.setPosition(cx, cy)
      rankText.setPosition(cx + 10, cy + 10)
      bg.setDepth(depth + 20)
      label.setDepth(depth + 21)
      rankText.setDepth(depth + 21)
    })
    bg.on('dragend', (pointer) => {
      bg.setDepth(depth)
      label.setDepth(depth + 1)
      rankText.setDepth(depth + 1)
      onDragEnd?.(upgradeId, pointer)
    })
  }

  bg.on('pointerup', () => {
    if (!bg.input?.dragState) onClick?.(upgradeId)
  })

  return {
    upgradeId,
    bg,
    label,
    rankText,
    home,
    setPosition(nx, ny) {
      home.x = nx
      home.y = ny
      bg.x = nx - SEAL_SIZE / 2
      bg.y = ny - SEAL_SIZE / 2
      label.setPosition(nx, ny)
      rankText.setPosition(nx + 10, ny + 10)
    },
    snapHome() {
      this.setPosition(home.x, home.y)
    },
    destroy() {
      bg.destroy()
      label.destroy()
      rankText.destroy()
    },
  }
}

/**
 * Slot de instalación (placeholder vacío o con rareza del sello).
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
      // Recrear no; usar tint/alpha. Para frame distinto destruimos y recreamos en panel.
      bg.setAlpha(rankOrNull ? 1 : 0.55)
    },
    destroy() {
      bg.destroy()
    },
  }
}

export function createEmptySlotPlaceholder(scene, x, y, depth = 1200) {
  return createUiImage(scene, 'item_placeholder', x, y, {
    displayWidth: SEAL_SIZE,
    displayHeight: SEAL_SIZE,
  }).setScrollFactor(0).setDepth(depth).setAlpha(0.5)
}
