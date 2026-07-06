import { BTNode, BT_RUNNING } from "../behaviorTree.js"
import { DIR_NONE } from "../../config/constants.js"
import { isWalkable } from "../helpers/dangerHelper.js"
import { bfsToTarget, ALL_DIRS, VECTORS, bfsLeafNodes } from "../helpers/bfsHelper.js"

export class PatrolAndWait extends BTNode {

    constructor(minDistance = 4, minWaitTime = 2, maxWaitTime = 2) {
        super()
        this.minDistance = minDistance
        this.minWaitTime = minWaitTime
        this.maxWaitTime = maxWaitTime
    }

    tick(enemy, world, blackboard, dt) {

        // Estado de espera
        if (blackboard.get('patrolWaiting')) {
            blackboard.set('patrolWaitTimer', blackboard.get('patrolWaitTimer') - dt)

            if (blackboard.get('patrolWaitTimer') <= 0) {
                blackboard.clear('patrolWaiting')
                blackboard.clear('patrolTarget')
            }

            //enemy.desiredFacing = DIR_NONE
            return BT_RUNNING
        }

        const target = blackboard.get('patrolTarget')

        // Llegó al destino — empieza a esperar
        if (target && enemy.tileX === target.x && enemy.tileY === target.y) {
            blackboard.set('patrolWaiting', true)
            blackboard.set('patrolWaitTimer', this.minWaitTime + Math.random() * (this.maxWaitTime - this.minWaitTime))
            blackboard.clear('patrolTarget')
            //enemy.desiredFacing = DIR_NONE
            return BT_RUNNING
        }

        // Tiene destino — navega hacia él
        if (target) {
            const dir = bfsToTarget(world, enemy.tileX, enemy.tileY, target.x, target.y)
            if (dir) {
                enemy.currentDirection = dir
                enemy.desiredFacing = dir
                enemy.facing = dir
                return BT_RUNNING
            }
            // No puede llegar — busca otro
            blackboard.clear('patrolTarget')
        }

        // Busca nuevo destino lejano
        const newTarget = this.findDistantTile(world, enemy)
        if (newTarget) {
            blackboard.set('patrolTarget', newTarget)
        }

        return BT_RUNNING

    }

    findDistantTile(world, enemy) {

        const leaves = bfsLeafNodes(world, enemy.tileX, enemy.tileY, this.minDistance)
        if (leaves.length === 0) return null
        return leaves[Math.floor(Math.random() * leaves.length)]

    }

}