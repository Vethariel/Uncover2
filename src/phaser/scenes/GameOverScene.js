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
    const presentation = this.gameState.consumeGameOverPresentation() ?? {
      title: 'HAS ESCAPADO',
      detail: 'PERO HAS PERDIDO TODOS TUS OBJETOS',
      hint: this.route === 'workshop'
        ? 'PRESS ENTER TO RETURN TO WORKSHOP'
        : 'PRESS ENTER TO RETURN TO MENU',
    }

    const audio = getAudio(this)
    audio.stopAll()
    audio.playOverlayMusic('gameOver', false)

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.add.text(cx, cy - 48, presentation.title, {
      fontSize: '18px',
      fontFamily: 'monospace',
      color: '#ffc857',
      align: 'center',
    }).setOrigin(0.5)

    this.add.text(cx, cy - 8, presentation.detail, {
      fontSize: '9px',
      fontFamily: 'monospace',
      color: '#ffffff',
      align: 'center',
      lineSpacing: 6,
      wordWrap: { width: this.scale.width - 80 },
    }).setOrigin(0.5)

    this.add.text(cx, cy + 48, presentation.hint, {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#c8c8c8',
    }).setOrigin(0.5)

    this.input.keyboard.once('keydown-ENTER', () => {
      if (this.route === 'workshop') this.scene.start('Workshop')
      else this.scene.start('Menu')
    })
  }
}
