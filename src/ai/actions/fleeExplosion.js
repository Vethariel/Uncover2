// ai/actions/fleeExplosion.js
import { BTNode, BT_RUNNING } from "../behaviorTree.js"
import { isDangerous }        from "../helpers/dangerHelper.js"
import { bfsToSafeTile, bfsToTarget } from "../helpers/bfsHelper.js"
import { DIR_NONE }           from "../../config/constants.js"

export class FleeExplosion extends BTNode {

    tick(enemy, world) {

        const tileX = enemy.tileX
        const tileY = enemy.tileY

        const safeTarget = enemy.blackboard.get('safeTarget')

        if (safeTarget) {

            // Llegó al safe tile — congela y espera que pase el peligro
            if (tileX === safeTarget.x && tileY === safeTarget.y) {
                enemy.desiredFacing = DIR_NONE
                return BT_RUNNING
            }

            // Sigue moviéndose al safe tile por ruta segura
            const dir = bfsToTarget(world, tileX, tileY, safeTarget.x, safeTarget.y, false)
            if (dir) {
                enemy.currentDirection = dir
                enemy.desiredFacing    = dir
                enemy.thinkTimer       = 0.15
                return BT_RUNNING
            }

            enemy.blackboard.clear('safeTarget')

        }

        // Busca safe tile más cercano
        const result = bfsToSafeTile(world, tileX, tileY)

        if (!result) {
            // Sin salida — congela
            enemy.desiredFacing = DIR_NONE
            return BT_RUNNING
        }

        enemy.blackboard.set('safeTarget', result.tile)
        enemy.currentDirection = result.dir
        enemy.desiredFacing    = result.dir
        enemy.facing           = result.dir
        enemy.thinkTimer       = 0.15

        return BT_RUNNING

    }

}