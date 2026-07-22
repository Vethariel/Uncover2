import Phaser from 'phaser'
import {
  DEFAULT_BRUN_EXPRESSION,
  DEFAULT_EXCAVATOR_EXPRESSION,
  DEFAULT_PLAYER_EXPRESSION,
  portraitTextureKey,
} from '../../config/portraitExpressions.js'

/** Retrato nativo 128×128; el panel crece para no escalar. */
export const DIALOGUE_PORTRAIT_SIZE = 128
const PANEL_MARGIN = 8
const PANEL_PAD = 8
const PANEL_HEIGHT = PANEL_PAD * 2 + DIALOGUE_PORTRAIT_SIZE
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
    const panelY = height - PANEL_MARGIN - PANEL_HEIGHT
    const portraitX = PANEL_MARGIN + PANEL_PAD
    const portraitY = panelY + PANEL_PAD

    this.container = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setVisible(false)

    this.panel = scene.add.rectangle(
      PANEL_MARGIN,
      panelY,
      width - PANEL_MARGIN * 2,
      PANEL_HEIGHT,
      0x080c11,
      0.94,
    ).setOrigin(0).setStrokeStyle(2, 0xb08d57, 0.95)

    this.portraitFrame = scene.add.rectangle(
      portraitX,
      portraitY,
      DIALOGUE_PORTRAIT_SIZE,
      DIALOGUE_PORTRAIT_SIZE,
      0x0a0e14,
      1,
    ).setOrigin(0).setStrokeStyle(2, 0x53616d, 1)

    this.portraitImage = scene.add.image(
      portraitX,
      portraitY,
      portraitTextureKey('player', DEFAULT_PLAYER_EXPRESSION),
    ).setOrigin(0).setVisible(false)

    this.portraitPlaceholder = scene.add.circle(
      portraitX + DIALOGUE_PORTRAIT_SIZE / 2,
      portraitY + DIALOGUE_PORTRAIT_SIZE / 2,
      DIALOGUE_PORTRAIT_SIZE * 0.22,
      PORTRAIT_COLORS.narrator,
      0.9,
    )

    const textX = portraitX + DIALOGUE_PORTRAIT_SIZE + 12
    const textWidth = width - textX - PANEL_MARGIN - 10

    this.speakerText = scene.add.text(textX, panelY + 10, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffc857',
    })

    this.bodyText = scene.add.text(textX, panelY + 28, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#f0f2f4',
      wordWrap: { width: textWidth, useAdvancedWrap: true },
      lineSpacing: 2,
    })

    this.continueText = scene.add.text(
      width - PANEL_MARGIN - 10,
      panelY + PANEL_HEIGHT - 8,
      '',
      {
        fontSize: '8px',
        fontFamily: 'monospace',
        color: '#9aa3ad',
      },
    ).setOrigin(1, 1)

    this.container.add([
      this.panel,
      this.portraitFrame,
      this.portraitImage,
      this.portraitPlaceholder,
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

    if (key && this.scene.textures.exists(key)) {
      if (this._portraitKey !== key) {
        this.portraitImage.setTexture(key)
        this._portraitKey = key
      }
      this.portraitImage.setVisible(true)
      this.portraitPlaceholder.setVisible(false)
      return
    }

    this.portraitImage.setVisible(false)
    this._portraitKey = null
    this.portraitPlaceholder.setVisible(true)
    this.portraitPlaceholder.setFillStyle(
      PORTRAIT_COLORS[portrait] ?? PORTRAIT_COLORS.narrator,
      0.9,
    )
  }

  destroy() {
    this.container.destroy(true)
  }
}
