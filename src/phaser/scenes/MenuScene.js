import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu')
  }

  create() {
    this.gameState = session.gameState
    this.gameState.reset()
    getAudio(this).playMusic('menu')

    this.blinkVisible = true
    this.blinkTimer = 0
    this.bombFrame = 0
    this.bombTimer = 0

    this.bombSprite = this.add.sprite(this.scale.width / 2, this.scale.height / 2 - 60, 'bombs', 0)
    this.bombSprite.setScale(3)

    this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, 'UNCOVER', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.pressText = this.add.text(this.scale.width / 2, this.scale.height / 2 + 15, 'PRESS ENTER TO START', {
      fontSize: '8px',
      color: '#c8c8c8',
    }).setOrigin(0.5)

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('LevelSelect')
    })
  }

  update(_time, delta) {
    this.blinkTimer += delta
    if (this.blinkTimer >= 500) {
      this.blinkTimer = 0
      this.blinkVisible = !this.blinkVisible
      this.pressText.setVisible(this.blinkVisible)
    }

    this.bombTimer += delta
    if (this.bombTimer >= 1000 / 6) {
      this.bombTimer = 0
      this.bombFrame = (this.bombFrame + 1) % 4
      this.bombSprite.setFrame(this.bombFrame)
    }
  }
}
