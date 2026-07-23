import {
  DEFAULT_BRUN_EXPRESSION,
  DEFAULT_EXCAVATOR_EXPRESSION,
  DEFAULT_PLAYER_EXPRESSION,
  portraitTextureKey,
} from '../../config/portraitExpressions.js'
import {
  COLOR_MUTED,
  COLOR_TITLE,
  FONT_SIZE_DISPLAY,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiNineSlice } from '../ui/uiAtlas.js'

/** Retrato nativo 128×128. */
export const DIALOGUE_PORTRAIT_SIZE = 128

const PANEL_MARGIN = 6
const PANEL_PAD = 8
/** Marco pegado al 128: solo el borde del atlas, sin holgura. */
const FRAME_INSET = 4
const PORTRAIT_FRAME_SIZE = DIALOGUE_PORTRAIT_SIZE + FRAME_INSET * 2
const PANEL_HEIGHT = PANEL_PAD * 2 + PORTRAIT_FRAME_SIZE
const PANEL_FILL = 0x0a0e14
const PORTRAIT_FILL = 0x12151a
const DEPTH = 1200

const PORTRAIT_COLORS = {
  player: 0x4ea5ff,
  narrator: 0x8d8a84,
  smith: 0xc77b3f,
  excavator: 0x6b7a88,
}

export class DialogueView {
  constructor(scene, controller) {
    this.scene = scene
    this.controller = controller
    this._portraitKey = null

    const width = scene.scale.width
    const height = scene.scale.height
    const panelW = width - PANEL_MARGIN * 2
    const panelY = height - PANEL_MARGIN - PANEL_HEIGHT
    const panelX = PANEL_MARGIN

    const frameX = panelX + PANEL_PAD
    const frameY = panelY + PANEL_PAD
    const portraitX = frameX + FRAME_INSET
    const portraitY = frameY + FRAME_INSET
    const portraitSize = DIALOGUE_PORTRAIT_SIZE

    this.container = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setVisible(false)

    // Los marcos del atlas son huecos: el fill va debajo.
    this.panelFill = scene.add.rectangle(
      panelX + 3,
      panelY + 3,
      panelW - 6,
      PANEL_HEIGHT - 6,
      PANEL_FILL,
      0.94,
    ).setOrigin(0)

    this.panel = createUiNineSlice(
      scene,
      'dialogue_frame',
      panelX,
      panelY,
      panelW,
      PANEL_HEIGHT,
    )

    this.portraitFill = scene.add.rectangle(
      portraitX,
      portraitY,
      portraitSize,
      portraitSize,
      PORTRAIT_FILL,
      1,
    ).setOrigin(0)

    this.portraitFrame = createUiNineSlice(
      scene,
      'portrait_frame',
      frameX,
      frameY,
      PORTRAIT_FRAME_SIZE,
      PORTRAIT_FRAME_SIZE,
    )

    this.portraitImage = scene.add.image(
      portraitX,
      portraitY,
      portraitTextureKey('player', DEFAULT_PLAYER_EXPRESSION),
    ).setOrigin(0).setDisplaySize(portraitSize, portraitSize).setVisible(false)

    this.portraitPlaceholder = scene.add.circle(
      portraitX + portraitSize / 2,
      portraitY + portraitSize / 2,
      portraitSize * 0.22,
      PORTRAIT_COLORS.narrator,
      0.9,
    )

    const textX = frameX + PORTRAIT_FRAME_SIZE + 12
    const textRight = panelX + panelW - PANEL_PAD
    const textWidth = textRight - textX

    // Nombre a la derecha (el tab del marco queda solo decorativo).
    this.speakerText = scene.add.text(
      textX,
      frameY + 2,
      '',
      textStyleDisplay({ fontSize: `${FONT_SIZE_DISPLAY}px`, color: COLOR_TITLE }),
    )

    this.bodyText = scene.add.text(
      textX,
      frameY + 24,
      '',
      textStyleBody({
        fontSize: '15px',
        wordWrap: { width: textWidth, useAdvancedWrap: true },
        lineSpacing: 4,
      }),
    )

    this.continueText = scene.add.text(
      textRight,
      panelY + PANEL_HEIGHT - 6,
      '',
      textStyleBody({ fontSize: '13px', color: COLOR_MUTED }),
    ).setOrigin(1, 1)

    this._portraitBox = { x: portraitX, y: portraitY, size: portraitSize }

    this.container.add([
      this.panelFill,
      this.panel,
      this.portraitFill,
      this.portraitImage,
      this.portraitPlaceholder,
      this.portraitFrame,
      this.speakerText,
      this.bodyText,
      this.continueText,
    ])
  }

  show() {
    this.container.setVisible(true)
    this.sync()
  }

  hide() {
    this.container.setVisible(false)
  }

  sync() {
    if (!this.controller.active) {
      this.hide()
      return
    }

    const entry = this.controller.currentEntry
    this.container.setVisible(true)
    this.speakerText.setText(entry?.speaker ?? '')
    this.bodyText.setText(this.controller.visibleText)
    this._syncPortrait(entry)

    if (!this.controller.isCurrentComplete) {
      this.continueText.setText('ESPACIO: mostrar todo')
    } else if (this.controller.hasNext) {
      this.continueText.setText('ESPACIO: continuar')
    } else {
      this.continueText.setText('ESPACIO: cerrar')
    }
  }

  _syncPortrait(entry) {
    const portrait = entry?.portrait ?? null
    const fallback = portrait === 'excavator'
      ? DEFAULT_EXCAVATOR_EXPRESSION
      : portrait === 'smith'
        ? DEFAULT_BRUN_EXPRESSION
        : DEFAULT_PLAYER_EXPRESSION
    const expression = entry?.expression ?? fallback
    const key = portraitTextureKey(portrait, expression)
    const { x, y, size } = this._portraitBox

    if (key && this.scene.textures.exists(key)) {
      if (this._portraitKey !== key) {
        this.portraitImage.setTexture(key)
        this._portraitKey = key
      }
      this.portraitImage
        .setPosition(x, y)
        .setDisplaySize(size, size)
        .setVisible(true)
      this.portraitPlaceholder.setVisible(false)
      return
    }

    this.portraitImage.setVisible(false)
    this._portraitKey = null
    this.portraitPlaceholder.setVisible(true)
    this.portraitPlaceholder.setPosition(x + size / 2, y + size / 2)
    this.portraitPlaceholder.setFillStyle(
      PORTRAIT_COLORS[portrait] ?? PORTRAIT_COLORS.narrator,
      0.9,
    )
  }

  destroy() {
    this.container.destroy(true)
  }
}
