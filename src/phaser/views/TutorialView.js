const DEPTH = 1230

export class TutorialView {
  constructor(scene, controller) {
    this.scene = scene
    this.controller = controller

    const width = scene.scale.width
    const height = scene.scale.height
    const panelWidth = 420
    const panelHeight = 220
    const cx = width / 2
    const cy = height / 2
    const left = cx - panelWidth / 2
    const top = cy - panelHeight / 2

    this.container = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setVisible(false)

    this.dim = scene.add.rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0)

    this.panel = scene.add.rectangle(
      left,
      top,
      panelWidth,
      panelHeight,
      0x0b1118,
      0.98,
    ).setOrigin(0).setStrokeStyle(2, 0xb08d57, 1)

    this.titleText = scene.add.text(cx, top + 28, '', {
      fontSize: '16px',
      fontFamily: 'monospace',
      color: '#ffc857',
    }).setOrigin(0.5)

    this.bodyText = scene.add.text(left + 28, top + 64, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#f0f2f4',
      wordWrap: { width: panelWidth - 56, useAdvancedWrap: true },
      lineSpacing: 8,
    })

    this.continueText = scene.add.text(
      left + panelWidth - 24,
      top + panelHeight - 20,
      'ESPACIO: CONTINUAR',
      {
        fontSize: '9px',
        fontFamily: 'monospace',
        color: '#9aa3ad',
      },
    ).setOrigin(1, 1)

    this.container.add([
      this.dim,
      this.panel,
      this.titleText,
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

    const step = this.controller.currentStep
    this.container.setVisible(true)
    this.titleText.setText(step?.title ?? '')
    this.bodyText.setText((step?.lines ?? []).join('\n'))
    this.continueText.setText(
      this.controller.hasNext ? 'ESPACIO: CONTINUAR' : 'ESPACIO: CERRAR',
    )
  }

  destroy() {
    this.container.destroy(true)
  }
}
