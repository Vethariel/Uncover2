import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'
import { TILE_SIZE } from '../../config/constants.js'
import { GameController } from '../../game/GameController.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { SoundBridge } from '../audio/SoundBridge.js'
import { createLevelAssets } from '../level/LevelAssets.js'
import { TilemapView } from '../views/TilemapView.js'
import { EntityView } from '../views/EntityView.js'
import { HudView } from '../views/HudView.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
    this.controller = new GameController()
  }

  init(data) {
    this.showIntroOnStart = data.showIntro ?? false
  }

  create() {
    this.gameState = session.gameState
    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.soundBridge = new SoundBridge(this)

    this._startLevel()

    if (this.showIntroOnStart) {
      this.audio.playOverlayMusic('levelStart', false)
      this._openOverlay('levelIntro', 3.7)
    }
  }

  update(_time, delta) {
    const dt = Math.min(delta / 1000, 0.05)

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._openOverlay('pause')
      return
    }

    const result = this.controller.update(this.world, dt, this.inputAdapter)
    this.soundBridge.handleEvents(result.events, dt)

    this.tilemapView.update()
    this.entityView.update()
    this.hudView.update()

    if (result.gameOver) {
      this.gameState.syncFromPlayer(this.world.player)
      this._cleanupLevel()
      this.scene.start('GameOver')
      return
    }

    if (result.gameWon) {
      this.gameState.syncFromPlayer(this.world.player)
      this.gameState.save()
      this.world.gameWon = false
      this.audio.playOverlayMusic('victory', false)
      this._openOverlay('victory', 4)
      return
    }

    if (result.timeUp) {
      this.gameState.syncFromPlayer(this.world.player)
      this.world.timeUp = false
      this.audio.playOverlayMusic('timeUp', false)
      this._openOverlay('timeUp', 2)
    }

    this.inputAdapter.flush()
  }

  onOverlayFinished(type) {
    switch (type) {
      case 'victory':
        this.gameState.nextLevel()
        if (this.gameState.currentLevelIndex >= LEVELS.length) {
          this._cleanupLevel()
          this.scene.start('Menu')
        } else {
          this._startLevel()
          this.audio.playOverlayMusic('levelStart', false)
          this._openOverlay('levelIntro', 3.7)
        }
        break
      case 'levelIntro':
        this.audio.resumeMusic()
        break
      case 'timeUp':
        this._startLevel()
        this.audio.playOverlayMusic('levelStart', false)
        this._openOverlay('levelIntro', 3.7)
        break
    }
  }

  _openOverlay(type, duration = 0) {
    if (this.scene.isActive('GameOverlay')) return

    this.scene.launch('GameOverlay', { type, duration })
    this.scene.pause()
    this.inputAdapter.flush()
  }

  _startLevel() {
    this._cleanupLevel()

    const assets = createLevelAssets(this)
    this.world = this.controller.createWorld(TILE_SIZE, this.gameState.currentLevelIndex, assets)
    this.gameState.applyToPlayer(this.world.player)
    this.gameState.save()

    this.tilemapView = new TilemapView(this, this.world)
    this.entityView = new EntityView(this, this.world)
    this.hudView = new HudView(this, this.world, this.gameState)
    this._syncViews()

    const musicKey = this.world.levelVisualConfig?.bgMusic ?? 'world1'
    this.audio.playMusic(musicKey)
  }

  _syncViews() {
    this.tilemapView?.update()
    this.entityView?.update()
    this.hudView?.update()
  }

  _cleanupLevel() {
    this.tilemapView?.destroy()
    this.entityView?.destroy()
    this.hudView?.destroy()
  }

  shutdown() {
    this.audio.stopOverlay()
    if (this.scene.isActive('GameOverlay')) {
      this.scene.stop('GameOverlay')
    }
  }
}
