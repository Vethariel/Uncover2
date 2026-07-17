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
      return
    }

    const entities = [world.player, ...world.enemies]

    for (const entity of entities) {
      if (!entity.alive) continue
      if (entity.invulnerableTimer > 0) continue

      for (const explosion of world.explosions) {
        if (explosion.tileX === entity.tileX && explosion.tileY === entity.tileY) {
          if (entity.type === 'player') this.damagePlayer(world)
          else this.killEnemy(world, entity)
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
          this.damagePlayer(world)
          break
        }
      }
    }

    if (player.invulnerableTimer > 0) player.invulnerableTimer -= dt

    this.checkExitDoor(world)
  }

  damagePlayer(world) {
    const player = world.player
    if (!player.alive || player.invulnerableTimer > 0) return

    player.lives = Math.max(0, player.lives - 1)
    if (player.lives > 0) {
      player.invulnerableTimer = 2
      world.events.push('playerDamaged')
      return
    }

    player.alive = false
    world.playerDeathTimer = 2
    world.events.push('playerDeath')
  }

  killEnemy(world, enemy) {
    enemy.alive = false
    enemy.deathTimer = 1
    world.events.push('enemyDeath')
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
    const triggerTiles = world.exitDoor.triggerTiles ?? world.exitDoor.tiles
    const onExit = triggerTiles.some((tile) => (
      tile.x === world.player.tileX && tile.y === world.player.tileY
    ))
    if (!onExit) return

    world.gameWon = true
    world.events.push('levelExit')
  }
}
