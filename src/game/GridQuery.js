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

  /** Terreno que bloquea movimiento (pared; destructible salvo espíritus). */
  isSolidTile(x, y, entity = null) {
    if (!this.inBounds(x, y)) return true
    const tile = this.grid.get(x, y)
    if (tile === TILE_WALL) return true
    if (tile === TILE_DESTRUCTIBLE) return !entity?.canPassDestructibles
    return false
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

  /** Bloqueo total para movimiento continuo (terreno + bomba + NPC). */
  blocksMovement(x, y, entity = null) {
    if (this.isSolidTile(x, y, entity)) return true
    if (entity && this.bombBlocksEntity(x, y, entity)) return true
    if (!entity && this.hasBomb(x, y)) return true
    if (this.hasNpc(x, y)) return true
    return false
  }

  /** NPC sólido en este tile (Brun / Excavador). */
  hasNpc(x, y) {
    return (this.world.npcs ?? []).some(
      (npc) => npc.tile?.x === x && npc.tile?.y === y,
    )
  }

  /** IA: tile transitable (sin bomba). TILE_PASS y TILE_EMPTY son válidos. */
  isWalkable(x, y, entity = null) {
    if (!this.inBounds(x, y)) return false
    if (this.isSolidTile(x, y, entity)) return false
    if (this.hasBomb(x, y)) return false
    if (this.hasNpc(x, y)) return false
    return true
  }

  /** Explosión activa, zona de detonación inminente, dardo o placa en aviso. */
  isDangerous(x, y) {
    for (const explosion of this.world.explosions) {
      if (explosion.tileX === x && explosion.tileY === y) return true
    }

    for (const dart of this.world.darts ?? []) {
      if (dart.alive && dart.tileX === x && dart.tileY === y) return true
    }

    for (const trap of this.world.traps ?? []) {
      if (trap.state === 'warning' && trap.plate.x === x && trap.plate.y === y) {
        return true
      }
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

    for (const wave of this.world.pendingBlastWaves ?? []) {
      const bx = wave.originX
      const by = wave.originY
      for (let step = wave.nextStep; step <= wave.range; step++) {
        const dirs = [
          { x: 1, y: 0, key: 'e' },
          { x: -1, y: 0, key: 'w' },
          { x: 0, y: 1, key: 's' },
          { x: 0, y: -1, key: 'n' },
        ]
        for (const dir of dirs) {
          if (wave.blocked?.[dir.key]) continue
          const tx = bx + dir.x * step
          const ty = by + dir.y * step
          if (tx === x && ty === y && this.lineOfSight(bx, by, x, y)) return true
        }
      }
    }

    return false
  }

  /** IA: caminable y sin peligro inmediato. */
  isSafe(x, y, entity = null) {
    if (!this.isWalkable(x, y, entity)) return false
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
