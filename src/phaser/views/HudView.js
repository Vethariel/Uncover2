import { HUD_HEIGHT } from '../../config/constants.js'

export class HudView {
  constructor(scene, world, gameState) {
    this.scene = scene
    this.world = world
    this.gameState = gameState

    const width = scene.scale.width

    // Barra fija en pantalla (no se desplaza con la cámara).
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000)
    this.banner = scene.add.rectangle(0, 0, width, HUD_HEIGHT, 0x111820)
      .setOrigin(0)
      .setStrokeStyle(1, 0x53616d)

    this.livesText = scene.add.text(16, HUD_HEIGHT / 2, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0, 0.5)

    this.scoreText = scene.add.text(width / 2, HUD_HEIGHT / 2, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.container.add([this.banner, this.livesText, this.scoreText])

    // Popups de puntaje: viven en el mundo (se desplazan con la cámara).
    this.popupTexts = []
  }

  update() {
    const player = this.world.player

    this.livesText.setText(`x${Math.max(0, player.lives)}`)
    this.scoreText.setText(String(player.score).padStart(6, '0'))

    this._syncPopups()
  }

  _syncPopups() {
    const popups = this.world.scorePopups ?? []

    while (this.popupTexts.length > popups.length) {
      this.popupTexts.pop().destroy()
    }

    while (this.popupTexts.length < popups.length) {
      const text = this.scene.add.text(0, 0, '', {
        fontSize: '10px',
        color: '#ffffff',
      }).setOrigin(0.5).setDepth(900)
      this.popupTexts.push(text)
    }

    popups.forEach((popup, i) => {
      const text = this.popupTexts[i]
      text.setPosition(Math.floor(popup.posX + 16), Math.floor(popup.posY))
      text.setText(String(popup.value))
      text.setStyle({
        fontSize: popup.combo ? '12px' : '10px',
        color: popup.combo ? '#ffdc00' : '#ffffff',
      })
    })
  }

  destroy() {
    this.container.destroy(true)
    for (const text of this.popupTexts) text.destroy()
    this.popupTexts = []
  }
}
