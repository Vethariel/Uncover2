import Phaser from 'phaser'
import { session } from '../../core/session.js'
import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  TILE_SIZE,
} from '../../config/constants.js'
import { LEVELS } from '../../config/levels.js'
import { levelStartDialogue } from '../../config/dialogues.js'
import { DialogueController } from '../../core/DialogueController.js'
import { createLevelResult } from '../../core/LevelResult.js'
import { GameController } from '../../game/GameController.js'
import { positionFromTile, syncTileFromPosition } from '../../game/entityTiles.js'
import { InputAdapter } from '../input/InputAdapter.js'
import { getAudio } from '../audio/AudioService.js'
import { SoundBridge } from '../audio/SoundBridge.js'
import { TilemapView } from '../views/TilemapView.js'
import { EntityView } from '../views/EntityView.js'
import { FogOfWarView } from '../views/FogOfWarView.js'
import { MinimapView } from '../views/MinimapView.js'
import { HudView } from '../views/HudView.js'
import { DialogueView } from '../views/DialogueView.js'
import { LevelCompleteView } from '../views/LevelCompleteView.js'
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

    if (this.dialogueController?.active) {
      this._updateDialogue(dt)
      return
    }

    if (this.levelResult) {
      this._updateLevelComplete()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._openOverlay('pause')
      return
    }

    const result = this.controller.update(this.world, dt, this.inputAdapter)
    this.soundBridge.handleEvents(result.events, dt, this.world)

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
      if (completedIndex === 0) {
        this._routeAfterVictory(completedIndex)
      } else {
        this._showLevelComplete(completedIndex)
      }
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
    this.dialogueController = new DialogueController()
    this.dialogueView = new DialogueView(this, this.dialogueController)
    this.levelCompleteView = new LevelCompleteView(this)
    this.levelResult = null
    this.chestPrompt = this.add.text(0, 0, 'E — ABRIR COFRE', {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: '#ffc857',
      backgroundColor: '#111820cc',
      padding: { x: 4, y: 2 },
    }).setDepth(980).setVisible(false)
    this._syncViews()
    this._setupCamera()

    this.pendingMusicKey = this.world.levelVisualConfig?.bgMusic ?? 'mov1_n1'
    this.audio.stopMusic()
    this._startDialogue(levelStartDialogue(
      this.gameState.currentLevelIndex,
      levelSpec.name,
    ))
    if (!this.dialogueController.active) {
      this._startLevelMusic()
    }
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

  _startDialogue(entries) {
    this.dialogueController.start(entries)
    this.dialogueView.show()
    this.chestPrompt?.setVisible(false)
    this.inputAdapter.flush()
  }

  _startLevelMusic() {
    const key = this.pendingMusicKey
    if (!key) return
    this.audio.playMusic(key)
    this.pendingMusicKey = null
  }

  _showLevelComplete(completedIndex) {
    const level = LEVELS[completedIndex] ?? LEVELS[0]
    this.levelResult = createLevelResult(
      this.world,
      completedIndex,
      level.name,
    )
    this.levelCompleteView.show(this.levelResult)
    this.audio.playOverlayMusic('victory', true)
    this.chestPrompt?.setVisible(false)
    this.inputAdapter.flush()
  }

  _updateLevelComplete() {
    // El resultado conserva el mundo congelado hasta confirmación explícita.
    if (!Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.bomb)) return

    const completedIndex = this.levelResult.levelIndex
    this.levelCompleteView.hide()
    this.levelResult = null
    this.audio.stopOverlay()
    this.inputAdapter.flush()
    this._routeAfterVictory(completedIndex)
  }

  _updateDialogue(dt) {
    // El GameLoop no avanza: enemigos, timer, bombas y control quedan congelados.
    // Solo se actualizan el tipeo y animaciones explícitas del guion.
    this.dialogueController.update(dt)
    this._updateDialogueAnimation(dt)

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.bomb)) {
      const result = this.dialogueController.advance()
      if (result.type === 'finished') {
        this.dialogueView.hide()
        this._startLevelMusic()
      }
    }

    this.dialogueView.sync()
    this.entityView.update()
    this._syncCamera()
    this.inputAdapter.flush()
  }

  /**
   * Hook de animación guionada durante diálogo.
   * entry.animation = { type:'movePlayerToTile', x, y, speed }
   */
  _updateDialogueAnimation(dt) {
    const animation = this.dialogueController.currentEntry?.animation
    if (animation?.type !== 'movePlayerToTile') return

    const player = this.world.player
    const target = positionFromTile(
      animation.x,
      animation.y,
      this.world.tileSize,
      player.size,
    )
    const dx = target.posX - player.posX
    const dy = target.posY - player.posY
    const distance = Math.hypot(dx, dy)
    if (distance <= 0.01) return

    if (Math.abs(dx) > Math.abs(dy)) {
      player.facing = dx > 0 ? DIR_RIGHT : DIR_LEFT
    } else {
      player.facing = dy > 0 ? DIR_DOWN : DIR_UP
    }

    const amount = Math.min(distance, (animation.speed ?? player.speed) * dt)
    player.posX += (dx / distance) * amount
    player.posY += (dy / distance) * amount
    syncTileFromPosition(player, this.world.tileSize)
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
    this.dialogueView?.destroy()
    this.dialogueView = null
    this.dialogueController = null
    this.levelCompleteView?.destroy()
    this.levelCompleteView = null
    this.levelResult = null
    this.chestPrompt?.destroy()
    this.chestPrompt = null
    this.pendingMusicKey = null
  }

  shutdown() {
    this.audio.stopOverlay()
    if (this.scene.isActive('GameOverlay')) {
      this.scene.stop('GameOverlay')
    }
  }
}
