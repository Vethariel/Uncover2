import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { DialogueController } from '../../core/DialogueController.js'
import { NarrativeDirector } from '../../core/NarrativeDirector.js'
import { DialogueView } from '../views/DialogueView.js'
import { TutorialController } from '../../core/TutorialController.js'
import { TutorialView } from '../views/TutorialView.js'
import { getAudio } from '../audio/AudioService.js'
import {
  COLOR_MUTED,
  FONT_SIZE_DISPLAY_LG,
  FONT_SIZE_HINT,
  textStyleBody,
  textStyleDisplay,
} from '../../config/typography.js'

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

    this.presentation = presentation
    this._readyToLeave = presentation.kind !== 'tutorial_wipe'

    this.dialogueController = new DialogueController()
    this.dialogueView = new DialogueView(this, this.dialogueController)
    this.tutorialController = new TutorialController()
    this.tutorialView = new TutorialView(this, this.tutorialController)
    this.narrativeDirector = new NarrativeDirector({
      dialogueController: this.dialogueController,
      dialogueView: this.dialogueView,
      tutorialController: this.tutorialController,
      tutorialView: this.tutorialView,
      onIdle: () => {
        this._readyToLeave = true
        this._refreshStaticUi()
      },
    })

    this._buildStaticUi(presentation)

    if (presentation.kind === 'tutorial_wipe') {
      this.narrativeDirector.forceFire('wipe.tutorial')
    }
  }

  update(_time, delta) {
    if (this.narrativeDirector?.active) {
      this.narrativeDirector.update(Math.min(delta / 1000, 0.05))
      if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('SPACE'))) {
        this.narrativeDirector.advance()
      }
      return
    }

    if (!this._readyToLeave) return

    if (Phaser.Input.Keyboard.JustDown(this.input.keyboard.addKey('ENTER'))) {
      if (this.route === 'workshop') this.scene.start('Workshop')
      else this.scene.start('Menu')
    }
  }

  _buildStaticUi(presentation) {
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2

    this.titleText = this.add.text(
      cx,
      cy - 48,
      presentation.title,
      textStyleDisplay({
        fontSize: `${FONT_SIZE_DISPLAY_LG}px`,
        align: 'center',
      }),
    ).setOrigin(0.5)

    this.detailText = this.add.text(
      cx,
      cy - 8,
      presentation.detail,
      textStyleBody({
        fontSize: `${FONT_SIZE_HINT}px`,
        color: '#ffffff',
        align: 'center',
        lineSpacing: 6,
        wordWrap: { width: this.scale.width - 80 },
      }),
    ).setOrigin(0.5)

    this.hintText = this.add.text(
      cx,
      cy + 48,
      '',
      textStyleBody({ fontSize: `${FONT_SIZE_HINT}px`, color: COLOR_MUTED }),
    ).setOrigin(0.5)

    this._refreshStaticUi()
  }

  _refreshStaticUi() {
    const hint = this._readyToLeave
      ? (this.route === 'workshop'
        ? 'PRESS ENTER TO RETURN TO WORKSHOP'
        : 'PRESS ENTER TO RETURN TO MENU')
      : 'PRESS SPACE'
    this.hintText?.setText(hint)
  }
}
