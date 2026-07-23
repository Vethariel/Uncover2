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
    if (!this.gameState.hasSave()) {
      this.gameState.resetCampaign()
    }

    getAudio(this).playMusic('menu')

    this.menuBg = new MenuBackgroundView(this)

    const yPrimary = DOOR_BUTTON_Y - (BUTTON_HEIGHT + BUTTON_GAP) / 2
    const yDev = DOOR_BUTTON_Y + (BUTTON_HEIGHT + BUTTON_GAP) / 2
    this._canContinue = this.gameState.canContinue()
    this._selected = 0

    this.btnPrimary = createUiButton(this, {
      x: DOOR_BUTTON_X,
      y: yPrimary,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      label: this._canContinue ? 'CONTINUAR' : 'NUEVO JUEGO',
      onClick: () => this._onPrimary(),
    })

    this.btnDev = createUiButton(this, {
      x: DOOR_BUTTON_X,
      y: yDev,
      width: BUTTON_WIDTH,
      height: BUTTON_HEIGHT,
      label: 'DEV',
      onClick: () => this._openDev(),
    })

    this.btnPrimary.bg.on('pointerover', () => this._setSelected(0))
    this.btnDev.bg.on('pointerover', () => this._setSelected(1))

    this._setSelected(0)

    this.input.keyboard.on('keydown-UP', () => this._move(-1))
    this.input.keyboard.on('keydown-W', () => this._move(-1))
    this.input.keyboard.on('keydown-DOWN', () => this._move(1))
    this.input.keyboard.on('keydown-S', () => this._move(1))
    this.input.keyboard.on('keydown-ENTER', () => this._confirm())
    this.input.keyboard.on('keydown-SPACE', () => this._confirm())

    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this)
    }
  }

  _move(delta) {
    this._setSelected((this._selected + delta + 2) % 2)
  }

  _setSelected(index) {
    this._selected = index
    this.btnPrimary.setFocused(index === 0)
    this.btnDev.setFocused(index === 1)
  }

  _confirm() {
    if (this._selected === 0) this._onPrimary()
    else this._openDev()
  }

  _onPrimary() {
    if (this._canContinue) this._continueGame()
    else this._startNewGame()
  }

  /** Nueva campaña: modo normal, wipe y arranca N1 sin selector. */
  _startNewGame() {
    this.gameState.enterPlayMode('normal')
    this.gameState.wipeProgress()
    this.gameState.enterPlayMode('normal')
    this.gameState.currentLevelIndex = 0
    this.scene.start('Game')
  }

  /** Retoma en el taller (reintento del nivel actual). */
  _continueGame() {
    this.gameState.enterPlayMode('normal')
    this.scene.start('Workshop')
  }

  /** Selector de niveles (debug); habilita T/Y. */
  _openDev() {
    this.gameState.enterPlayMode('dev')
    this.scene.start('LevelSelect')
  }
}
