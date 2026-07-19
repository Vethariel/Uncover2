import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  PLAYER_ESCAPE_DURATION,
  PLAYER_HURT_DURATION,
  PLAYER_SPEED,
  TILE_SIZE,
} from '../../config/constants.js'

// Un ciclo completo de walk (~8 frames) cubre ~3 tiles a velocidad base.
const WALK_FRAME_COUNT = 8
const WALK_CYCLE_DISTANCE = TILE_SIZE * 3
const WALK_FRAME_RATE = (PLAYER_SPEED / WALK_CYCLE_DISTANCE) * WALK_FRAME_COUNT

const COLORS = {
  enemy: {
    golem_basic: 0x8d8a84,
    spirit: 0x7ec8ff,
    golem_advanced: 0xc45c26,
  },
  bomb: 0x20242b,
  fuse: 0xffc857,
  explosion: 0xff9f1c,
}

const PLAYER_WALK_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-walk-down', start: 0, end: 7 },
  [DIR_LEFT]: { key: 'player-walk-left', start: 8, end: 15 },
  [DIR_RIGHT]: { key: 'player-walk-right', start: 16, end: 23 },
  [DIR_UP]: { key: 'player-walk-up', start: 24, end: 31 },
}

const PLAYER_IDLE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-idle-down', start: 0, end: 5 },
  [DIR_LEFT]: { key: 'player-idle-left', start: 6, end: 11 },
  [DIR_RIGHT]: { key: 'player-idle-right', start: 12, end: 17 },
  [DIR_UP]: { key: 'player-idle-up', start: 18, end: 23 },
}

const PLAYER_HURT_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-hurt-down', start: 0, end: 6 },
  [DIR_LEFT]: { key: 'player-hurt-left', start: 7, end: 13 },
  [DIR_RIGHT]: { key: 'player-hurt-right', start: 14, end: 20 },
  [DIR_UP]: { key: 'player-hurt-up', start: 21, end: 27 },
}

const PLAYER_ESCAPE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-escape-down', start: 0, end: 12 },
  [DIR_LEFT]: { key: 'player-escape-left', start: 13, end: 25 },
  [DIR_RIGHT]: { key: 'player-escape-right', start: 26, end: 38 },
  [DIR_UP]: { key: 'player-escape-up', start: 39, end: 51 },
}

