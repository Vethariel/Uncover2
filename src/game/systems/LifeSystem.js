import { TILE_EMPTY, DIR_NONE } from '../../config/constants.js'

export class LifeSystem {
  update(world, dt, scoreSystem) {
    const player = world.player

    if (!player.alive && !world.gameOver) {
      world.respawnTimer -= dt

      if (world.respawnTimer <= 0) {
        if (player.lives >= 0) this.respawn(world)
        else world.gameOver = true
      }
      return
    }

    const entities = [world.player, ...world.enemies]

    for (const entity of entities) {
      if (!entity.alive) continue
      if (entity.invulnerableTimer > 0) continue

      for (const explosion of world.explosions) {
        if (explosion.tileX === entity.tileX && explosion.tileY === entity.tileY) {
          if (entity.type === 'player') this.killPlayer(world)
          else this.killEnemy(world, entity, scoreSystem)
        }
      }
    }

    for (const enemy of world.enemies) {
      if (!enemy.alive) enemy.deathTimer -= dt
    }
    world.enemies = world.enemies.filter((e) => e.alive || e.deathTimer > 0)

    if (player.alive && player.invulnerableTimer <= 0) {
      for (const enemy of world.enemies) {
        if (enemy.alive && this.overlaps(player, enemy)) {
          this.killPlayer(world)
          break
        }
      }
    }

    if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt

    this.checkPortal(world)

    if (world.portal?.visible && world.player.alive) {
      if (this.inside(world.player, world.portal)) {
        world.gameWon = true
      }
    }

    if (!world.gameOver && !world.gameWon) {
      world.levelTimer -= dt

      if (world.levelTimer <= 0) {
        world.levelTimer = 0
        world.timeUp = true
        player.lives--
        if (player.lives < 0) world.gameOver = true
      }
    }
  }

  killPlayer(world) {
    const player = world.player
    if (!player.alive) return

    player.lives--
    player.alive = false
    world.events.push('playerDeath')
    world.respawnTimer = 2
  }

  killEnemy(world, enemy, scoreSystem) {
    enemy.alive = false
    enemy.deathTimer = 1
    scoreSystem.addScore(world, enemy)
    world.events.push('enemyDeath')
  }

  respawn(world) {
    const player = world.player
    const spawn = world.playerSpawn
    const tileSize = world.tileSize

    player.posX = spawn.x * tileSize + (tileSize - player.size) / 2
    player.posY = spawn.y * tileSize + (tileSize - player.size) / 2
    player.tileX = spawn.x
    player.tileY = spawn.y
    player.alive = true
    player.invulnerableTimer = 2
    player.desiredFacing = DIR_NONE
  }

  overlaps(a, b) {
    return (
      a.posX < b.posX + b.size &&
      a.posX + a.size > b.posX &&
      a.posY < b.posY + b.size &&
      a.posY + a.size > b.posY
    )
  }

  inside(a, b) {
    return (
      a.posX > b.posX &&
      a.posX + a.size < b.posX + b.size &&
      a.posY > b.posY &&
      a.posY + a.size < b.posY + b.size
    )
  }

  checkPortal(world) {
    if (!world.portal) return
    if (world.portal.visible) return

    const enemiesAlive = world.enemies.some((e) => e.alive)
    if (enemiesAlive) return

    const tile = world.grid.get(world.portal.tileX, world.portal.tileY)
    if (tile !== TILE_EMPTY) return

    world.portal.visible = true
    world.portal.animState = 'spawn'
    world.events.push('portalActive')
  }
}
