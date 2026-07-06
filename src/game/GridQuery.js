import { TILE_WALL, TILE_DESTRUCTIBLE } from '../config/constants.js'

/** Consultas unificadas al grid y al estado del mundo (tile-based). */
export class GridQuery {
  constructor(world) {
    this.world = world
    this.grid = world.grid
  }

  static for(world) {
    return new GridQuery(world)
  }

  inBounds(x, y) {
    return this.grid.inBounds(x, y)
  }

  /** Terreno que bloquea movimiento (pared, destructible). */
  isSolidTile(x, y) {
    if (!this.inBounds(x, y)) return true
    const tile = this.grid.get(x, y)
    return tile === TILE_WALL || tile === TILE_DESTRUCTIBLE
  }

  /** Bomba ocupando este tile. */
  hasBomb(x, y) {
    return this.world.bombs.some((bomb) => bomb.tileX === x && bomb.tileY === y)
  }

  /** Bomba bloquea a esta entidad (respeta passThrough del dueño). */
  bombBlocksEntity(x, y, entity) {
    for (const bomb of this.world.bombs) {
      if (bomb.tileX !== x || bomb.tileY !== y) continue
      if (bomb.passThrough && bomb.owner === entity) return false
      return true
    }
    return false
  }

  /** Bloqueo total para movimiento continuo (terreno + bomba). */
  blocksMovement(x, y, entity = null) {
    if (this.isSolidTile(x, y)) return true
    if (entity && this.bombBlocksEntity(x, y, entity)) return true
    if (!entity && this.hasBomb(x, y)) return true
    return false
  }

  /** IA: tile transitable (sin bomba). TILE_PASS y TILE_EMPTY son válidos. */
  isWalkable(x, y) {
    if (!this.inBounds(x, y)) return false
    if (this.isSolidTile(x, y)) return false
    if (this.hasBomb(x, y)) return false
    return true
  }

  /** Explosión activa o zona de detonación inminente. */
  isDangerous(x, y) {
    for (const explosion of this.world.explosions) {
      if (explosion.tileX === x && explosion.tileY === y) return true
    }

    for (const bomb of this.world.bombs) {
      if (bomb.timer > 1.5) continue

      const bx = bomb.tileX
      const by = bomb.tileY
      const range = bomb.range || 1

      if (bx === x && Math.abs(by - y) <= range) {
        if (this.lineOfSight(bx, by, x, y)) return true
      }

      if (by === y && Math.abs(bx - x) <= range) {
        if (this.lineOfSight(bx, by, x, y)) return true
      }
    }

    return false
  }

  /** IA: caminable y sin peligro inmediato. */
  isSafe(x, y) {
    if (!this.isWalkable(x, y)) return false
    return !this.isDangerous(x, y)
  }

  lineOfSight(fromX, fromY, toX, toY) {
    if (fromX === toX && fromY === toY) return true

    const dx = Math.sign(toX - fromX)
    const dy = Math.sign(toY - fromY)
    let x = fromX + dx
    let y = fromY + dy

    while (x !== toX || y !== toY) {
      if (this.isSolidTile(x, y)) return false
      x += dx
      y += dy
    }

    return true
  }
}
