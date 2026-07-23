import Phaser from 'phaser'
import {
  FONT_SIZE_DISPLAY_LG,
  textStyleDisplay,
} from '../../config/typography.js'

export class SplashScene extends Phaser.Scene {
  constructor() {
    super('Splash')
  }

  create() {
    this.blinkVisible = true
    this.blinkTimer = 0

    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 - 15,
      'CLICK OR PRESS',
      textStyleDisplay({
        fontSize: `${FONT_SIZE_DISPLAY_LG}px`,
        color: '#ffffff',
      }),
    ).setOrigin(0.5)

    this.enterText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2 + 15,
      'ENTER TO START',
      textStyleDisplay({
        fontSize: `${FONT_SIZE_DISPLAY_LG}px`,
        color: '#ffffff',
      }),
    ).setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => this._goMenu())
    this.input.once('pointerdown', () => this._goMenu())
  }

  update(_time, delta) {
    this.blinkTimer += delta
    if (this.blinkTimer >= 500) {
      this.blinkTimer = 0
      this.blinkVisible = !this.blinkVisible
      this.enterText.setVisible(this.blinkVisible)
    }
  }

  _goMenu() {
    this.scene.start('Menu')
  }
}
