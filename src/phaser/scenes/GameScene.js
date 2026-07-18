import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { TILE_SIZE } from '../../config/constants.js'
import { LEVELS } from '../../config/levels.js'
import { GameController } from '../../game/GameController.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { SoundBridge } from '../audio/SoundBridge.js'
import { TilemapView } from '../views/TilemapView.js'
import { EntityView } from '../views/EntityView.js'
import { FogOfWarView } from '../views/FogOfWarView.js'
import { MinimapView } from '../views/MinimapView.js'
import { HudView } from '../views/HudView.js'
import { isNearOpenableChest } from '../../game/systems/PuzzleSystem.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
    this.controller = new GameController()
  }

  init(_data) {
  }

  create() {
    this.gameState = session.gameState
    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.soundBridge = new SoundBridge(this)

    this._startLevel()
  }

  update(_time, delta) {
    const dt = Math.min(delta / 1000, 0.05)

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._openOverlay('pause')
      return
    }

    const result = this.controller.update(this.world, dt, this.inputAdapter)
    this.soundBridge.handleEvents(result.events, dt)

    this.tilemapView.update(dt)
    this.entityView.update()
    this.fogOfWarView.update(dt)
    this.minimapView.update()
    this.hudView.update()
    this._updateChestPrompt()
    this._syncCamera()

    if (result.gameOver) {
      this.gameState.syncFromPlayer(this.world.player)
      this.gameState.syncRunResourcesFromWorld(this.world)
      this._cleanupLevel()
      this.scene.start('GameOver')
      return
    }

    if (result.gameWon) {
      this.gameState.syncFromPlayer(this.world.player)
      this.gameState.syncRunResourcesFromWorld(this.world)
      const completedIndex = this.gameState.currentLevelIndex
      this.world.gameWon = false
      this._routeAfterVictory(completedIndex)
      return
    }

    this.inputAdapter.flush()
  }

  _routeAfterVictory(completedIndex) {
    const route = this.gameState.routeAfterVictory(completedIndex)
    if (route === 'menu') {
      this._cleanupLevel()
      this.scene.start('Menu')
    } else if (route === 'workshop') {
      this._cleanupLevel()
      this.scene.start('Workshop')
    } else {
      this._startLevel()
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

    const levelSpec = LEVELS[this.gameState.currentLevelIndex] ?? LEVELS[0]
    const fragmentPlan = this.gameState.prepareFragmentPlanForLevel(levelSpec)
    this.world = this.controller.createWorld(
      TILE_SIZE,
      this.gameState.currentLevelIndex,
      {
        levelSpec: {
          fragmentPlan,
          fragmentEligibility: this.gameState.fragmentEligibility(),
        },
      },
    )
    this.gameState.applyToPlayer(this.world.player)
    this.gameState.applyRunResourcesToWorld(this.world)
    this.gameState.save()

    this.tilemapView = new TilemapView(this, this.world)
    this.entityView = new EntityView(this, this.world)
    this.fogOfWarView = new FogOfWarView(this, this.world)
    this.minimapView = new MinimapView(this, this.world)
    this.hudView = new HudView(this, this.world)
    this.chestPrompt = this.add.text(0, 0, 'E — ABRIR COFRE', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffc857',
      backgroundColor: '#111820cc',
      padding: { x: 4, y: 2 },
    }).setDepth(980).setVisible(false)
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
    cam.startFollow(this.cameraTarget, true, 1, 1)
    cam.roundPixels = true
  }

  _syncCamera() {
    const player = this.world?.player
    if (!player || !this.cameraTarget) return
    this.cameraTarget.setPosition(player.posX + player.size / 2, player.posY + player.size / 2)
  }

  _updateChestPrompt() {
    if (!this.chestPrompt || !this.world?.player) return
    const player = this.world.player
    if (!isNearOpenableChest(this.world, player)) {
      this.chestPrompt.setVisible(false)
      return
    }
    this.chestPrompt.setText('E — ABRIR COFRE')
    this.chestPrompt.setPosition(
      player.posX + player.size / 2,
      player.posY - 10,
    )
    this.chestPrompt.setOrigin(0.5, 1)
    this.chestPrompt.setVisible(true)
  }

  _syncViews() {
    this.tilemapView?.update()
    this.entityView?.update()
    this.fogOfWarView?.update()
    this.minimapView?.update()
    this.hudView?.update()
  }

  _cleanupLevel() {
    this.cameras.main.stopFollow()
    this.cameraTarget?.destroy()
    this.cameraTarget = null
    this.tilemapView?.destroy()
    this.entityView?.destroy()
    this.fogOfWarView?.destroy()
    this.minimapView?.destroy()
    this.hudView?.destroy()
    this.chestPrompt?.destroy()
    this.chestPrompt = null
  }

  shutdown() {
    this.audio.stopOverlay()
    if (this.scene.isActive('GameOverlay')) {
      this.scene.stop('GameOverlay')
    }
  }
}
