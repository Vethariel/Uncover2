// ai/actions/chasePlayer.js
import { BTNode, BT_FAILURE, BT_RUNNING } from "../behaviorTree.js"
import { bfsToTarget } from "../helpers/bfsHelper.js"

export class ChasePlayer extends BTNode {

    tick(enemy, world) {

        if (!world.player?.alive) return BT_FAILURE

        const player = world.player

        const startX = enemy.tileX
        const startY = enemy.tileY
        const goalX  = player.tileX
        const goalY  = player.tileY

        // BFS evitando tiles peligrosos
        const dir = bfsToTarget(world, startX, startY, goalX, goalY, true)

        if (!dir) return BT_FAILURE

        enemy.currentDirection = dir
        enemy.desiredFacing    = dir
        enemy.facing           = dir

        return BT_RUNNING

    }

}