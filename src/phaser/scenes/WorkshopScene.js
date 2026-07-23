import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'
import { TILE_SIZE } from '../../config/constants.js'
import { DialogueController } from '../../core/DialogueController.js'
import { NarrativeDirector } from '../../core/NarrativeDirector.js'
import { TutorialController } from '../../core/TutorialController.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { WorkshopView } from '../views/WorkshopView.js'
import { WorkshopHudView } from '../views/WorkshopHudView.js'
import { FurnacePanelView } from '../views/FurnacePanelView.js'
import { AnvilPanelView } from '../views/AnvilPanelView.js'
import { DialogueView } from '../views/DialogueView.js'
import { TutorialView } from '../views/TutorialView.js'
import { createWorkshopWorld } from '../../game/workshop/WorkshopWorld.js'
import { WorkshopLoop } from '../../game/workshop/WorkshopLoop.js'
import {
  BLACKOUT_DATA_KEY,
  maybeFadeInFromBlackout,
  runBlackout,
  takeBlackoutFadeIn,
} from '../fx/blackout.js'
import {
  COLOR_TITLE,
  FONT_SIZE_HUD,
  textStyleBody,
} from '../../config/typography.js'

export class WorkshopScene extends Phaser.Scene {
  constructor() {
    super('Workshop')
  }

  init(data) {
    this._pendingBlackoutFadeIn = takeBlackoutFadeIn(data)
  }

