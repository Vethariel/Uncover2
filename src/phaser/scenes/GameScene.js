import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'
import { TILE_SIZE, INTERNAL_WIDTH, INTERNAL_HEIGHT } from '../../config/constants.js'
import { GameController } from '../../game/GameController.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { SoundBridge } from '../audio/SoundBridge.js'
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
      this.events.once(Phaser.Scenes.Events.UPDATE, () => {
        this._openOverlay('levelIntro', 3.7)
      })
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
    this._syncCamera()

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
    }
  }

  _openOverlay(type, duration = 0) {
    if (this.scene.isActive('GameOverlay')) {
      this.scene.stop('GameOverlay')
    }

    this.scene.launch('GameOverlay', { type, duration })
    this._pauseForOverlay()
    this.inputAdapter.flush()
  }

  _pauseForOverlay() {
    if (!this.scene.isActive('Game') || this.scene.isPaused('Game')) return
    this.scene.pause('Game')
  }

  _startLevel() {
    this._cleanupLevel()

    this.world = this.controller.createWorld(TILE_SIZE, this.gameState.currentLevelIndex)
    this.gameState.applyToPlayer(this.world.player)
    this.gameState.save()

    this.tilemapView = new TilemapView(this, this.world)
    this.entityView = new EntityView(this, this.world)
    this.hudView = new HudView(this, this.world, this.gameState)
    this._syncViews()
    this._setupCamera()

    const musicKey = this.world.levelVisualConfig?.bgMusic ?? 'world1'
    this.audio.playMusic(musicKey)
  }

  _setupCamera() {
    const { grid, player } = this.world
    const cam = this.cameras.main

    // Objetivo invisible que sigue al jugador (los sprites reales viven en un Graphics único).
    this.cameraTarget = this.add.rectangle(
      player.posX + player.size / 2,
      player.posY + player.size / 2,
      1,
      1,
    ).setVisible(false)

    cam.setBounds(0, 0, grid.cols * TILE_SIZE, grid.rows * TILE_SIZE)
    cam.setDeadzone(INTERNAL_WIDTH * 0.35, INTERNAL_HEIGHT * 0.35)
    cam.startFollow(this.cameraTarget, true, 0.15, 0.15)
    cam.roundPixels = true
  }

  _syncCamera() {
    const player = this.world?.player
    if (!player || !this.cameraTarget) return
    this.cameraTarget.setPosition(player.posX + player.size / 2, player.posY + player.size / 2)
  }

  _syncViews() {
    this.tilemapView?.update()
    this.entityView?.update()
    this.hudView?.update()
  }

  _cleanupLevel() {
    this.cameras.main.stopFollow()
    this.cameraTarget?.destroy()
    this.cameraTarget = null
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
