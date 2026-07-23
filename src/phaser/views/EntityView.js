import Phaser from 'phaser'
import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  PLAYER_BOMB_ANIMATION_DURATION,
  PLAYER_ESCAPE_DURATION,
  PLAYER_HURT_ANIMATION_DURATION,
} from '../../config/constants.js'
import { miningDurationFactor } from '../../config/crafting.js'
import { getAudio } from '../audio/AudioService.js'
import {
  createPlayerAnimationSet,
  createPlayerSprite,
  ensurePlayerLocomotionAnims,
  playPlayerIdle,
  syncPlayerLocomotion,
} from './playerLocomotion.js'
import {
  createExcavatorSprite,
  levelActorDepth,
  placeExcavatorOnTile,
} from './excavatorIdle.js'
import {
  createGolemSprite,
  syncGolemSprite,
} from './golemIdle.js'
import {
  createSpiritSprite,
  syncSpiritSprite,
} from './spiritIdle.js'
import { enemyCorpseAlpha } from '../../config/enemyTypes.js'

const MINE_FRAME_RATE = 8
/** Golpe de pico: frame 4 en numeración 1–6 → índice Phaser 3 (0–5). */
const MINE_HIT_FRAME_INDEX = 3
/** Whoosh de escape: frame 8 en numeración 1–13 → índice Phaser 7 (0–12). */
const ESCAPE_SFX_FRAME_INDEX = 7
/** Impacto al colocar bomba: frame 5 en numeración 1–7 → índice Phaser 4 (0–6). */
const BOMB_PLACE_SFX_FRAME_INDEX = 4

const COLORS = {
  enemy: {
    golem_basic: 0x8d8a84,
    spirit: 0x7ec8ff,
    golem_advanced: 0xc45c26,
  },
}

const BOMB_FRAME_COUNT = 18
const BOMB_FRAME_LAST = BOMB_FRAME_COUNT - 1

/** Centro: frames 1→9 (índices 0–8). */
const EXPLOSION_CENTER_FRAMES = [0, 1, 2, 3, 4, 5, 6, 7, 8]
/** Aledaños: 7→8→9 y luego 1→9 (índices). */
const EXPLOSION_ADJACENT_FRAMES = [6, 7, 8, 0, 1, 2, 3, 4, 5, 6, 7, 8]

const PLAYER_HURT_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-hurt-down', start: 0, end: 6 },
  [DIR_LEFT]: { key: 'player-hurt-left', start: 7, end: 13 },
  [DIR_RIGHT]: { key: 'player-hurt-right', start: 14, end: 20 },
  [DIR_UP]: { key: 'player-hurt-up', start: 21, end: 27 },
}

const PLAYER_BOMB_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-bomb-down', start: 0, end: 6 },
  [DIR_LEFT]: { key: 'player-bomb-left', start: 7, end: 13 },
  [DIR_RIGHT]: { key: 'player-bomb-right', start: 14, end: 20 },
  [DIR_UP]: { key: 'player-bomb-up', start: 21, end: 27 },
}

