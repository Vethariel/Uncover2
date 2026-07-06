import { TILE_WALL, TILE_DESTRUCTIBLE, TILE_EMPTY, TILE_EXPLOSION, TILE_PASS } from "../config/constants.js"

import { Explosion } from "../entities/explosion.js"

export class BombSystem {

  update(world, dt) {

    for (const bomb of world.bombs) {

      bomb.timer -= dt

      if (bomb.timer <= 0) {
        this.explode(world, bomb)
        world.events.push("explosion")
        continue
      }

      if (!bomb.passThrough) continue

      const player = bomb.owner

      if (player.tileX !== bomb.tileX || player.tileY !== bomb.tileY) {
        bomb.passThrough = false
      }

    }

    for (const explosion of world.explosions) {

      if (explosion.type !== "explosion") continue

      explosion.timer -= dt

      if (explosion.timer <= 0) {
        const grid = world.grid
        const tileX = explosion.tileX
        const tileY = explosion.tileY

        if (grid.get(tileX, tileY) === TILE_EXPLOSION) {
          grid.set(tileX, tileY, TILE_EMPTY)
          this.revealPowerUp(world, tileX, tileY)
        }
      }

    }

    world.explosions = world.explosions.filter(
      explosion => explosion.timer > 0
    )

  }

  explode(world, bomb) {

    const grid = world.grid

    const tileX = bomb.tileX
    const tileY = bomb.tileY

    this.spawnExplosion(world, tileX, tileY)

    const range = bomb.range || 1

    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 }
    ]

    for (const dir of directions) {

      for (let i = 1; i <= range; i++) {

        const tx = tileX + dir.x * i
        const ty = tileY + dir.y * i

        const tile = grid.get(tx, ty)

        if (tile === TILE_WALL || tile === TILE_EXPLOSION || tile === TILE_PASS)
          break

        // Es el último tile si alcanzó el rango o hay un destructible
        const isLast = (i === range)
        const isPowerUp = world.powerUps?.[`${tx},${ty}`]?.alive
        const isDestructible = tile === TILE_DESTRUCTIBLE
        const kind = this.explosionKind(dir, isLast, isPowerUp, isDestructible, world.currentLevelIndex+1)

        // Si ya hay explosión en este tile, actualiza su kind a segmento
        const existing = this.getExplosion(world, tx, ty)
        if (existing) {
          existing.sprite.current = this.mergeKind(existing.kind, kind)
          existing.sprite.frame = 0
          existing.sprite.finished = false
        } else {
          this.spawnExplosion(world, tx, ty, kind)
        }

        if (isDestructible) {

          grid.set(tx, ty, TILE_EXPLOSION)
          break

        }

        this.triggerBomb(world, tx, ty)

      }

    }

    const player = bomb.owner
    player.activeBombs--

    world.bombs = world.bombs.filter(b => b !== bomb)

  }

  explosionKind(dir, isLast, isPowerUp, isDestructible, level) {
    if (isPowerUp) return 'powerUp'
    if (isDestructible) return `tilelevel${level}`
    if (dir.x !== 0) return isLast ? (dir.x > 0 ? 'tipRight' : 'tipLeft') : 'horizontal'
    if (dir.y !== 0) return isLast ? (dir.y > 0 ? 'tipDown' : 'tipUp') : 'vertical'
    return 'center'
  }

  // Cuando dos explosiones se encuentran, la punta se convierte en segmento
  mergeKind(existing, incoming) {
    if (existing === 'powerUp' || incoming === 'powerUp') return 'powerUp'
    if (existing === 'center' || incoming === 'center') return 'center'

    const segments = ['horizontal', 'vertical', 'center']
    if (segments.includes(existing)) return existing
    // Si la existente es una punta y llega otra explosión, pasa a segmento
    if (['tipLeft', 'tipRight'].includes(existing)) return 'horizontal'
    if (['tipUp', 'tipDown'].includes(existing)) return 'vertical'
    return incoming
  }

  hasExplosion(world, tileX, tileY) {
    return world.explosions.some(e => e.tileX === tileX && e.tileY === tileY)
  }

  getExplosion(world, tileX, tileY) {
    return world.explosions.find(e => e.tileX === tileX && e.tileY === tileY)
  }

  spawnExplosion(world, tx, ty, kind) {

    // Elimina power up vivo si lo hay
    const key = `${tx},${ty}`
    if (world.powerUps?.[key]?.alive) {
      delete world.powerUps[key]
    }

    world.explosions.push(new Explosion(tx, ty, world.tileSize, kind))

  }

  triggerBomb(world, tx, ty) {

    for (const bomb of world.bombs) {

      if (bomb.tileX === tx && bomb.tileY === ty) {

        bomb.timer = 0

      }

    }

  }

  revealPowerUp(world, tx, ty) {

    const key = `${tx},${ty}`
    const powerUp = world.powerUps?.[key]

    if (powerUp) powerUp.alive = true

  }

}