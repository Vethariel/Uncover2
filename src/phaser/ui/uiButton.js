import {
  COLOR_BODY,
  FONT_SIZE_HUD,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiNineSlice } from './uiAtlas.js'

/**
 * Botón UI (marco 9-slice `button` + etiqueta). Origin lógico: centro.
 *
 * @param {Phaser.Scene} scene
 * @param {{
 *   x: number,
 *   y: number,
 *   label: string,
 *   onClick: () => void,
 *   width?: number,
 *   height?: number,
 *   depth?: number,
 * }} opts
 */
export function createUiButton(scene, opts) {
  const {
    x,
    y,
    label,
    onClick,
    width = 148,
    height = 28,
    depth = 10,
    fontSize = `${FONT_SIZE_HUD}px`,
  } = opts

  const left = Math.round(x - width / 2)
  const top = Math.round(y - height / 2)

  const bg = createUiNineSlice(scene, 'button', left, top, width, height)
    .setDepth(depth)
    .setInteractive({ useHandCursor: true })

  const text = scene.add.text(
    x,
    y,
    label,
    textStyleDisplay({
      fontSize,
      color: COLOR_BODY,
    }),
  ).setOrigin(0.5).setDepth(depth + 1)

  const press = () => {
    bg.y = top + 1
    text.y = y + 1
  }
  const release = () => {
    bg.y = top
    text.y = y
  }

  bg.on('pointerover', () => text.setColor('#ffc857'))
  bg.on('pointerout', () => {
    release()
    if (!focused) text.setColor(COLOR_BODY)
  })
  bg.on('pointerdown', press)
  bg.on('pointerup', () => {
    release()
    onClick()
  })
  bg.on('pointerupoutside', release)

  let focused = false

  return {
    bg,
    text,
    setFocused(value) {
      focused = Boolean(value)
      text.setColor(focused ? '#ffc857' : COLOR_BODY)
    },
    destroy() {
      bg.destroy()
      text.destroy()
    },
  }
}
