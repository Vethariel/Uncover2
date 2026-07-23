import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'
import {
  COLOR_MUTED,
  FONT_SIZE_DISPLAY_LG,
  FONT_SIZE_HINT,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'

/** Overlay de pausa. Intro/victoria se manejan por otro flujo. */
export class GameOverlayScene extends Phaser.Scene {
  constructor() {
    super('GameOverlay')
  }

  init(data) {
    this.overlayType = data.type
  }

  create() {
    this.gameState = session.gameState
    this.audio = getAudio(this)
    this.keys = this.input.keyboard.addKeys({
      esc: Phaser.Input.Keyboard.KeyCodes.ESC,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    })

    this.audio.duckMusic(0.22)

    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.add.rectangle(cx, cy, this.scale.width, this.scale.height, 0x000000, 0.6).setDepth(0)
    this.add.text(
      cx,
      cy - 30,
      'PAUSED',
      textStyleDisplay({
        fontSize: `${FONT_SIZE_DISPLAY_LG}px`,
        color: '#ffffff',
      }),
    ).setOrigin(0.5)
    this.add.text(
      cx,
      cy + 10,
      'ESC TO RESUME',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: COLOR_MUTED }),
    ).setOrigin(0.5)
    this.add.text(
      cx,
      cy + 25,
      'ENTER TO QUIT TO MENU',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: COLOR_MUTED }),
    ).setOrigin(0.5)
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
      this._close('resume')
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
      this._close('quit')
    }
  }

  _close(result) {
    const gameScene = this.scene.get('Game')
    this.audio.stopOverlay()
    this.scene.stop('GameOverlay')

    if (result === 'quit') {
      this.audio.unduckMusic()
      // Salir a mitad de partida = game over de ese nivel.
      gameScene._cleanupLevel()
      gameScene.scene.start('GameOver')
      return
    }

    if (this.scene.isPaused('Game')) {
      this.scene.resume('Game')
    }
    this.audio.unduckMusic()
  }
}
