import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'
import {
  maybeFadeInFromBlackout,
  takeBlackoutFadeIn,
} from '../fx/blackout.js'
import { MenuBackgroundView } from '../views/MenuBackgroundView.js'

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('Menu')
  }

  init(data) {
    this._pendingBlackoutFadeIn = takeBlackoutFadeIn(data)
  }

  create() {
    this.gameState = session.gameState
    // No borrar progreso al visitar el menú; New Game solo si no hay save o tras wipe.
    if (!this.gameState.hasSave()) {
      this.gameState.resetCampaign()
    }

    getAudio(this).playMusic('menu')

    this.menuBg = new MenuBackgroundView(this)

    const cx = this.scale.width / 2
    const promptStyle = {
      fontSize: '8px',
      color: '#e8e0d0',
      stroke: '#000000',
      strokeThickness: 3,
    }

    this.pressText = this.add
      .text(cx, this.scale.height - 36, 'PRESS ENTER TO START', promptStyle)
      .setOrigin(0.5)
      .setDepth(10)

    this.tweens.add({
      targets: this.pressText,
      alpha: 0.35,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })

    this.add
      .text(cx, this.scale.height - 18, 'N — NEW GAME', {
        fontSize: '8px',
        color: '#9aa3ad',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(10)

    this.input.keyboard.on('keydown-ENTER', () => {
      this.scene.start('LevelSelect')
    })
    this.input.keyboard.on('keydown-N', () => {
      this.gameState.wipeProgress()
      this.scene.start('LevelSelect')
    })

    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this)
    }
  }
}
