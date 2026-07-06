// ai/conditions/isInDanger.js
import { BTNode, BT_SUCCESS, BT_FAILURE } from "../behaviorTree.js"
import { isDangerous } from "../helpers/dangerHelper.js"

export class IsInDanger extends BTNode {

    tick(enemy, world) {

        const tileX = enemy.tileX
        const tileY = enemy.tileY

        if (isDangerous(world, tileX, tileY)) return BT_SUCCESS

        // Peligro pasó — limpia el safe target
        enemy.blackboard.clear('safeTarget')
        return BT_FAILURE

    }

}