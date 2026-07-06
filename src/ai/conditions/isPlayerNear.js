import { BTNode, BT_SUCCESS, BT_FAILURE } from "../behaviorTree.js"

export class IsPlayerNear extends BTNode {

    constructor(radius = 4) {
        super()
        this.radius = radius
    }

    tick(enemy, world) {

        if (!world.player?.alive) return BT_FAILURE

        const player = world.player
        const tileX  = enemy.tileX
        const tileY  = enemy.tileY
        const playerX = player.tileX
        const playerY = player.tileY

        const dist = Math.abs(playerX - tileX) + Math.abs(playerY - tileY)
        return dist <= this.radius ? BT_SUCCESS : BT_FAILURE

    }

}