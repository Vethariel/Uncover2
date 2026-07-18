const PANEL_MARGIN = 12
const PANEL_HEIGHT = 112
const PORTRAIT_SIZE = 76
const DEPTH = 1200

const PORTRAIT_COLORS = {
  player: 0x4ea5ff,
  narrator: 0x8d8a84,
}

export class DialogueView {
  constructor(scene, controller) {
    this.scene = scene
    this.controller = controller

    const width = scene.scale.width
    const height = scene.scale.height
    const panelY = height - PANEL_MARGIN - PANEL_HEIGHT

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
      PANEL_MARGIN + 12,
      panelY + 18,
      PORTRAIT_SIZE,
      PORTRAIT_SIZE,
      0x17202a,
      1,
    ).setOrigin(0).setStrokeStyle(2, 0x53616d, 1)

    this.portraitPlaceholder = scene.add.circle(
      PANEL_MARGIN + 12 + PORTRAIT_SIZE / 2,
      panelY + 18 + PORTRAIT_SIZE / 2,
      PORTRAIT_SIZE * 0.3,
      PORTRAIT_COLORS.narrator,
      0.9,
    )

    const textX = PANEL_MARGIN + 12 + PORTRAIT_SIZE + 16
    const textWidth = width - textX - PANEL_MARGIN - 16

    this.speakerText = scene.add.text(textX, panelY + 14, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffc857',
    })

    this.bodyText = scene.add.text(textX, panelY + 35, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#f0f2f4',
      wordWrap: { width: textWidth, useAdvancedWrap: true },
      lineSpacing: 3,
    })

    this.continueText = scene.add.text(
      width - PANEL_MARGIN - 12,
      panelY + PANEL_HEIGHT - 12,
      '',
      {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#9aa3ad',
      },
    ).setOrigin(1, 1)

    this.container.add([
      this.panel,
      this.portraitFrame,
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
    this.portraitPlaceholder.setFillStyle(
      PORTRAIT_COLORS[entry?.portrait] ?? PORTRAIT_COLORS.narrator,
      0.9,
    )

    if (!this.controller.isCurrentComplete) {
      this.continueText.setText('ESPACIO: mostrar todo')
    } else if (this.controller.hasNext) {
      this.continueText.setText('ESPACIO: continuar')
    } else {
      this.continueText.setText('ESPACIO: cerrar')
    }
  }

  destroy() {
    this.container.destroy(true)
  }
}
