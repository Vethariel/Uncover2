import { session } from '../../core/session.js'
import { getAudio } from '../audio/AudioService.js'
import {
  maybeFadeInFromBlackout,
  takeBlackoutFadeIn,
} from '../fx/blackout.js'
import { MenuBackgroundView } from '../views/MenuBackgroundView.js'
import { createUiButton } from '../ui/uiButton.js'

/** Ancla sobre la puerta del arte de menú (640×360), bajo el relieve. */
const DOOR_BUTTON_X = 478
const DOOR_BUTTON_Y = 268
const BUTTON_WIDTH = 152
const BUTTON_HEIGHT = 28
const BUTTON_GAP = 10

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

    const yNew = DOOR_BUTTON_Y - (BUTTON_HEIGHT + BUTTON_GAP) / 2
    const yDev = DOOR_BUTTON_Y + (BUTTON_HEIGHT + BUTTON_GAP) / 2

    this.btnNewGame = createUiButton(this, {
      x: DOOR_BUTTON_X,
      y: yNew,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      label: 'NUEVO JUEGO',
      onClick: () => this._startNewGame(),
    })

    this.btnDev = createUiButton(this, {
      x: DOOR_BUTTON_X,
      y: yDev,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      label: 'DEV',
      onClick: () => this._openDev(),
    })

    this.input.keyboard.on('keydown-ENTER', () => this._startNewGame())
    this.input.keyboard.on('keydown-N', () => this._startNewGame())
    this.input.keyboard.on('keydown-D', () => this._openDev())

    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this)
    }
  }

  _startNewGame() {
    this.gameState.wipeProgress()
    this.scene.start('LevelSelect')
  }

  _openDev() {
    this.scene.start('LevelSelect')
  }
}
