import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_NONE,
} from '../../config/constants.js'
import { GridQuery } from '../GridQuery.js'
import { syncTileFromPosition } from '../entityTiles.js'

export class CollisionSystem {
  update(world, dt) {
    const grid = world.grid
    const tileSize = world.tileSize
    const query = GridQuery.for(world)
    const entities = [world.player, ...world.enemies]

    for (const entity of entities) {
      if (!entity.alive) continue
      if (entity.desiredFacing === DIR_NONE) continue

      const vec = this.vector(entity.desiredFacing)
      const threshold = entity.size * 0.4

      if (vec.x !== 0) {
        const tileY = entity.tileY
        const centerY = tileY * tileSize + (tileSize - entity.size) / 2
        const diffY = centerY - entity.posY
        if (Math.abs(diffY) < threshold) {
          entity.posY += Math.sign(diffY) * Math.min(Math.abs(diffY), entity.speed * dt)
        }
      }

      if (vec.y !== 0) {
        const tileX = entity.tileX
        const centerX = tileX * tileSize + (tileSize - entity.size) / 2
        const diffX = centerX - entity.posX
        if (Math.abs(diffX) < threshold) {
          entity.posX += Math.sign(diffX) * Math.min(Math.abs(diffX), entity.speed * dt)
        }
      }

      const newX = entity.posX + vec.x * entity.speed * dt
      const newY = entity.posY + vec.y * entity.speed * dt

      const left = Math.floor(newX / tileSize)
      const right = Math.floor((newX + entity.size) / tileSize)
      const top = Math.floor(newY / tileSize)
      const bottom = Math.floor((newY + entity.size) / tileSize)

      const movingH = vec.x !== 0

      const cornerA = movingH
        ? query.blocksMovement(vec.x > 0 ? right : left, top, entity)
        : query.blocksMovement(left, vec.y > 0 ? bottom : top, entity)

      const cornerB = movingH
        ? query.blocksMovement(vec.x > 0 ? right : left, bottom, entity)
        : query.blocksMovement(right, vec.y > 0 ? bottom : top, entity)

      const collision = cornerA || cornerB

      const aheadA = movingH
        ? query.blocksMovement(vec.x > 0 ? right + 1 : left - 1, top, entity)
        : query.blocksMovement(left, vec.y > 0 ? bottom + 1 : top - 1, entity)

      const aheadB = movingH
        ? query.blocksMovement(vec.x > 0 ? right + 1 : left - 1, bottom, entity)
        : query.blocksMovement(right, vec.y > 0 ? bottom + 1 : top - 1, entity)

      const possibleCollision = !collision && ((!aheadA && aheadB) || (aheadA && !aheadB))

      if (collision || possibleCollision) {
        if ((cornerA && !cornerB) || (aheadA && !aheadB)) {
          if (movingH) entity.posY += entity.speed * dt
          else entity.posX += entity.speed * dt
        } else if ((!cornerA && cornerB) || (!aheadA && aheadB)) {
          if (movingH) entity.posY -= entity.speed * dt
          else entity.posX -= entity.speed * dt
        }
      } else {
        entity.posX = newX
        entity.posY = newY
      }

      syncTileFromPosition(entity, tileSize)
    }
  }

  vector(direction) {
    switch (direction) {
      case DIR_UP:
        return { x: 0, y: -1 }
      case DIR_DOWN:
        return { x: 0, y: 1 }
      case DIR_LEFT:
        return { x: -1, y: 0 }
      case DIR_RIGHT:
        return { x: 1, y: 0 }
      default:
        return { x: 0, y: 0 }
    }
  }
}
