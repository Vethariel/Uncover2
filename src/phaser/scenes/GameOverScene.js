import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOver')
  }

  create() {
    this.gameState = session.gameState
    this.route = this.gameState.routeAfterGameOver()

    const audio = getAudio(this)
    audio.stopAll()
    audio.playOverlayMusic('gameOver', false)

    this.add.text(this.scale.width / 2, this.scale.height / 2 - 20, 'GAME OVER', {
      fontSize: '20px',
      color: '#dc3c3c',
    }).setOrigin(0.5)

    const hint = this.route === 'workshop'
      ? 'PRESS ENTER TO RETURN TO WORKSHOP'
      : 'PRESS ENTER TO RETURN TO MENU'

    this.add.text(this.scale.width / 2, this.scale.height / 2 + 15, hint, {
      fontSize: '8px',
      color: '#c8c8c8',
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => {
      if (this.route === 'workshop') this.scene.start('Workshop')
      else this.scene.start('Menu')
    })
  }
}
