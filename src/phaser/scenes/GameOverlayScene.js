import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'

export class GameOverlayScene extends Phaser.Scene {
  constructor() {
    super('GameOverlay')
  }

  init(data) {
    this.overlayType = data.type
    this.duration = data.duration ?? 0
    this.countdownText = null
  }

  create() {
    this.gameState = session.gameState
    this.audio = getAudio(this)
    this.keys = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    })

    if (this.overlayType === 'pause') {
      this.audio.pauseMusic()
    } else if (['victory', 'levelIntro'].includes(this.overlayType)) {
      this.audio.pauseMusic()
    }

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2
    const dimAlpha = this.overlayType === 'pause' ? 0.6 : 0.55

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, dimAlpha).setDepth(0)

    this._buildTexts(cx, cy)
  }

  _buildTexts(cx, cy) {
    switch (this.overlayType) {
      case 'pause':
        this.add.text(cx, cy - 30, 'PAUSED', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5)
        this.add.text(cx, cy + 10, 'ESC TO RESUME', { fontSize: '8px', color: '#c8c8c8' }).setOrigin(0.5)
        this.add.text(cx, cy + 25, 'ENTER TO QUIT TO MENU', { fontSize: '8px', color: '#c8c8c8' }).setOrigin(0.5)
        break
      case 'victory':
        this.add.text(cx, cy - 20, 'LEVEL CLEAR!', { fontSize: '20px', color: '#ffdc00' }).setOrigin(0.5)
        this.countdownText = this.add
          .text(cx, cy + 15, '', { fontSize: '8px', color: '#ffffff' })
          .setOrigin(0.5)
        break
      case 'levelIntro':
        this.add.text(cx, cy - 20, 'LEVEL', { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5)
        this.add
          .text(cx, cy + 10, String(this.gameState.currentLevelIndex + 1), {
            fontSize: '20px',
            color: '#ffdc00',
          })
          .setOrigin(0.5)
        break
    }
  }

  update(_time, delta) {
    const dt = delta / 1000

    if (this.overlayType === 'pause') {
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
        this._close('resume')
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
        this._close('quit')
      }
      return
    }

    if (this.duration > 0) {
      this.duration -= dt
      if (this.overlayType === 'victory' && this.countdownText) {
        this.countdownText.setText(`NEXT LEVEL IN ${Math.ceil(this.duration)}...`)
      }
      if (this.duration > 0) return
    }

    this._close(this.overlayType)
  }

  _close(result) {
    const gameScene = this.scene.get('Game')
    this.audio.stopOverlay()
    this.scene.stop('GameOverlay')

    if (result === 'quit') {
      gameScene._cleanupLevel()
      this.scene.start('Menu')
      return
    }

    if (result === 'resume') {
      this._resumeGame()
      this.audio.resumeMusic()
      return
    }

    gameScene.onOverlayFinished(result)

    // victory encadena otro overlay → Game sigue pausado.
    if (result === 'levelIntro') {
      this._resumeGame()
    }
  }

  _resumeGame() {
    if (this.scene.isPaused('Game')) {
      this.scene.resume('Game')
    }
  }
}
