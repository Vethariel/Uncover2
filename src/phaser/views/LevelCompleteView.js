import {
  COLOR_HUD,
  COLOR_MUTED,
  COLOR_TITLE,
  FONT_SIZE_DISPLAY_LG,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'
import { createUiImage, createUiNineSlice } from '../ui/uiAtlas.js'

const DEPTH = 1250
const PANEL_FILL = 0x0a0e14
const PANEL_WIDTH = 420
const PANEL_HEIGHT = 292
const PANEL_PAD = 24
const ICON_SIZE = 32
const ROW_GAP = 32

const ROWS = [
  { path: ['resources', 'bronze'], label: 'Bronce', icon: 'bronze_icon' },
  { path: ['resources', 'iron'], label: 'Hierro', icon: 'iron_icon' },
  { path: ['resources', 'crystal'], label: 'Cristal', icon: 'crystal_icon' },
  { path: ['fragments', 'generic'], label: 'Fragmentos genéricos', icon: 'fragment_icon' },
  {
    path: ['fragments', 'specialized'],
    label: 'Fragmentos especializados',
    icon: 'fragment_icon',
  },
]

function valueAt(result, path) {
  return path.reduce((value, key) => value?.[key], result) ?? 0
}

export class LevelCompleteView {
  constructor(scene) {
    this.scene = scene
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
      top + 22,
      'NIVEL COMPLETADO',
      textStyleDisplay({ fontSize: `${FONT_SIZE_DISPLAY_LG}px` }),
    ).setOrigin(0.5)

    this.levelText = scene.add.text(
      cx,
      top + 44,
      '',
      textStyleBody({ fontSize: '13px', color: COLOR_HUD }),
    ).setOrigin(0.5)

    this.collectedText = scene.add.text(
      left + PANEL_PAD,
      top + 64,
      'OBJETOS RECOLECTADOS',
      textStyleBody({ fontSize: '13px', color: '#ffffff' }),
    )

    const rowsTop = top + 88
    this.rowNodes = ROWS.map((row, index) => {
      const y = rowsTop + index * ROW_GAP
      const icon = createUiImage(
        scene,
        row.icon,
        left + PANEL_PAD + ICON_SIZE / 2,
        y + ICON_SIZE / 2,
      )
      const label = scene.add.text(
        left + PANEL_PAD + ICON_SIZE + 8,
        y + (ICON_SIZE - 14) / 2,
        row.label,
        textStyleBody({ fontSize: '14px', color: COLOR_HUD }),
      )
      const value = scene.add.text(
        left + PANEL_WIDTH - PANEL_PAD,
        y + (ICON_SIZE - 14) / 2,
        'x0',
        textStyleBody({ fontSize: '14px', color: '#ffffff' }),
      ).setOrigin(1, 0)
      return { icon, label, value, row }
    })

    this.trialText = scene.add.text(
      cx,
      top + PANEL_HEIGHT - 48,
      '',
      textStyleBody({ fontSize: '13px', color: '#78d7e8' }),
    ).setOrigin(0.5)

    this.totalText = scene.add.text(
      left + PANEL_PAD,
      top + PANEL_HEIGHT - 32,
      '',
      textStyleBody({ fontSize: '14px', color: COLOR_TITLE }),
    )

    this.continueText = scene.add.text(
      left + PANEL_WIDTH - PANEL_PAD,
      top + PANEL_HEIGHT - 12,
      'ESPACIO: CONTINUAR',
      textStyleBody({ fontSize: '13px', color: COLOR_MUTED }),
    ).setOrigin(1, 1)

    this.container.add([
      this.dim,
      this.panelFill,
      this.panel,
      this.titleText,
      this.levelText,
      this.collectedText,
      ...this.rowNodes.flatMap(({ icon, label, value }) => [icon, label, value]),
      this.trialText,
      this.totalText,
      this.continueText,
    ])
  }

  show(result) {
    this.levelText.setText(`NIVEL ${result.levelIndex + 1} — ${result.levelName}`)
    for (const { row, value } of this.rowNodes) {
      value.setText(`x${valueAt(result, row.path)}`)
    }
    this.totalText.setText(`TOTAL: ${result.totalCollected}`)
    if (result.trial) {
      const { score, quota, passed } = result.trial
      this.titleText.setText(passed ? 'UMBRAL SUPERADO' : 'NIVEL COMPLETADO')
      this.trialText.setText(`OFICIO ${score} / ${quota}`)
    } else {
      this.titleText.setText('NIVEL COMPLETADO')
      this.trialText.setText('')
    }
    this.container.setVisible(true)
  }

  hide() {
    this.container.setVisible(false)
  }

  destroy() {
    this.container.destroy(true)
  }
}