  create() {
    this._blackoutRunning = false
    this._cleanupHubUi()

    this.gameState = session.gameState
    this.gameState.recomputeStatsFromUpgrades()
    this.gameState.hubUnlocked = true
    this.gameState.save()

    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.loop = new WorkshopLoop()
    this.world = createWorkshopWorld(TILE_SIZE, {
      excavatorInHub: this.gameState.hasSeen('excavatorInHub'),
    })
    this.gameState.applyToPlayer(this.world.player)

    this.view = new WorkshopView(this, this.world)
    this.dialogueController = new DialogueController()
    this.dialogueView = new DialogueView(this, this.dialogueController)
    this.tutorialController = new TutorialController()
    this.tutorialView = new TutorialView(this, this.tutorialController)
    this.narrativeDirector = new NarrativeDirector({
      dialogueController: this.dialogueController,
      dialogueView: this.dialogueView,
      tutorialController: this.tutorialController,
      tutorialView: this.tutorialView,
    })

    this.stationPanel = null
    this.promptText = this.add.text(
      0,
      0,
      '',
      textStyleBody({
        fontSize: `${FONT_SIZE_HUD}px`,
        color: COLOR_TITLE,
        backgroundColor: '#111820cc',
        padding: { x: 4, y: 2 },
      }),
    ).setScrollFactor(0).setDepth(1000).setVisible(false)

    this.hud = new WorkshopHudView(this, this.gameState)
    this._buildStationLabels()

    this.cameras.main.setBounds(
      0,
      0,
      this.world.grid.cols * TILE_SIZE,
      this.world.grid.rows * TILE_SIZE,
    )
    this.cameras.main.centerOn(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY + this.world.player.size / 2,
    )

    this.audio.playMusic('workshop')

    const startNarrative = () => this._startHubNarrative()
    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this, startNarrative)
    } else {
      startNarrative()
    }
  }

  update(_time, delta) {
    if (this._blackoutRunning) return

    const dt = Math.min(delta / 1000, 0.05)

    const jobEvents = this.gameState.tickWorkshopJobs(dt)
    if (jobEvents.smeltReady || jobEvents.anvilDone) {
      this.gameState.save()
      this.hud?.refresh()
      this.stationPanel?.refresh()
      if (jobEvents.anvilDone) {
        this.narrativeDirector.tryFire('craft.firstAlloy', this.gameState)
      }
    } else if (this.gameState.furnaceJob || this.gameState.anvilJob) {
      this.stationPanel?.refresh()
    }

    if (this.narrativeDirector?.active) {
      this._updateNarrative(dt)
      return
    }

    if (this.stationPanel) {
      this.stationPanel.handleInput(this.inputAdapter)
      this.view?.freezePlayerIdle()
      this.inputAdapter.flush()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this.inputAdapter.flush()
      return
    }

    const result = this.loop.update(this.world, dt, this.inputAdapter)
    this.view.update()
    this._updatePrompt(result.focus)

    if (result.interact?.type === 'station') {
      this._openStation(result.interact.station)
    } else if (result.interact?.type === 'npc') {
      this._talkToNpc(result.interact.npc)
    } else if (result.interact?.type === 'door') {
      this._leaveHub()
    }

    this.inputAdapter.flush()
  }

  _startHubNarrative() {
    if (!this.gameState.hasSeen('hub.intro')) {
      this.narrativeDirector.tryFire('hub.intro', this.gameState)
      return
    }

    if (
      this.gameState.hasSeen('excavatorInHub')
      && !this.gameState.hasSeen('hub.excavator.arrival')
    ) {
      this.narrativeDirector.tryFire('hub.excavator.arrival', this.gameState)
      return
    }

    const entry = this.gameState.hubEntry
    const levelN = this.gameState.hubNarrativeLevel
    if (entry === 'advance' && levelN != null && levelN >= 3) {
      this.narrativeDirector.tryFire(`hub.advance.${levelN}`, this.gameState)
      return
    }
    if (entry === 'retry' && levelN != null && levelN >= 3) {
      this.narrativeDirector.forceFire(`hub.retry.${levelN}`)
    }
  }

  _talkToNpc(npc) {
    this.view?.freezePlayerIdle()
    const eventId = npc.id === 'excavator' ? 'hub.idle.excavator' : 'hub.idle.brun'
    this.narrativeDirector.forceFire(eventId)
    this.promptText?.setVisible(false)
    this.inputAdapter.flush()
  }

  _updateNarrative(dt) {
    this.narrativeDirector.update(dt)
    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.bomb)) {
      this.narrativeDirector.advance()
    }
    this.view?.freezePlayerIdle()
    this.inputAdapter.flush()
  }

  _buildStationLabels() {
    for (const station of this.world.stations) {
      const anchor = station._labelAnchor
      this.add.text(
        anchor.x,
        anchor.y,
        station.label,
        textStyleBody({ fontSize: '10px', color: '#ffffff' }),
      ).setOrigin(0.5, 1)
    }
  }

  _updatePrompt(focus) {
    if (!focus || focus.type === 'door') {
      this.promptText.setVisible(false)
      return
    }
    const label = focus.type === 'npc'
      ? focus.npc.label
      : focus.station.label
    this.promptText.setText(`E — ${label}`)
    this.promptText.setPosition(
      this.world.player.posX + this.world.player.size / 2,
      this.world.player.posY - 10,
    )
    this.promptText.setOrigin(0.5, 1)
    this.promptText.setVisible(true)
  }

  _openStation(station) {
    this.view?.freezePlayerIdle()
    this.promptText?.setVisible(false)
    this._closeStationPanel()

    const handlers = {
      onClose: () => this._closeStationPanel(),
      onChanged: (ev) => {
        this.hud?.refresh()
        if (ev?.kind === 'smeltStart' || ev?.kind === 'smeltCollect') {
          this.narrativeDirector.tryFire('craft.firstSmelt', this.gameState)
        }
        if (ev?.kind === 'craftStart') {
          this.narrativeDirector.tryFire('craft.firstAlloy', this.gameState)
        }
        if (this.narrativeDirector.active) {
          this._closeStationPanel()
        }
      },
    }

    if (station.kind === 'furnace') {
      this.stationPanel = new FurnacePanelView(this, this.gameState, handlers)
    } else {
      this.stationPanel = new AnvilPanelView(this, this.gameState, handlers)
    }
    this.inputAdapter.flush()
  }

  _closeStationPanel() {
    this.stationPanel?.destroy()
    this.stationPanel = null
    this.inputAdapter?.flush()
  }

  _leaveHub() {
    this.view?.freezePlayerIdle()
    const index = this.gameState.levelIndexForHubExit()
    const nextScene = index >= LEVELS.length ? 'Menu' : 'Game'
    runBlackout(this, {
      onBlack: () => {
        if (nextScene === 'Game') {
          this.gameState.hubEntry = null
          this.gameState.hubNarrativeLevel = null
          this.gameState.save()
        }
        this.scene.start(nextScene, { [BLACKOUT_DATA_KEY]: true })
      },
    })
  }

  _cleanupHubUi() {
    this._closeStationPanel()
    this.narrativeDirector?.destroy()
    this.narrativeDirector = null
    this.dialogueView?.destroy()
    this.dialogueView = null
    this.dialogueController = null
    this.tutorialView?.destroy()
    this.tutorialView = null
    this.tutorialController = null
    this.hud?.destroy()
    this.hud = null
    this.view?.destroy()
    this.view = null
    this.promptText?.destroy()
    this.promptText = null
  }
}
