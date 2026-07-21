import Phaser from 'phaser'
import { session } from '../../core/session.js'
import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  TILE_DESTRUCTIBLE,
  TILE_SIZE,
  TILE_WALL,
} from '../../config/constants.js'
import { LEVELS } from '../../config/levels.js'
import { DialogueController } from '../../core/DialogueController.js'
import { NarrativeDirector } from '../../core/NarrativeDirector.js'
import { TutorialController } from '../../core/TutorialController.js'
import { createLevelResult } from '../../core/LevelResult.js'
import { evaluateN7Trial, isN7Level } from '../../config/n7Trial.js'
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
import { TutorialView } from '../views/TutorialView.js'
import { LevelCompleteView } from '../views/LevelCompleteView.js'
import { isNearOpenableChest } from '../../game/systems/PuzzleSystem.js'
import { entryWalkTarget } from '../../game/level/levelNpcs.js'
import {
  BLACKOUT_DATA_KEY,
  maybeFadeInFromBlackout,
  runBlackout,
  takeBlackoutFadeIn,
} from '../fx/blackout.js'

export class GameScene extends Phaser.Scene {
  constructor() {
    super('Game')
    this.controller = new GameController()
  }

  init(data) {
    this._pendingBlackoutFadeIn = takeBlackoutFadeIn(data)
  }

  create() {
    // Phaser reutiliza la instancia: un blackout previo hacia Workshop deja el flag.
    this._blackoutRunning = false
    this.gameState = session.gameState
    this.inputAdapter = new InputAdapter(this)
    this.audio = getAudio(this)
    this.soundBridge = new SoundBridge(this)

    this._startLevel()
    if (this._pendingBlackoutFadeIn) {
      this._pendingBlackoutFadeIn = false
      maybeFadeInFromBlackout(this, () => this._beginLevelIntro())
    } else {
      this._beginLevelIntro()
    }
  }

