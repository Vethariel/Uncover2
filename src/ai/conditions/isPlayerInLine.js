import { BTNode, BT_SUCCESS, BT_FAILURE } from "../behaviorTree.js"
import { TILE_WALL, TILE_DESTRUCTIBLE }    from "../../config/constants.js"
import { isWalkable } from "../helpers/dangerHelper.js"

export class IsPlayerInLine extends BTNode {

    tick(enemy, world) {

        if (!world.player?.alive) return BT_FAILURE

        const player = world.player
        const tileX  = enemy.tileX
        const tileY  = enemy.tileY
        const playerX = player.tileX
        const playerY = player.tileY

        // Misma fila o columna con línea de visión libre
        if (tileX === playerX) {
            const minY = Math.min(tileY, playerY)
            const maxY = Math.max(tileY, playerY)
            for (let y = minY + 1; y < maxY; y++) {
                if (!isWalkable(world, tileX, y)) return BT_FAILURE
            }
            return BT_SUCCESS
        }

        if (tileY === playerY) {
            const minX = Math.min(tileX, playerX)
            const maxX = Math.max(tileX, playerX)
            for (let x = minX + 1; x < maxX; x++) {
                if (!isWalkable(world, x, tileY)) return BT_FAILURE
            }
            return BT_SUCCESS
        }

        return BT_FAILURE

    }

}