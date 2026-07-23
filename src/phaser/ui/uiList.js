import {
  COLOR_BODY,
  COLOR_TITLE,
  FONT_SIZE_HINT,
  FONT_SIZE_HUD,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { UI_ATLAS_KEY } from '../../config/uiAtlas.js'
import { createUiNineSlice } from './uiAtlas.js'

/** Alto nativo del frame `button` (9-slice). */
export const UI_LIST_ROW_HEIGHT = 32
const ROW_GAP = 4

/**
 * Lista scrolleable: cada fila es un botón del atlas.
 *
 * @param {Phaser.Scene} scene
 * @param {{
 *   x: number,
 *   y: number,
 *   width: number,
 *   height: number,
 *   rowHeight?: number,
 *   depth?: number,
 *   onSelect?: (item: object, index: number) => void,
 * }} opts
 */
export function createUiList(scene, opts) {
  const {
    x,
    y,
    width,
    height,
    rowHeight = UI_LIST_ROW_HEIGHT + ROW_GAP,
    depth = 1200,
    onSelect = null,
  } = opts

  const container = scene.add.container(x, y).setScrollFactor(0).setDepth(depth)
  const maskShape = scene.add.rectangle(x, y, width, height, 0x000000, 0)
    .setOrigin(0)
    .setScrollFactor(0)
    .setVisible(false)
  const mask = maskShape.createGeometryMask()
  container.setMask(mask)

  const trackW = 10
  const btnW = width - trackW - 4
  const track = createUiNineSlice(
    scene,
    'scrollbar_track',
    x + width - trackW,
    y,
    trackW,
    height,
  ).setScrollFactor(0).setDepth(depth + 2).setVisible(false)

  const thumb = createUiNineSlice(
    scene,
    'scrollbar_thumb',
    x + width - trackW,
    y,
    trackW,
    24,
  ).setScrollFactor(0).setDepth(depth + 3).setVisible(false)

  let items = []
  let selected = 0
  let scroll = 0
  /** @type {Phaser.GameObjects.GameObject[]} */
  let rowNodes = []

  function contentHeight() {
    return items.length * rowHeight
  }

  function maxScroll() {
    return Math.max(0, contentHeight() - height)
  }

  function rebuild() {
    for (const node of rowNodes) node.destroy()
    rowNodes = []
    scroll = Math.min(scroll, maxScroll())

    items.forEach((item, index) => {
      const rowTop = index * rowHeight - scroll
      const rowCy = rowTop + UI_LIST_ROW_HEIGHT / 2
      const muted = Boolean(item.muted)
      const isSel = index === selected

      const bg = createUiNineSlice(scene, 'button', 0, rowTop, btnW, UI_LIST_ROW_HEIGHT)
      if (muted) bg.setTint(0x6a727a).setAlpha(0.72)
      else if (isSel) bg.setTint(0xffe0a0)
      else bg.clearTint().setAlpha(1)

      const textColor = muted
        ? '#8a929a'
        : isSel
          ? COLOR_TITLE
          : COLOR_BODY
      const text = scene.add.text(
        btnW / 2,
        rowCy,
        item.text,
        textStyleDisplay({
          fontSize: `${FONT_SIZE_HUD}px`,
          color: textColor,
        }),
      ).setOrigin(0.5)

      const hit = scene.add.rectangle(
        btnW / 2,
        rowCy,
        btnW,
        UI_LIST_ROW_HEIGHT,
        0x000000,
        0,
      ).setInteractive({ useHandCursor: !muted })

      hit.on('pointerover', () => {
        if (muted) return
        selected = index
        rebuild()
      })
      hit.on('pointerup', () => {
        selected = index
        rebuild()
        if (!muted) onSelect?.(item, index)
      })

      container.add([bg, text, hit])
      rowNodes.push(bg, text, hit)
    })

    const needsScroll = contentHeight() > height
    track.setVisible(needsScroll)
    thumb.setVisible(needsScroll)
    if (needsScroll) {
      const thumbH = Math.max(16, Math.round((height / contentHeight()) * height))
      thumb.setSize(trackW, thumbH)
      const t = maxScroll() > 0 ? scroll / maxScroll() : 0
      thumb.y = y + t * (height - thumbH)
    }
  }

  function setItems(nextItems, keepSelection = false) {
    items = nextItems
    if (!keepSelection) selected = 0
    else selected = Math.min(selected, Math.max(0, items.length - 1))
    rebuild()
  }

  function move(delta) {
    if (!items.length) return
    selected = (selected + delta + items.length) % items.length
    const top = selected * rowHeight
    if (top < scroll) scroll = top
    if (top + rowHeight > scroll + height) {
      scroll = top + rowHeight - height
    }
    rebuild()
  }

  function wheel(dy) {
    if (contentHeight() <= height) return
    scroll = Math.max(0, Math.min(maxScroll(), scroll + Math.sign(dy) * rowHeight))
    rebuild()
  }

  function getSelected() {
    return items[selected] ?? null
  }

  const hitZone = scene.add.zone(x + width / 2, y + height / 2, width, height)
    .setScrollFactor(0)
    .setDepth(depth + 1)
    .setInteractive()
  hitZone.on('wheel', (_p, _dx, dy) => wheel(dy))

  return {
    container,
    setItems,
    move,
    wheel,
    getSelected,
    get selectedIndex() { return selected },
    setSelected(index) {
      if (!items.length) return
      selected = Math.max(0, Math.min(items.length - 1, index))
      rebuild()
    },
    destroy() {
      hitZone.destroy()
      for (const node of rowNodes) node.destroy()
      container.destroy()
      maskShape.destroy()
      track.destroy()
      thumb.destroy()
    },
  }
}

/** Tint para oscurecer la madera y leer texto claro encima. */
const WOOD_TINT = 0x5a4a38
const WOOD_OVERLAY_ALPHA = 0.42

/**
 * Panel modal de taller: textura madera en tile + marco + icono.
 */
export function createWorkshopPanelChrome(scene, {
  x,
  y,
  width,
  height,
  icon,
  title,
  depth = 1150,
}) {
  const nodes = []
  const inset = 4
  const fillW = width - inset * 2
  const fillH = height - inset * 2

  const fill = scene.add.tileSprite(
    x + inset,
    y + inset,
    fillW,
    fillH,
    UI_ATLAS_KEY,
    'workshop_texture',
  )
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(depth)
    .setTint(WOOD_TINT)
  nodes.push(fill)

  const shade = scene.add.rectangle(
    x + inset,
    y + inset,
    fillW,
    fillH,
    0x0a0806,
    WOOD_OVERLAY_ALPHA,
  )
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(depth + 0.5)
  nodes.push(shade)

  const frame = createUiNineSlice(scene, 'workshop_frame', x, y, width, height)
    .setScrollFactor(0)
    .setDepth(depth + 1)
  nodes.push(frame)

  const iconImg = scene.add.image(x + 28, y + 22, UI_ATLAS_KEY, icon)
    .setScrollFactor(0)
    .setDepth(depth + 2)
    .setDisplaySize(24, 24)
  nodes.push(iconImg)

  const titleText = scene.add.text(
    x + 44,
    y + 22,
    title,
    textStyleDisplay({
      fontSize: `${FONT_SIZE_HINT + 3}px`,
      color: COLOR_TITLE,
    }),
  ).setOrigin(0, 0.5).setScrollFactor(0).setDepth(depth + 2)
  nodes.push(titleText)

  const hint = scene.add.text(
    x + width / 2,
    y + height - 12,
    'ESC cerrar',
    textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: '#b8c0c8' }),
  ).setOrigin(0.5, 1).setScrollFactor(0).setDepth(depth + 2)
  nodes.push(hint)

  return {
    nodes,
    contentX: x + 12,
    contentY: y + 40,
    contentW: width - 24,
    contentH: height - 58,
    destroy() {
      for (const n of nodes) n.destroy()
    },
  }
}
