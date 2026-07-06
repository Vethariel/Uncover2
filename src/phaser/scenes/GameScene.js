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
    this.overlay = null
    this.overlayTimer = 0

    this._startLevel()

    if (this.showIntroOnStart) {
      this._showOverlay('levelIntro', 3.7)
      this.audio.playOverlayMusic('levelStart', false)
    }
  }

  update(_time, delta) {
    const dt = Math.min(delta / 1000, 0.05)

    if (this.overlay) {
      this._updateOverlay(dt)
      if (this.overlay === 'levelIntro') {
        this._syncViews()
      }
      this.inputAdapter.flush()
      return
    }

    if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
      this._showOverlay('pause')
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
      this._showOverlay('victory', 4)
      this.audio.playOverlayMusic('victory', false)
      return
    }

    if (result.timeUp) {
      this.gameState.syncFromPlayer(this.world.player)
      this.world.timeUp = false
      this._showOverlay('timeUp', 2)
      this.audio.playOverlayMusic('timeUp', false)
    }

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
    this.overlayUi?.destroy()
    this.overlayUi = null
  }

  _showOverlay(type, duration = 0) {
    this.overlay = type
    this.overlayTimer = duration

    if (type === 'pause') {
      this.audio.pauseMusic()
    }

    if (type === 'victory' || type === 'timeUp' || type === 'levelIntro') {
      this.audio.pauseMusic()
    }
    this.overlayUi = this.add.container(0, 0)
    this.overlayUi.setDepth(1000)

    const dim = this.add.rectangle(
      this.scale.width / 2,
      this.scale.height / 2,
      this.scale.width,
      this.scale.height,
      0x000000,
      type === 'pause' ? 0.6 : 0.55,
    )
    this.overlayUi.add(dim)

    const texts = this._overlayTexts(type)
    for (const t of texts) this.overlayUi.add(t)
  }

  _overlayTexts(type) {
    const cx = this.scale.width / 2
    const cy = this.scale.height / 2
    const texts = []

    switch (type) {
      case 'pause':
        texts.push(this.add.text(cx, cy - 30, 'PAUSED', { fontSize: '20px', color: '#ffffff' }).setOrigin(0.5))
        texts.push(this.add.text(cx, cy + 10, 'ESC TO RESUME', { fontSize: '8px', color: '#c8c8c8' }).setOrigin(0.5))
        texts.push(this.add.text(cx, cy + 25, 'ENTER TO QUIT TO MENU', { fontSize: '8px', color: '#c8c8c8' }).setOrigin(0.5))
        break
      case 'victory':
        texts.push(this.add.text(cx, cy - 20, 'LEVEL CLEAR!', { fontSize: '20px', color: '#ffdc00' }).setOrigin(0.5))
        this.overlayCountdown = this.add.text(cx, cy + 15, '', { fontSize: '8px', color: '#ffffff' }).setOrigin(0.5)
        texts.push(this.overlayCountdown)
        break
      case 'levelIntro':
        texts.push(this.add.text(cx, cy - 20, 'LEVEL', { fontSize: '10px', color: '#ffffff' }).setOrigin(0.5))
        texts.push(this.add.text(cx, cy + 10, String(this.gameState.currentLevelIndex + 1), {
          fontSize: '20px',
          color: '#ffdc00',
        }).setOrigin(0.5))
        break
      case 'timeUp':
        texts.push(this.add.text(cx, cy - 20, 'TIME OUT!', { fontSize: '20px', color: '#dc3c3c' }).setOrigin(0.5))
        texts.push(this.add.text(cx, cy + 15, 'HURRY UP NEXT TIME...', { fontSize: '8px', color: '#c8c8c8' }).setOrigin(0.5))
        break
    }

    return texts
  }

  _updateOverlay(dt) {
    if (this.overlay === 'pause') {
      if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.escape)) {
        this._hideOverlay()
      }
      if (Phaser.Input.Keyboard.JustDown(this.inputAdapter.keys.enter)) {
        this._cleanupLevel()
        this.scene.start('Menu')
      }
      return
    }

    if (this.overlayTimer > 0) {
      this.overlayTimer -= dt
      if (this.overlay === 'victory' && this.overlayCountdown) {
        this.overlayCountdown.setText(`NEXT LEVEL IN ${Math.ceil(this.overlayTimer)}...`)
      }
      if (this.overlayTimer > 0) return
    }

    const type = this.overlay
    this._hideOverlay()

    switch (type) {
      case 'victory':
        this.gameState.nextLevel()
        if (this.gameState.currentLevelIndex >= LEVELS.length) {
          this._cleanupLevel()
          this.scene.start('Menu')
        } else {
          this._startLevel()
          this._showOverlay('levelIntro', 3.7)
          this.audio.playOverlayMusic('levelStart', false)
        }
        break
      case 'levelIntro':
        this.audio.resumeMusic()
        break
      case 'timeUp':
        this._startLevel()
        this._showOverlay('levelIntro', 3.7)
        this.audio.playOverlayMusic('levelStart', false)
        break
    }
  }

  _hideOverlay() {
    const wasPause = this.overlay === 'pause'
    this.overlay = null
    this.overlayTimer = 0
    this.overlayUi?.destroy()
    this.overlayUi = null
    this.audio.stopOverlay()
    if (wasPause) {
      this.audio.resumeMusic()
    }
  }

  shutdown() {
    this.audio.stopOverlay()
  }
}
