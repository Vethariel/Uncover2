import {
    DIR_UP,
    DIR_DOWN,
    DIR_LEFT,
    DIR_RIGHT,
    DIR_NONE,
    TILE_WALL,
    TILE_DESTRUCTIBLE
} from "../config/constants.js"

export class CollisionSystem {

    update(world, dt) {

        const grid = world.grid
        const tileSize = world.tileSize
        const entities = [world.player, ...world.enemies]

        for (const entity of entities) {

            if (!entity.alive) continue
            if (entity.desiredFacing === DIR_NONE) continue

            const vec = this.vector(entity.desiredFacing)

            // Alineacion preventiva
            const threshold = entity.size * 0.4

            if (vec.x !== 0) {
                const tileY = entity.tileY
                const centerY = tileY * tileSize + (tileSize - entity.size) / 2
                const diffY = centerY - entity.posY
                if (Math.abs(diffY) < threshold)
                    entity.posY += Math.sign(diffY) * Math.min(Math.abs(diffY), entity.speed * dt)
            }

            if (vec.y !== 0) {
                const tileX = entity.tileX
                const centerX = tileX * tileSize + (tileSize - entity.size) / 2
                const diffX = centerX - entity.posX
                if (Math.abs(diffX) < threshold)
                    entity.posX += Math.sign(diffX) * Math.min(Math.abs(diffX), entity.speed * dt)
            }

            const newX = entity.posX + vec.x * entity.speed * dt
            const newY = entity.posY + vec.y * entity.speed * dt

            // Esquinas de la entidad en nueva posicion
            const left = Math.floor(newX / tileSize)
            const right = Math.floor((newX + entity.size) / tileSize)
            const top = Math.floor(newY / tileSize)
            const bottom = Math.floor((newY + entity.size) / tileSize)

            // Eje principal y eje perpendicular segun direccion
            const moving_h = vec.x !== 0

            const cornerA = moving_h
                ? this.blockedTile(world, grid, vec.x > 0 ? right : left, top, entity)
                : this.blockedTile(world, grid, left, vec.y > 0 ? bottom : top, entity)

            const cornerB = moving_h
                ? this.blockedTile(world, grid, vec.x > 0 ? right : left, bottom, entity)
                : this.blockedTile(world, grid, right, vec.y > 0 ? bottom : top, entity)

            const collision = cornerA || cornerB

            // Lookahead un tile adelante para posible colision
            const aheadA = moving_h
                ? this.blockedTile(world, grid, vec.x > 0 ? right + 1 : left - 1, top, entity)
                : this.blockedTile(world, grid, left, vec.y > 0 ? bottom + 1 : top - 1, entity)

            const aheadB = moving_h
                ? this.blockedTile(world, grid, vec.x > 0 ? right + 1 : left - 1, bottom, entity)
                : this.blockedTile(world, grid, right, vec.y > 0 ? bottom + 1 : top - 1, entity)

            const possibleCollision = !collision && ((!aheadA && aheadB) || (aheadA && !aheadB))

            if (collision || possibleCollision) {
                // Corner assist — empuja en eje perpendicular
                if (cornerA && !cornerB || aheadA && !aheadB) {
                    if (moving_h) entity.posY += entity.speed * dt
                    else entity.posX += entity.speed * dt
                } else if (!cornerA && cornerB || !aheadA && aheadB) {
                    if (moving_h) entity.posY -= entity.speed * dt
                    else entity.posX -= entity.speed * dt
                }
            } else {
                entity.posX = newX
                entity.posY = newY
            }

            entity.tileX = Math.floor((entity.posX + entity.size / 2) / tileSize)
            entity.tileY = Math.floor((entity.posY + entity.size / 2) / tileSize)
        }

    }

    vector(direction) {

        switch (direction) {
            case DIR_UP: return { x: 0, y: -1 }
            case DIR_DOWN: return { x: 0, y: 1 }
            case DIR_LEFT: return { x: -1, y: 0 }
            case DIR_RIGHT: return { x: 1, y: 0 }
            default: return { x: 0, y: 0 }
        }

    }

    solid(grid, x, y) {

        const tile = grid.get(x, y)

        return tile === TILE_WALL || tile === TILE_DESTRUCTIBLE

    }

    blockedTile(world, grid, x, y, entity) {

        if (this.solid(grid, x, y))
            return true

        if (this.bombSolid(world, x, y, entity))
            return true

        return false

    }

    bombSolid(world, x, y, entity) {

        for (const bomb of world.bombs) {

            if (bomb.tileX === x && bomb.tileY === y) {

                if (bomb.passThrough && bomb.owner === entity)
                    return false

                return true
            }

        }

        return false

    }

}