import {
  DIR_NONE,
  PLAYER_ESCAPE_DURATION,
  PLAYER_HURT_ANIMATION_DURATION,
  PLAYER_INVULNERABLE_DURATION,
} from '../../config/constants.js'
import { GridQuery } from '../GridQuery.js'
import { positionFromTile } from '../entityTiles.js'
import { GOLEM_BASIC_ALERT_RADIUS } from '../../config/enemyTypes.js'

export class LifeSystem {
  update(world, dt) {
    const player = world.player

    if (world.levelTimer !== null && !world.gameWon && !world.gameOver) {
      world.levelTimer = Math.max(0, world.levelTimer - dt)
      if (world.levelTimer === 0) {
        world.gameOver = true
        world.events.push('levelTimeExpired')
        return
      }
    }

    if (!player.alive && !world.gameOver) {
      world.playerDeathTimer -= dt
      if (world.playerDeathTimer <= 0) world.gameOver = true
      this.updateDeadEnemies(world, dt)
      return
    }

    this.updateDeadEnemies(world, dt)

    if (player.hurtAnimationTimer > 0) {
      player.hurtAnimationTimer = Math.max(0, player.hurtAnimationTimer - dt)
    }

    for (const entity of [world.player, ...world.enemies]) {
      if (entity.invulnerableTimer > 0) {
        entity.invulnerableTimer = Math.max(0, entity.invulnerableTimer - dt)
      }
    }

    for (const entity of [world.player, ...world.enemies]) {
      if (!entity.alive) continue
      if (entity.invulnerableTimer > 0) continue

      for (const explosion of world.explosions) {
        if (explosion.tileX !== entity.tileX || explosion.tileY !== entity.tileY) continue
        if (entity.type === 'player') this.damagePlayer(world)
        else this.damageEnemy(world, entity)
        break
      }
    }

    if (player.alive && player.invulnerableTimer <= 0) {
      for (const enemy of world.enemies) {
        if (!enemy.canDamagePlayer()) continue
        if (this.overlaps(player, enemy)) {
          this.damagePlayer(world)
          break
        }
      }
    }

    this.checkExitDoor(world)
  }

  updateDeadEnemies(world, dt) {
    for (const enemy of world.enemies) {
      if (enemy.alive) continue

      if (enemy.deathTimer > 0) {
        enemy.deathTimer = Math.max(0, enemy.deathTimer - dt)
        if (enemy.deathTimer === 0) enemy.visible = false
      }

      if (enemy.respawnTimer > 0) {
        enemy.respawnTimer = Math.max(0, enemy.respawnTimer - dt)
      }

      if (enemy.respawnTimer === 0) {
        this.tryRespawnEnemy(world, enemy)
      }
    }
  }

  damagePlayer(world) {
    const player = world.player
    if (!player.alive || player.invulnerableTimer > 0) return

    player.bombPlacement = null
    player.lives = Math.max(0, player.lives - 1)
    if (player.lives > 0) {
      player.hurtAnimationTimer = PLAYER_HURT_ANIMATION_DURATION
      player.invulnerableTimer = PLAYER_INVULNERABLE_DURATION
      world.events.push('playerDamaged')
      return
    }

    player.hurtAnimationTimer = 0
    player.alive = false
    world.playerDeathTimer = PLAYER_ESCAPE_DURATION
    world.events.push('playerDeath')
  }

  damageEnemy(world, enemy) {
    if (!enemy.alive || enemy.invulnerableTimer > 0) return

    enemy.hp = Math.max(0, enemy.hp - 1)
    this.onEnemyAttacked(world, enemy)
    if (enemy.hp > 0) {
      enemy.invulnerableTimer = enemy.invulnerableDuration
      world.events.push('enemyDamaged')
      return
    }

    this.killEnemy(world, enemy)
  }

  onEnemyAttacked(world, attacker) {
    if (attacker.kind !== 'golem_basic') return

    const wasAggressive = attacker.aggressive
    attacker.setAggressive(true, attacker.chaseTimeout)
    if (!wasAggressive) world.events.push('golemAggro')

    const radius = attacker.alertRadius || GOLEM_BASIC_ALERT_RADIUS
    for (const other of world.enemies) {
      if (!other.alive || other === attacker) continue
      if (other.kind !== 'golem_basic') continue
      const dist = Math.abs(other.tileX - attacker.tileX)
        + Math.abs(other.tileY - attacker.tileY)
      if (dist <= radius) {
        const otherWasAggressive = other.aggressive
        other.setAggressive(true, other.chaseTimeout)
        if (!otherWasAggressive) world.events.push('golemAggro')
      }
    }
  }

  killEnemy(world, enemy) {
    enemy.alive = false
    enemy.hp = 0
    enemy.desiredFacing = DIR_NONE
    enemy.deathTimer = enemy.corpseDuration
    enemy.respawnTimer = enemy.respawnDelay
    enemy.visible = true
    enemy.setAggressive(false)
    enemy.invulnerableTimer = 0
    enemy.blackboard.clear('patrolTarget')
    enemy.blackboard.clear('patrolWaiting')
    enemy.blackboard.clear('patrolWaitTimer')
    enemy.blackboard.clear('safeTarget')
    world.events.push('enemyDeath')
  }

  tryRespawnEnemy(world, enemy) {
    if (!this.canRespawnAt(world, enemy.spawnTileX, enemy.spawnTileY, enemy)) return

    const pos = positionFromTile(
      enemy.spawnTileX,
      enemy.spawnTileY,
      world.tileSize,
      enemy.size,
    )
    enemy.posX = pos.posX
    enemy.posY = pos.posY
    enemy.tileX = pos.tileX
    enemy.tileY = pos.tileY
    enemy.hp = enemy.maxHp
    enemy.alive = true
    enemy.visible = true
    enemy.deathTimer = 0
    enemy.respawnTimer = 0
    enemy.invulnerableTimer = 0
    enemy.desiredFacing = DIR_NONE
    enemy.setAggressive(enemy.alwaysAggressive)
    world.events.push('enemyRespawn')
  }

  canRespawnAt(world, x, y, enemy) {
    const query = GridQuery.for(world)
    if (!query.isWalkable(x, y, enemy)) return false
    if (world.player?.alive && world.player.tileX === x && world.player.tileY === y) {
      return false
    }
    for (const other of world.enemies) {
      if (other === enemy || !other.alive) continue
      if (other.tileX === x && other.tileY === y) return false
    }
    for (const explosion of world.explosions) {
      if (explosion.tileX === x && explosion.tileY === y) return false
    }
    return true
  }

  overlaps(a, b) {
    return (
      a.posX < b.posX + b.size
      && a.posX + a.size > b.posX
      && a.posY < b.posY + b.size
      && a.posY + a.size > b.posY
    )
  }

  checkExitDoor(world) {
    if (!world.exitDoor || !world.player.alive || world.gameWon) return
    const triggerTiles = world.exitDoor.triggerTiles ?? world.exitDoor.tiles
    const onExit = triggerTiles.some((tile) => (
      tile.x === world.player.tileX && tile.y === world.player.tileY
    ))
    if (!onExit) return

    world.gameWon = true
    world.events.push('levelExit')
  }
}