const PLAYER_MINE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-mine-down', start: 0, end: 5 },
  [DIR_LEFT]: { key: 'player-mine-left', start: 6, end: 11 },
  [DIR_RIGHT]: { key: 'player-mine-right', start: 12, end: 17 },
  [DIR_UP]: { key: 'player-mine-up', start: 18, end: 23 },
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
    this.audio = getAudio(scene)
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
    this._createPlayerAnimations()
    this.playerSprite = createPlayerSprite(scene, 955)
    this.lastPlayerPosition = null
    /** @type {Map<object, Phaser.GameObjects.Sprite>} */
    this.bombSprites = new Map()
    /** @type {Map<object, Phaser.GameObjects.Sprite>} */
    this.explosionSprites = new Map()
    /** @type {Map<object, Phaser.GameObjects.Sprite>} */
    this.npcSprites = new Map()
    /** @type {Map<object, Phaser.GameObjects.Sprite>} */
    this.enemySprites = new Map()
    /** @type {Map<object, { x: number, y: number }>} */
    this.enemyLastPos = new Map()
    this._narrativeFrozen = false
    this._destroyed = false
    this.playerSprite.on(
      Phaser.Animations.Events.ANIMATION_UPDATE,
      this._onPlayerAnimationUpdate,
      this,
    )
  }

  update() {
    this.graphics.clear()

    const drawables = [
      ...this.world.enemies.map((entity) => ({ entity, kind: 'enemy' })),
    ]

    drawables
      .sort((a, b) => (
        (a.entity.posY + a.entity.size) - (b.entity.posY + b.entity.size)
      ))
      .forEach(({ entity, kind }) => this._draw(kind, entity))

    this._syncBombSprites()
    this._syncExplosionSprites()
    this._syncNpcSprites()
    this._syncEnemySprites()
    this._updatePlayerSprite()
    this._drawMiningProgress()
    this._drawFragmentProgress()
    this._drawPuzzleFlashes()
    this._drawTrapWarnings()
    this._drawDarts()
  }

  /** Fuerza idle (p. ej. al entrar en blackout; Phaser sigue animando sin update). */
  freezePlayerIdle() {
    const player = this.world.player
    if (!player?.alive || !this.playerSprite?.anims) return
    this._narrativeFrozen = false
    playPlayerIdle(this.playerSprite, player)
    this.lastPlayerPosition = { x: player.posX, y: player.posY }
  }

  /**
   * Congela el sprite durante diálogo (incluye escape tras muerte).
   * Evita reiniciar la animación cada frame y dejarla “atorada” en loop.
   */
  freezePlayerForNarrative() {
    const sprite = this.playerSprite
    if (!sprite?.anims) return
    this._narrativeFrozen = true
    const player = this.world.player
    if (!player) return

    const feetX = player.posX + player.size / 2
    const feetY = player.posY + player.size
    sprite.setPosition(feetX, feetY).setVisible(true)

    if (!player.alive) {
      // Dejar el escape en el último frame visible, sin reiniciar.
      if (sprite.anims.isPlaying) {
        sprite.anims.pause()
      }
      return
    }

    playPlayerIdle(sprite, player)
    this.lastPlayerPosition = { x: player.posX, y: player.posY }
  }

  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    this._narrativeFrozen = false

    if (this.playerSprite) {
      this.playerSprite.off(
        Phaser.Animations.Events.ANIMATION_UPDATE,
        this._onPlayerAnimationUpdate,
        this,
      )
      this.playerSprite.destroy()
      this.playerSprite = null
    }

    for (const sprite of this.bombSprites.values()) sprite.destroy()
    this.bombSprites.clear()
    for (const sprite of this.explosionSprites.values()) sprite.destroy()
    this.explosionSprites.clear()
    for (const sprite of this.npcSprites.values()) sprite.destroy()
    this.npcSprites.clear()
    for (const sprite of this.enemySprites.values()) sprite.destroy()
    this.enemySprites.clear()
    this.enemyLastPos.clear()
    this.graphics?.destroy()
    this.graphics = null
  }

  _onPlayerAnimationUpdate(animation, frame) {
    const key = animation?.key
    if (!key) return

    if (key.startsWith('player-mine-') && frame.index === MINE_HIT_FRAME_INDEX) {
      this.audio.playSFX('mine')
      return
    }

    if (key.startsWith('player-bomb-') && frame.index === BOMB_PLACE_SFX_FRAME_INDEX) {
      this.audio.playSFX('bombPlace')
      return
    }

    if (key.startsWith('player-escape-') && frame.index === ESCAPE_SFX_FRAME_INDEX) {
      this.audio.playSFX('playerDeath')
    }
  }

  _draw(kind, entity) {
    if (kind === 'enemy' && (entity.kind === 'golem_basic' || entity.kind === 'spirit')) {
      return
    }

    if (
      this.world.visibleTiles
      && !this.world.visibleTiles.has(`${entity.tileX},${entity.tileY}`)
    ) return

    switch (kind) {
      case 'enemy':
        this._drawEnemy(entity)
        break
    }
  }

  _syncNpcSprites() {
    const { tileSize, visibleTiles } = this.world
    const active = new Set()

    for (const npc of this.world.npcs ?? []) {
      if (npc.id !== 'excavator' && npc.kind !== 'excavator') continue
      active.add(npc)

      let sprite = this.npcSprites.get(npc)
      if (!sprite) {
        const feetY = (npc.tile.y + 1) * tileSize
        sprite = createExcavatorSprite(this.scene, levelActorDepth(feetY))
        placeExcavatorOnTile(sprite, npc.tile, tileSize)
        this.npcSprites.set(npc, sprite)
      }

      const feetY = (npc.tile.y + 1) * tileSize
      placeExcavatorOnTile(sprite, npc.tile, tileSize)
      sprite.setDepth(levelActorDepth(feetY))

      const hidden = Boolean(
        visibleTiles && !visibleTiles.has(`${npc.tile.x},${npc.tile.y}`),
      )
      sprite.setVisible(!hidden)
    }

    for (const [npc, sprite] of this.npcSprites) {
      if (active.has(npc)) continue
      sprite.destroy()
      this.npcSprites.delete(npc)
    }
  }

  _syncEnemySprites() {
    const visible = this.world.visibleTiles
    const active = new Set()

    for (const enemy of this.world.enemies ?? []) {
      const isGolem = enemy.kind === 'golem_basic'
      const isSpirit = enemy.kind === 'spirit'
      if (!isGolem && !isSpirit) continue
      active.add(enemy)

      let sprite = this.enemySprites.get(enemy)
      if (!sprite) {
        sprite = isGolem
          ? createGolemSprite(this.scene, levelActorDepth(enemy.posY + enemy.size))
          : createSpiritSprite(this.scene, levelActorDepth(enemy.posY + enemy.size))
        this.enemySprites.set(enemy, sprite)
      }

      const last = this.enemyLastPos.get(enemy)
      const moved = Boolean(
        enemy.alive
        && last
        && (
          Math.abs(enemy.posX - last.x) > 0.01
          || Math.abs(enemy.posY - last.y) > 0.01
        ),
      )
      this.enemyLastPos.set(enemy, { x: enemy.posX, y: enemy.posY })

      if (isGolem) syncGolemSprite(sprite, enemy, { moved })
      else syncSpiritSprite(sprite, enemy, { moved })

      sprite.setDepth(levelActorDepth(enemy.posY + enemy.size))

      const fogHidden = Boolean(
        visible && !visible.has(`${enemy.tileX},${enemy.tileY}`),
      )
      const hurtActive = enemy.alive && (enemy.hurtAnimationTimer ?? 0) > 0
      const flickerHidden = (
        enemy.alive
        && !hurtActive
        && enemy.invulnerableTimer > 0
        && Math.floor(enemy.invulnerableTimer * 20) % 2 !== 0
      )
      const gone = enemy.visible === false
      sprite.setVisible(!fogHidden && !flickerHidden && !gone)
      sprite.setAlpha(enemy.alive ? 1 : enemyCorpseAlpha(enemy))

      if (!enemy.alive || hurtActive) {
        sprite.clearTint()
      } else if (enemy.aggressive) {
        sprite.setTint(isSpirit ? 0xa8e6ff : 0xffd0a0)
        if (!sprite.anims.isPlaying) sprite.anims.resume()
      } else {
        sprite.clearTint()
        if (!sprite.anims.isPlaying) sprite.anims.resume()
      }
    }

    for (const [enemy, sprite] of this.enemySprites) {
      if (active.has(enemy)) continue
      sprite.destroy()
      this.enemySprites.delete(enemy)
      this.enemyLastPos.delete(enemy)
    }
  }

  _createPlayerAnimations() {
    ensurePlayerLocomotionAnims(this.scene)
    createPlayerAnimationSet(this.scene, PLAYER_HURT_ANIMATIONS, 'playerHurt', {
      duration: PLAYER_HURT_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
    createPlayerAnimationSet(this.scene, PLAYER_BOMB_ANIMATIONS, 'playerBomb', {
      duration: PLAYER_BOMB_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
    createPlayerAnimationSet(this.scene, PLAYER_MINE_ANIMATIONS, 'playerMine', {
      frameRate: MINE_FRAME_RATE,
    })
    createPlayerAnimationSet(this.scene, PLAYER_ESCAPE_ANIMATIONS, 'playerDeath', {
      duration: PLAYER_ESCAPE_DURATION * 1000,
      repeat: 0,
    })
  }

  _updatePlayerSprite() {
    const player = this.world.player
    const sprite = this.playerSprite
    if (!player || !sprite?.active || !sprite.anims) {
      sprite?.setVisible(false)
      return
    }

    sprite.setDepth(levelActorDepth(player.posY + player.size))

    if (this._narrativeFrozen) {
      const feetX = player.posX + player.size / 2
      const feetY = player.posY + player.size
      sprite.setPosition(feetX, feetY).setVisible(true)
      return
    }

    const hurtActive = player.alive && player.hurtAnimationTimer > 0
    const flickerHidden = (
      player.alive
      && !hurtActive
      && player.invulnerableTimer > 0
      && Math.floor(player.invulnerableTimer * 20) % 2 !== 0
    )

    if (hurtActive) {
      const feetX = player.posX + player.size / 2
      const feetY = player.posY + player.size
      this.lastPlayerPosition = { x: player.posX, y: player.posY }
      sprite
        .setPosition(feetX, feetY)
        .setVisible(true)
      const hurtAnimation = PLAYER_HURT_ANIMATIONS[player.facing]
        ?? PLAYER_HURT_ANIMATIONS[DIR_DOWN]
      sprite.clearTint()
      sprite.anims.timeScale = 1
      sprite.play(hurtAnimation.key, true)
      return
    }

    if (player.alive && player.bombPlacement) {
      const feetX = player.posX + player.size / 2
      const feetY = player.posY + player.size
      this.lastPlayerPosition = { x: player.posX, y: player.posY }
      sprite
        .setPosition(feetX, feetY)
        .setVisible(!flickerHidden)
      const bombAnimation = PLAYER_BOMB_ANIMATIONS[player.facing]
        ?? PLAYER_BOMB_ANIMATIONS[DIR_DOWN]
      sprite.clearTint()
      sprite.anims.timeScale = 1
      sprite.play(bombAnimation.key, true)
      return
    }

    if (player.alive && this.world.activeMiningTarget) {
      const feetX = player.posX + player.size / 2
      const feetY = player.posY + player.size
      this.lastPlayerPosition = { x: player.posX, y: player.posY }
      sprite
        .setPosition(feetX, feetY)
        .setVisible(!flickerHidden)
      const mineAnimation = PLAYER_MINE_ANIMATIONS[player.facing]
        ?? PLAYER_MINE_ANIMATIONS[DIR_DOWN]
      sprite.clearTint()
      sprite.anims.timeScale = 1 / miningDurationFactor(player.pickSpeed ?? 0)
      sprite.play(mineAnimation.key, true)
      return
    }

    if (!player.alive) {
      const feetX = player.posX + player.size / 2
      const feetY = player.posY + player.size
      this.lastPlayerPosition = { x: player.posX, y: player.posY }
      sprite
        .setPosition(feetX, feetY)
        .setVisible(true)
      const escapeAnimation = PLAYER_ESCAPE_ANIMATIONS[player.facing]
        ?? PLAYER_ESCAPE_ANIMATIONS[DIR_DOWN]
      sprite.clearTint()
      // Solo arrancar una vez; ignoreIfPlaying evita reinicios que “atascan” el escape.
      if (sprite.anims.currentAnim?.key !== escapeAnimation.key) {
        sprite.anims.timeScale = 1
        sprite.play(escapeAnimation.key, false)
      }
      return
    }

    this.lastPlayerPosition = syncPlayerLocomotion(
      sprite,
      player,
      this.lastPlayerPosition,
    )
    if (flickerHidden) sprite.setVisible(false)
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

    const alpha = enemy.alive ? 1 : enemyCorpseAlpha(enemy)
    this.graphics.fillStyle(color, alpha).fillRect(enemy.posX, enemy.posY, enemy.size, enemy.size)
    this.graphics.lineStyle(1, 0xffffff, 0.65 * alpha)
    this.graphics.strokeRect(enemy.posX + 0.5, enemy.posY + 0.5, enemy.size - 1, enemy.size - 1)
  }

  _syncBombSprites() {
    const active = new Set()
    const visible = this.world.visibleTiles

    for (const bomb of this.world.bombs ?? []) {
      active.add(bomb)
      let sprite = this.bombSprites.get(bomb)
      if (!sprite) {
        sprite = this.scene.add.sprite(0, 0, 'bomb', 0)
          .setOrigin(0.5, 0.5)
          .setDepth(10)
        this.bombSprites.set(bomb, sprite)
      }

      const hidden = Boolean(
        visible && !visible.has(`${bomb.tileX},${bomb.tileY}`),
      )
      sprite.setVisible(!hidden)
      sprite.setPosition(
        bomb.posX + bomb.size / 2,
        bomb.posY + bomb.size / 2,
      )

      const duration = Math.max(0.001, bomb.fuseDuration ?? 2.5)
      const burned = 1 - Math.max(0, bomb.timer) / duration
      const frame = Math.min(BOMB_FRAME_LAST, Math.floor(burned * BOMB_FRAME_COUNT))
      sprite.setFrame(frame)
    }

    for (const [bomb, sprite] of this.bombSprites) {
      if (active.has(bomb)) continue
      sprite.destroy()
      this.bombSprites.delete(bomb)
    }
  }

  _syncExplosionSprites() {
    const active = new Set()
    const visible = this.world.visibleTiles

    for (const explosion of this.world.explosions ?? []) {
      active.add(explosion)
      let sprite = this.explosionSprites.get(explosion)
      if (!sprite) {
        sprite = this.scene.add.sprite(0, 0, 'explosion', 0)
          .setOrigin(0.5, 0.5)
          .setDepth(20)
        this.explosionSprites.set(explosion, sprite)
      }

      const hidden = Boolean(
        visible && !visible.has(`${explosion.tileX},${explosion.tileY}`),
      )
      sprite.setVisible(!hidden)
      sprite.setPosition(
        explosion.posX + explosion.size / 2,
        explosion.posY + explosion.size / 2,
      )
      sprite.setFrame(this._explosionFrame(explosion))
    }

    for (const [explosion, sprite] of this.explosionSprites) {
      if (active.has(explosion)) continue
      sprite.destroy()
      this.explosionSprites.delete(explosion)
    }
  }

  _explosionFrame(explosion) {
    const sequence = explosion.kind === 'center'
      ? EXPLOSION_CENTER_FRAMES
      : EXPLOSION_ADJACENT_FRAMES
    const duration = Math.max(0.001, explosion.animDuration ?? 0.3)
    const elapsed = duration - Math.max(0, explosion.timer)
    const t = Math.min(0.999, Math.max(0, elapsed / duration))
    const index = Math.min(sequence.length - 1, Math.floor(t * sequence.length))
    return sequence[index]
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
