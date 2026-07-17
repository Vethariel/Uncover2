import { HUD_HEIGHT } from '../../config/constants.js'

export class HudView {
  constructor(scene, world, gameState) {
    this.scene = scene
    this.world = world
    this.gameState = gameState
    this.container = scene.add.container(0, 0)
    this.banner = scene.add.rectangle(0, 0, scene.scale.width, HUD_HEIGHT, 0x111820)
      .setOrigin(0)
      .setStrokeStyle(1, 0x53616d)
    this.livesText = scene.add.text(28, 13, '', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5)
    this.scoreText = scene.add.text(74, 13, '', {
      fontSize: '11px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0, 0.5)
    this.timerText = scene.add.text(138, 12, '', {
      fontSize: '14px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0.5)
    this.popupTexts = []

    this.container.add([this.banner, this.livesText, this.scoreText, this.timerText])
  }

  update() {
    const player = this.world.player

    this.livesText.setText(String(Math.max(0, player.lives)))
    this.scoreText.setText(String(player.score).padStart(6, '0'))

    const minutes = Math.floor(this.world.levelTimer / 60)
    const seconds = Math.floor(this.world.levelTimer % 60)
    this.timerText.setText(`${minutes}:${seconds.toString().padStart(2, '0')}`)

    this._syncPopups()
  }

  _syncPopups() {
    const popups = this.world.scorePopups ?? []

    while (this.popupTexts.length > popups.length) {
      this.popupTexts.pop().destroy()
    }

    while (this.popupTexts.length < popups.length) {
      const text = this.scene.add.text(0, HUD_HEIGHT, '', {
        fontSize: '8px',
        color: '#ffffff',
      }).setOrigin(0.5)
      this.popupTexts.push(text)
      this.container.add(text)
    }

    popups.forEach((popup, i) => {
      const text = this.popupTexts[i]
      text.setPosition(Math.floor(popup.posX + 8), Math.floor(popup.posY + HUD_HEIGHT))
      text.setText(String(popup.value))
      text.setStyle({
        fontSize: popup.combo ? '10px' : '8px',
        color: popup.combo ? '#ffdc00' : '#ffffff',
      })
    })
  }

  destroy() {
    this.container.destroy(true)
    this.popupTexts = []
  }
}