  update(_time, delta) {
    if (this._blackoutRunning) return

    const dt = Math.min(delta / 1000, 0.05)

    if (this._pendingLevelIntro) {
      this.entityView?.update()
      this._syncCamera()
      return
    }

    if (this.levelIntro) {
      this._updateLevelIntro(dt)
      return
    }

    if (this.narrativeDirector?.active) {
      this._updateNarrative(dt)
      return
    }

    if (this.levelResult) {
      this._updateLevelComplete()
      return
    }

    if (this._n7FailPending) {
      // Diálogo activo: lo maneja _updateNarrative. Si aún no, solo posar.
      if (!this.narrativeDirector?.active) {
        this.entityView?.freezePlayerForNarrative()
        this.entityView?.update()
        this._syncCamera()
      }
      this.inputAdapter.flush()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._openOverlay('pause')
      return
    }

    const result = this.controller.update(this.world, dt, this.inputAdapter)
    this.soundBridge.handleEvents(result.events, dt, this.world)
    this._scanFacingDiscoveries()

    this.tilemapView.update(dt)
    this.entityView.update()
    this.fogOfWarView.update(dt)
    this.minimapView.update()
    this.hudView.update()
    this._updateChestPrompt()
    this._syncCamera()

    if (this.narrativeDirector?.active) {
      this.inputAdapter.flush()
      return
    }

    if (result.trialTimeUp && !this._trialResolved) {
      this._trialResolved = true
      this._resolveN7TimeUp()
      this.inputAdapter.flush()
      return
    }

    if (result.gameOver) {
      this.gameState.syncFromPlayer(this.world.player)
      this.gameState.syncRunResourcesFromWorld(this.world)
      if (isN7Level(this.gameState.currentLevelIndex)) {
        this._beginN7FailSequence()
      } else {
        this._cleanupLevel()
        this.scene.start('GameOver')
      }
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

  _resolveN7TimeUp() {
    this.entityView?.freezePlayerIdle()
    const trial = evaluateN7Trial(this.world, this.world.levelVisualConfig ?? {})
    this.gameState.syncFromPlayer(this.world.player)
    this.gameState.syncRunResourcesFromWorld(this.world)

    if (trial.passed) {
      const completedIndex = this.gameState.currentLevelIndex
      this._showLevelComplete(completedIndex, trial)
      return
    }

    this._beginN7FailSequence()
  }

  _beginN7FailSequence() {
    this._n7FailPending = true
    this.entityView?.freezePlayerForNarrative()
    this.chestPrompt?.setVisible(false)
    this.narrativeDirector.onIdle = () => {
      this._n7FailPending = false
      this._goToGameOverAfterFail()
    }
    const first = !this.gameState.hasSeen('n7.fail.first')
    if (first) {
      this.narrativeDirector.tryFire('n7.fail.first', this.gameState)
    } else {
      this.narrativeDirector.forceFire('n7.fail.retry')
    }
    // Si no hay texto, ir directo al game over.
    if (!this.narrativeDirector.active) {
      this.narrativeDirector.onIdle = null
      this._n7FailPending = false
      this._goToGameOverAfterFail()
    }
  }

  _goToGameOverAfterFail() {
    this._cleanupLevel()
    // Dejar que el frame actual termine antes de cambiar de escena.
    this.scene.start('GameOver')
  }

  _routeAfterVictory(completedIndex) {
    this.entityView?.freezePlayerIdle()
    const route = this.gameState.routeAfterVictory(completedIndex)
    if (route === 'level') {
      runBlackout(this, {
        sameScene: true,
        onBlack: () => this._startLevel(),
        onReveal: () => this._beginLevelIntro(),
      })
      return
    }

    const nextScene = route === 'workshop' ? 'Workshop' : 'Menu'
    runBlackout(this, {
      onBlack: () => {
        this._cleanupLevel()
        this.scene.start(nextScene, { [BLACKOUT_DATA_KEY]: true })
      },
    })
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
    this.tutorialController = new TutorialController()
    this.tutorialView = new TutorialView(this, this.tutorialController)
    this.narrativeDirector = new NarrativeDirector({
      dialogueController: this.dialogueController,
      dialogueView: this.dialogueView,
      tutorialController: this.tutorialController,
      tutorialView: this.tutorialView,
      onIdle: () => this._startLevelMusic(),
    })
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
    this.levelIntro = null
    this._pendingLevelIntro = true
    this._trialResolved = false
    this._n7FailPending = false
  }

  /**
   * Camina 1 tile hacia el interior (opuesto al muro indestructible tras la puerta)
   * y recién entonces abre el diálogo de entrada.
   */
  _beginLevelIntro() {
    this._pendingLevelIntro = false
    const door = this.world?.entryDoor
    const player = this.world?.player
    const target = entryWalkTarget(door)
    if (!player || !target) {
      this._startLevelNarrative()
      return
    }

    player.facing = facingIntoRoom(door.orientation)
    this.levelIntro = {
      x: target.x,
      y: target.y,
      speed: player.speed,
    }
    this.inputAdapter.flush()
  }

  _updateLevelIntro(dt) {
    const intro = this.levelIntro
    const player = this.world.player
    if (!intro || !player) {
      this.levelIntro = null
      this._startLevelNarrative()
      return
    }

    const target = positionFromTile(
      intro.x,
      intro.y,
      this.world.tileSize,
      player.size,
    )
    const dx = target.posX - player.posX
    const dy = target.posY - player.posY
    const distance = Math.hypot(dx, dy)

    if (distance > 0.01) {
      const amount = Math.min(distance, (intro.speed ?? player.speed) * dt)
      player.posX += (dx / distance) * amount
      player.posY += (dy / distance) * amount
      syncTileFromPosition(player, this.world.tileSize)
    }

    this.entityView.update()
    this.fogOfWarView?.update(dt)
    this.minimapView?.update()
    this.hudView?.update()
    this._syncCamera()

    if (distance <= 0.01) {
      this.levelIntro = null
      this._startLevelNarrative()
    }
  }

  _startLevelNarrative() {
    const index = this.gameState.currentLevelIndex
    const fired = this.narrativeDirector.tryFire(`level.start.${index}`, this.gameState)
    if (!fired) {
      this._startLevelMusic()
    }
    this.chestPrompt?.setVisible(false)
    this.inputAdapter.flush()
  }

  /**
   * Descubrimientos / tutoriales: al mirar por primera vez el tile de delante
   * (mismo criterio que pico / fragmento / interact). Excepción: tut_move_bomb
   * sigue en level.start.0 tras el diálogo inicial.
   */
  _scanFacingDiscoveries() {
    const world = this.world
    const player = world?.player
    if (!player?.alive || !this.narrativeDirector) return

    const facing = facingTile(player)
    if (!facing || !world.grid.inBounds(facing.x, facing.y)) return

    const { x, y } = facing
    const tile = world.grid.get(x, y)

    if (tile === TILE_DESTRUCTIBLE) {
      const spawn = (world.resourceSpawns ?? []).find((s) => s.x === x && s.y === y)
      if (spawn?.material) {
        this.narrativeDirector.tryFire('discovery.destructible', this.gameState)
        if (spawn.material === 'crystal') {
          this.narrativeDirector.tryFire('discovery.crystal', this.gameState)
        }
      }
    }

    if (tile === TILE_WALL) {
      const fragment = (world.recipeFragmentSpawns ?? []).find(
        (s) => s.x === x && s.y === y,
      )
      if (fragment) {
        this.narrativeDirector.tryFire('discovery.fragment', this.gameState)
      }
    }

    const tablet = (world.puzzleTablets ?? []).find((t) => t.x === x && t.y === y)
    if (tablet) {
      this.narrativeDirector.tryFire('discovery.marks', this.gameState)
    }

    const chest = world.chest
    if (chest && !chest.opened && chest.x === x && chest.y === y) {
      this.narrativeDirector.tryFire('discovery.chest', this.gameState)
    }

    const trap = (world.traps ?? []).find(
      (t) => t.state !== 'disabled'
        && ((t.plate.x === x && t.plate.y === y)
          || (t.launcher.x === x && t.launcher.y === y)),
    )
    if (trap) {
      this.narrativeDirector.tryFire('discovery.trap', this.gameState)
    }

    const enemy = (world.enemies ?? []).find(
      (e) => e.alive && e.tileX === x && e.tileY === y,
    )
    if (enemy?.kind === 'golem_basic') {
      this.narrativeDirector.tryFire('discovery.golem', this.gameState)
    } else if (enemy?.kind === 'spirit') {
      this.narrativeDirector.tryFire('discovery.spirit', this.gameState)
    } else if (enemy?.kind === 'golem_advanced') {
      this.narrativeDirector.tryFire('discovery.golemAdvanced', this.gameState)
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

  _startLevelMusic() {
    const key = this.pendingMusicKey
    if (!key) return
    this.audio.playMusic(key)
    this.pendingMusicKey = null
  }

  _showLevelComplete(completedIndex, trial = null) {
    const level = LEVELS[completedIndex] ?? LEVELS[0]
    this.levelResult = createLevelResult(
      this.world,
      completedIndex,
      level.name,
    )
    if (trial) {
      this.levelResult.trial = trial
    } else if (isN7Level(completedIndex)) {
      this.levelResult.trial = evaluateN7Trial(
        this.world,
        this.world.levelVisualConfig ?? level,
      )
    }
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

  _updateNarrative(dt) {
    if (!this.narrativeDirector) return

    this.narrativeDirector.update(dt)
    this._updateDialogueAnimation(dt)

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.bomb)) {
      this.narrativeDirector.advance()
    }

    // advance() pudo cerrar el nivel (fail N7 → cleanup). No tocar vistas destruidas.
    if (!this.entityView?.playerSprite?.active) {
      this.inputAdapter.flush()
      return
    }

    this.entityView.update()
    this._syncCamera()
    this.inputAdapter.flush()
  }

  /**
   * Hook de animación guionada durante diálogo.
   * entry.animation = { type:'movePlayerToTile', x, y, speed }
   */
  _updateDialogueAnimation(dt) {
    if (this.narrativeDirector?.mode !== 'dialogue') return
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
    this.tilemapView = null
    this.entityView?.destroy()
    this.entityView = null
    this.fogOfWarView?.destroy()
    this.fogOfWarView = null
    this.minimapView?.destroy()
    this.minimapView = null
    this.hudView?.destroy()
    this.hudView = null
    this.narrativeDirector?.destroy()
    this.narrativeDirector = null
    this.dialogueView?.destroy()
    this.dialogueView = null
    this.dialogueController = null
    this.tutorialView?.destroy()
    this.tutorialView = null
    this.tutorialController = null
    this.levelCompleteView?.destroy()
    this.levelCompleteView = null
    this.levelResult = null
    this.levelIntro = null
    this._pendingLevelIntro = false
    this.chestPrompt?.destroy()
    this.chestPrompt = null
    this.pendingMusicKey = null
    this._trialResolved = false
    this._n7FailPending = false
  }

  shutdown() {
    this.audio.stopOverlay()
    if (this.scene.isActive('GameOverlay')) {
      this.scene.stop('GameOverlay')
    }
  }
}

/** Tile frontal central: un paso hacia dentro, opuesto al backing indestructible. */
function facingIntoRoom(orientation) {
  switch (orientation) {
    case 'north': return DIR_DOWN
    case 'south': return DIR_UP
    case 'west': return DIR_RIGHT
    case 'east': return DIR_LEFT
    default: return DIR_DOWN
  }
}

function facingTile(player) {
  let dx = 0
  let dy = 0
  switch (player.facing) {
    case DIR_UP: dy = -1; break
    case DIR_DOWN: dy = 1; break
    case DIR_LEFT: dx = -1; break
    case DIR_RIGHT: dx = 1; break
    default: return null
  }
  return { x: player.tileX + dx, y: player.tileY + dy }
}
