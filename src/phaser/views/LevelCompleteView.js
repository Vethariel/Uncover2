const DEPTH = 1250

const ROWS = [
  { path: ['resources', 'bronze'], label: 'Bronce', color: 0xc77b3f },
  { path: ['resources', 'iron'], label: 'Hierro', color: 0xb9c0c7 },
  { path: ['resources', 'crystal'], label: 'Cristal', color: 0x78d7e8 },
  { path: ['fragments', 'generic'], label: 'Fragmentos genéricos', color: 0xd28cff },
  { path: ['fragments', 'specialized'], label: 'Fragmentos especializados', color: 0xff9f6b },
]

function valueAt(result, path) {
  return path.reduce((value, key) => value?.[key], result) ?? 0
}

export class LevelCompleteView {
  constructor(scene) {
    this.scene = scene
    const width = scene.scale.width
    const height = scene.scale.height
    const panelWidth = 390
    const panelHeight = 270
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

    this.titleText = scene.add.text(cx, top + 24, 'NIVEL COMPLETADO', {
      fontSize: '20px',
      fontFamily: 'monospace',
      color: '#ffc857',
    }).setOrigin(0.5)

    this.levelText = scene.add.text(cx, top + 52, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#c8d0d8',
    }).setOrigin(0.5)

    this.collectedText = scene.add.text(left + 28, top + 76, 'OBJETOS RECOLECTADOS', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    })

    this.rowNodes = ROWS.map((row, index) => {
      const y = top + 103 + index * 25
      const icon = scene.add.circle(left + 38, y + 5, 6, row.color, 0.95)
      const label = scene.add.text(left + 55, y, row.label, {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#c8d0d8',
      })
      const value = scene.add.text(left + panelWidth - 30, y, 'x0', {
        fontSize: '11px',
        fontFamily: 'monospace',
        color: '#ffffff',
      }).setOrigin(1, 0)
      return { icon, label, value, row }
    })

    this.totalText = scene.add.text(left + 28, top + panelHeight - 40, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffc857',
    })

    this.trialText = scene.add.text(cx, top + panelHeight - 58, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#78d7e8',
    }).setOrigin(0.5)

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
