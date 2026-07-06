import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_NONE, HUD_HEIGHT } from '../../config/constants.js'
import { SHEET_COLS } from '../AnimationRegistry.js'
import { positionEntitySprite } from '../utils/entityPosition.js'

export class EntityView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.container = scene.add.container(0, HUD_HEIGHT)
    this.playerSprite = null
    this.enemySprites = new Map()
    this.bombSprites = new Map()
    this.explosionSprites = new Map()
    this.powerUpSprites = new Map()
    this.portalSprite = null
    this._createPlayer()
    this._createPortal()
  }

  update() {
    this._syncPlayer()
    this._syncEnemies()
    this._syncBombs()
    this._syncExplosions()
    this._syncPowerUps()
    this._syncPortal()
    this._applyDepthSort()
  }

  destroy() {
    this.container.destroy(true)
    this.enemySprites.clear()
    this.bombSprites.clear()
    this.explosionSprites.clear()
    this.powerUpSprites.clear()
  }

  _createPlayer() {
    this.playerSprite = this.scene.add.sprite(0, 0, 'player')
    this.container.add(this.playerSprite)
  }

  _createPortal() {
    this.portalSprite = this.scene.add.sprite(0, 0, 'portal')
    this.portalSprite.setVisible(false)
    this.container.add(this.portalSprite)
  }

  _syncPlayer() {
    const player = this.world.player
    const sprite = this.playerSprite

    positionEntitySprite(sprite, player)

    if (!player.alive) {
      this._playDeath(sprite, 'player_death')
      return
    }

    if (player.invulnerableTimer > 0) {
      sprite.setVisible(Math.floor(player.invulnerableTimer * 20) % 2 === 0)
    } else {
      sprite.setVisible(true)
    }

    const moving = player.desiredFacing !== DIR_NONE
    const dir = this._dirName(player.facing)

    if (moving) {
      this._playLoop(sprite, `player_walk${dir}`, player.speed / player.baseSpeed)
    } else {
      sprite.anims.stop()
      sprite.setTexture('player', this._idleFrame('player', player.facing))
    }
  }

  _syncEnemies() {
    const active = new Set()

    for (const enemy of this.world.enemies) {
      active.add(enemy)
      let sprite = this.enemySprites.get(enemy)

      if (!sprite) {
        sprite = this.scene.add.sprite(0, 0, enemy.spriteKey)
        this.enemySprites.set(enemy, sprite)
        this.container.add(sprite)
      }

      positionEntitySprite(sprite, enemy)

      if (!enemy.alive) {
        this._playDeath(sprite, `${enemy.spriteKey}_death`)
        continue
      }

      const moving = enemy.desiredFacing !== DIR_NONE
      const dir = this._dirName(enemy.facing)

      if (moving) {
        this._playLoop(sprite, `${enemy.spriteKey}_walk${dir}`, enemy.speed / enemy.baseSpeed)
      } else {
        sprite.anims.stop()
        sprite.setTexture(enemy.spriteKey, this._idleFrame(enemy.spriteKey, enemy.facing))
      }
    }

    for (const [enemy, sprite] of this.enemySprites) {
      if (!active.has(enemy)) {
        sprite.destroy()
        this.enemySprites.delete(enemy)
      }
    }
  }

  _syncBombs() {
    const active = new Set()

    for (const bomb of this.world.bombs) {
      active.add(bomb)
      let sprite = this.bombSprites.get(bomb)

      if (!sprite) {
        sprite = this.scene.add.sprite(bomb.posX, bomb.posY, 'bombs')
        sprite.setOrigin(0)
        this.bombSprites.set(bomb, sprite)
        this.container.add(sprite)
      }

      sprite.setPosition(bomb.posX, bomb.posY)
      this._playLoop(sprite, 'bomb_pulse')
    }

    for (const [bomb, sprite] of this.bombSprites) {
      if (!active.has(bomb)) {
        sprite.destroy()
        this.bombSprites.delete(bomb)
      }
    }
  }

  _syncExplosions() {
    const active = new Set()

    for (const explosion of this.world.explosions) {
      active.add(explosion)
      let sprite = this.explosionSprites.get(explosion)

      if (!sprite) {
        sprite = this.scene.add.sprite(explosion.posX, explosion.posY, 'bombs')
        sprite.setOrigin(0)
        this.explosionSprites.set(explosion, sprite)
        this.container.add(sprite)
      }

      sprite.setPosition(explosion.posX, explosion.posY)
      this._playLoop(sprite, `explosion_${explosion.kind}`)
    }

    for (const [explosion, sprite] of this.explosionSprites) {
      if (!active.has(explosion)) {
        sprite.destroy()
        this.explosionSprites.delete(explosion)
      }
    }
  }

  _syncPowerUps() {
    const active = new Set()

    for (const powerUp of Object.values(this.world.powerUps ?? {})) {
      if (!powerUp.alive) continue

      active.add(powerUp)
      let sprite = this.powerUpSprites.get(powerUp)

      if (!sprite) {
        sprite = this.scene.add.sprite(powerUp.posX, powerUp.posY, 'powerUp')
        sprite.setOrigin(0)
        this.powerUpSprites.set(powerUp, sprite)
        this.container.add(sprite)
      }

      sprite.setPosition(powerUp.posX, powerUp.posY)
      this._playLoop(sprite, `powerup_${powerUp.kind}`)
    }

    for (const [powerUp, sprite] of this.powerUpSprites) {
      if (!active.has(powerUp)) {
        sprite.destroy()
        this.powerUpSprites.delete(powerUp)
      }
    }
  }

  _syncPortal() {
    const portal = this.world.portal
    if (!portal?.visible) {
      this.portalSprite.setVisible(false)
      return
    }

    this.portalSprite.setVisible(true)
    positionEntitySprite(this.portalSprite, portal, 16, 48)

    if (portal.animState === 'spawn') {
      if (!this.portalSprite.anims.isPlaying) {
        this.portalSprite.play('portal_spawn')
        this.portalSprite.once('animationcomplete-portal_spawn', () => {
          portal.animState = 'idle'
        })
      }
    } else if (portal.animState === 'idle') {
      this._playLoop(this.portalSprite, 'portal_idle')
    }
  }

  _dirName(facing) {
    switch (facing) {
      case DIR_UP:
        return 'Up'
      case DIR_DOWN:
        return 'Down'
      case DIR_LEFT:
        return 'Left'
      case DIR_RIGHT:
        return 'Right'
      default:
        return 'Down'
    }
  }

  _idleFrame(textureKey, facing) {
    const cols = SHEET_COLS[textureKey] ?? 4
    const row = { [DIR_DOWN]: 0, [DIR_LEFT]: 1, [DIR_RIGHT]: 2, [DIR_UP]: 3 }[facing] ?? 0
    return row * cols
  }

  _playLoop(sprite, key, speedScale = 1) {
    if (sprite.anims.currentAnim?.key !== key) {
      sprite.play({ key, repeat: -1 })
    }
    sprite.anims.timeScale = speedScale
  }

  _playDeath(sprite, key) {
    if (sprite.anims.currentAnim?.key === key) {
      sprite.setVisible(sprite.anims.isPlaying)
      return
    }

    sprite.setVisible(true)
    sprite.play({ key, repeat: 0 })
    sprite.once(`animationcomplete-${key}`, () => {
      sprite.setVisible(false)
    })
  }

  // Mayor Y (más abajo en pantalla) = mayor depth = se dibuja encima.
  _applyDepthSort() {
    const entries = []

    const push = (sprite, entity) => {
      if (!sprite?.active) return
      entries.push({
        sprite,
        y: entity.posY + entity.size,
        x: entity.posX,
      })
    }

    push(this.playerSprite, this.world.player)

    for (const [enemy, sprite] of this.enemySprites) push(sprite, enemy)
    for (const [bomb, sprite] of this.bombSprites) push(sprite, bomb)
    for (const [explosion, sprite] of this.explosionSprites) push(sprite, explosion)
    for (const [powerUp, sprite] of this.powerUpSprites) push(sprite, powerUp)

    if (this.world.portal?.visible) {
      push(this.portalSprite, this.world.portal)
    }

    entries.sort((a, b) => (a.y !== b.y ? a.y - b.y : a.x - b.x))

    for (let i = 0; i < entries.length; i++) {
      entries[i].sprite.setDepth(i)
    }

    this.container.sort('depth')
  }
}
