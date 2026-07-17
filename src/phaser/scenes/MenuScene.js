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

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.bombShape = this.add.circle(cx, cy - 60, 18, 0x20242b)
      .setStrokeStyle(3, 0xffc857)

    this.tweens.add({
      targets: this.bombShape,
      scale: 1.15,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add.text(cx, cy - 10, 'UNCOVER', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.pressText = this.add.text(cx, cy + 15, 'PRESS ENTER TO START', {
      fontSize: '8px',
      color: '#c8c8c8',
    }).setOrigin(0.5)

    this.tweens.add({
      targets: this.pressText,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('LevelSelect')
    })
  }
}