export class EntityView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
    this._createPlayerAnimations()
    this.playerSprite = scene.add.sprite(0, 0, 'playerIdle', 0)
      // El dibujo toca el borde inferior de cada frame: los pies son el ancla.
      // Sobre la niebla (950): el casco siempre ilumina el tile del jugador,
      // y al medir 64px la cabeza invade el tile superior (muro sombreado).
      .setOrigin(0.5, 1)
      .setDepth(955)
    this.lastPlayerPosition = null
  }

  update() {
    this.graphics.clear()

    const drawables = [
      ...this.world.explosions.map((entity) => ({ entity, kind: 'explosion' })),
      ...this.world.bombs.map((entity) => ({ entity, kind: 'bomb' })),
      ...this.world.enemies.map((entity) => ({ entity, kind: 'enemy' })),
    ]

    drawables
      .sort((a, b) => (a.entity.posY + a.entity.size) - (b.entity.posY + b.entity.size))
      .forEach(({ entity, kind }) => this._draw(kind, entity))

    this._updatePlayerSprite()
    this._drawMiningProgress()
    this._drawFragmentProgress()
    this._drawPuzzleFlashes()
    this._drawTrapWarnings()
    this._drawDarts()
  }

  destroy() {
    this.graphics.destroy()
    this.playerSprite.destroy()
  }

  _draw(kind, entity) {
    if (
      this.world.visibleTiles
      && !this.world.visibleTiles.has(`${entity.tileX},${entity.tileY}`)
    ) return

    switch (kind) {
      case 'enemy':
        this._drawEnemy(entity)
        break
      case 'bomb':
        this._drawBomb(entity)
        break
      case 'explosion':
        this._drawExplosion(entity)
        break
    }
  }

  _createPlayerAnimations() {
    this._createAnimationSet(PLAYER_WALK_ANIMATIONS, 'playerWalk', {
      frameRate: WALK_FRAME_RATE,
    })
    this._createAnimationSet(PLAYER_IDLE_ANIMATIONS, 'playerIdle', {
      frameRate: 4,
    })
    this._createAnimationSet(PLAYER_HURT_ANIMATIONS, 'playerHurt', {
      duration: PLAYER_HURT_DURATION * 1000,
      repeat: 0,
    })
    this._createAnimationSet(PLAYER_ESCAPE_ANIMATIONS, 'playerDeath', {
      duration: PLAYER_ESCAPE_DURATION * 1000,
      repeat: 0,
    })
  }

  _createAnimationSet(animationSet, texture, {
    frameRate,
    duration,
    repeat = -1,
  }) {
    for (const animation of Object.values(animationSet)) {
      if (this.scene.anims.exists(animation.key)) continue
      const config = {
        key: animation.key,
        frames: this.scene.anims.generateFrameNumbers(texture, {
          start: animation.start,
          end: animation.end,
        }),
        repeat,
      }
      if (duration !== undefined) config.duration = duration
      else config.frameRate = frameRate
      this.scene.anims.create(config)
    }
  }

  _updatePlayerSprite() {
    const player = this.world.player
    if (!player) {
      this.playerSprite.setVisible(false)
      return
    }

    const feetX = player.posX + player.size / 2
    const feetY = player.posY + player.size
    const moved = Boolean(
      this.lastPlayerPosition
      && (
        Math.abs(player.posX - this.lastPlayerPosition.x) > 0.01
        || Math.abs(player.posY - this.lastPlayerPosition.y) > 0.01
      )
    )
    this.lastPlayerPosition = { x: player.posX, y: player.posY }

    this.playerSprite
      .setPosition(feetX, feetY)
      .setVisible(true)

    const walkAnimation = PLAYER_WALK_ANIMATIONS[player.facing]
      ?? PLAYER_WALK_ANIMATIONS[DIR_DOWN]
    const idleAnimation = PLAYER_IDLE_ANIMATIONS[player.facing]
      ?? PLAYER_IDLE_ANIMATIONS[DIR_DOWN]
    const hurtAnimation = PLAYER_HURT_ANIMATIONS[player.facing]
      ?? PLAYER_HURT_ANIMATIONS[DIR_DOWN]
    const escapeAnimation = PLAYER_ESCAPE_ANIMATIONS[player.facing]
      ?? PLAYER_ESCAPE_ANIMATIONS[DIR_DOWN]
    if (player.alive && player.invulnerableTimer > 0) {
      this.playerSprite.clearTint()
      this.playerSprite.anims.timeScale = 1
      this.playerSprite.play(hurtAnimation.key, true)
      return
    }

    if (player.alive && moved) {
      this.playerSprite.clearTint()
      this.playerSprite.anims.timeScale = player.speed / PLAYER_SPEED
      this.playerSprite.play(walkAnimation.key, true)
      return
    }

    if (player.alive) {
      this.playerSprite.clearTint()
      this.playerSprite.anims.timeScale = 1
      this.playerSprite.play(idleAnimation.key, true)
    } else {
      this.playerSprite.clearTint()
      this.playerSprite.anims.timeScale = 1
      this.playerSprite.play(escapeAnimation.key, true)
    }
  }

  _drawEnemy(enemy) {
    if (enemy.visible === false) return
    if (
      enemy.alive
      && enemy.invulnerableTimer > 0
      && Math.floor(enemy.invulnerableTimer * 20) % 2 !== 0
    ) return

    let color = COLORS.enemy[enemy.kind] ?? COLORS.enemy.golem_basic
    if (!enemy.alive) color = 0x5d3f43
    else if (enemy.aggressive && enemy.kind === 'golem_basic') color = 0xb08d57
    else if (enemy.aggressive && enemy.kind === 'spirit') color = 0xa8e6ff

    this.graphics.fillStyle(color).fillRect(enemy.posX, enemy.posY, enemy.size, enemy.size)
    this.graphics.lineStyle(1, 0xffffff, 0.65)
    this.graphics.strokeRect(enemy.posX + 0.5, enemy.posY + 0.5, enemy.size - 1, enemy.size - 1)
  }

  _drawBomb(bomb) {
    const cx = bomb.posX + bomb.size / 2
    const cy = bomb.posY + bomb.size / 2
    const pulse = 0.75 + 0.15 * Math.sin(bomb.timer * 12)
    this.graphics.fillStyle(COLORS.bomb).fillCircle(cx, cy + 1, bomb.size * pulse / 2)
    this.graphics.lineStyle(2, COLORS.fuse).lineBetween(cx, cy - 6, cx + 3, cy - 9)
  }

  _drawExplosion(explosion) {
    const inset = explosion.kind === 'center' ? 1 : 3
    this.graphics.fillStyle(COLORS.explosion, 0.85)
    this.graphics.fillRect(
      explosion.posX + inset,
      explosion.posY + inset,
      explosion.size - inset * 2,
      explosion.size - inset * 2,
    )
  }

  _drawMiningProgress() {
    this._drawProgressBar(this.world.activeMiningTarget, 0xffc857)
  }

  _drawFragmentProgress() {
    this._drawProgressBar(this.world.activeFragmentTarget, 0xd28cff)
  }

  _drawProgressBar(target, fillColor) {
    if (!target || target.duration <= 0) return

    const tileSize = this.world.tileSize
    const ratio = Math.min(1, target.progress / target.duration)
    const x = target.x * tileSize + 4
    const y = target.y * tileSize + 4
    const width = tileSize - 8

    this.graphics.fillStyle(0x111820, 0.85)
    this.graphics.fillRect(x, y, width, 4)
    this.graphics.fillStyle(fillColor, 1)
    this.graphics.fillRect(x, y, width * ratio, 4)
  }

  _drawPuzzleFlashes() {
    const tileSize = this.world.tileSize
    for (const tablet of this.world.puzzleTablets ?? []) {
      if (tablet.visual !== 'flashGreen' && tablet.visual !== 'flashRed') continue
      const color = tablet.visual === 'flashGreen' ? 0x6dff9a : 0xff6d6d
      this.graphics.fillStyle(color, 0.55)
      this.graphics.fillRect(
        tablet.x * tileSize + 2,
        tablet.y * tileSize + 2,
        tileSize - 4,
        tileSize - 4,
      )
    }
  }

  _drawTrapWarnings() {
    const tileSize = this.world.tileSize
    for (const trap of this.world.traps ?? []) {
      if (trap.state !== 'warning') continue
      const pulse = 0.35 + 0.35 * Math.abs(Math.sin(trap.warningTimer * 14))
      this.graphics.fillStyle(0xff6b4a, pulse)
      this.graphics.fillRect(
        trap.plate.x * tileSize + 3,
        trap.plate.y * tileSize + 3,
        tileSize - 6,
        tileSize - 6,
      )
    }
  }

  _drawDarts() {
    const tileSize = this.world.tileSize
    for (const dart of this.world.darts ?? []) {
      if (!dart.alive) continue
      if (
        this.world.visibleTiles
        && !this.world.visibleTiles.has(`${dart.tileX},${dart.tileY}`)
      ) continue
      const cx = dart.tileX * tileSize + tileSize / 2
      const cy = dart.tileY * tileSize + tileSize / 2
      this.graphics.fillStyle(0xe8e0d0, 0.95)
      this.graphics.fillCircle(cx, cy, 3)
      this.graphics.lineStyle(2, 0xb0a090, 1)
      this.graphics.lineBetween(
        cx - dart.dir.x * 5,
        cy - dart.dir.y * 5,
        cx + dart.dir.x * 5,
        cy + dart.dir.y * 5,
      )
    }
  }

  _directionVector(facing) {
    switch (facing) {
      case DIR_UP:
        return { x: 0, y: -1 }
      case DIR_DOWN:
        return { x: 0, y: 1 }
      case DIR_LEFT:
        return { x: -1, y: 0 }
      case DIR_RIGHT:
        return { x: 1, y: 0 }
      default:
        return { x: 0, y: 1 }
    }
  }
}
