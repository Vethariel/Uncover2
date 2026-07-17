import { DIR_NONE } from '../../config/constants.js'
import { positionFromTile } from '../entityTiles.js'

export class LifeSystem {
  update(world, dt, scoreSystem) {
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

    this.checkExitDoor(world)
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
    const pos = positionFromTile(spawn.x, spawn.y, world.tileSize, player.size)

    player.posX = pos.posX
    player.posY = pos.posY
    player.tileX = pos.tileX
    player.tileY = pos.tileY
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

  checkExitDoor(world) {
    if (!world.exitDoor || !world.player.alive || world.gameWon) return
    const onExit = world.exitDoor.tiles.some((tile) => (
      tile.x === world.player.tileX && tile.y === world.player.tileY
    ))
    if (!onExit) return

    world.gameWon = true
    world.events.push('levelExit')
  }
}
