import {
  COLOR_MUTED,
  FONT_SIZE_DISPLAY_LG,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiNineSlice } from '../ui/uiAtlas.js'

const DEPTH = 1230
const PANEL_FILL = 0x0a0e14
const PANEL_WIDTH = 420
const PANEL_HEIGHT = 200
const PANEL_PAD = 28

export class TutorialView {
  constructor(scene, controller) {
    this.scene = scene
    this.controller = controller

    const width = scene.scale.width
    const height = scene.scale.height
    const cx = width / 2
    const cy = height / 2
    const left = Math.round(cx - PANEL_WIDTH / 2)
    const top = Math.round(cy - PANEL_HEIGHT / 2)

    this.container = scene.add.container(0, 0)
      .setScrollFactor(0)
      .setDepth(DEPTH)
      .setVisible(false)

    this.dim = scene.add.rectangle(0, 0, width, height, 0x000000, 0.72)
      .setOrigin(0)

    this.panelFill = scene.add.rectangle(
      left + 3,
      top + 3,
      PANEL_WIDTH - 6,
      PANEL_HEIGHT - 6,
      PANEL_FILL,
      0.96,
    ).setOrigin(0)

    this.panel = createUiNineSlice(
      scene,
      'tutorial_frame',
      left,
      top,
      PANEL_WIDTH,
      PANEL_HEIGHT,
    )

    this.titleText = scene.add.text(
      cx,
      top + 28,
      '',
      textStyleDisplay({ fontSize: `${FONT_SIZE_DISPLAY_LG}px` }),
    ).setOrigin(0.5)

    this.bodyText = scene.add.text(
      left + PANEL_PAD,
      top + 58,
      '',
      textStyleBody({
        fontSize: '15px',
        wordWrap: { width: PANEL_WIDTH - PANEL_PAD * 2, useAdvancedWrap: true },
        lineSpacing: 6,
      }),
    )

    this.continueText = scene.add.text(
      left + PANEL_WIDTH - PANEL_PAD,
      top + PANEL_HEIGHT - 14,
      'ESPACIO: CONTINUAR',
      textStyleBody({ fontSize: '13px', color: COLOR_MUTED }),
    ).setOrigin(1, 1)

    this.container.add([
      this.dim,
      this.panelFill,
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
