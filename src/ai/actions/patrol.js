import { BTNode, BT_SUCCESS, BT_RUNNING } from "../behaviorTree.js"
import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from "../../config/constants.js"
import { isWalkable } from "../helpers/dangerHelper.js"

const ALL_DIRS = [DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT]
const VECTORS  = {
    [DIR_UP]:    { x:  0, y: -1 },
    [DIR_DOWN]:  { x:  0, y:  1 },
    [DIR_LEFT]:  { x: -1, y:  0 },
    [DIR_RIGHT]: { x:  1, y:  0 },
}

const OPPOSITE = {
    [DIR_UP]: DIR_DOWN, [DIR_DOWN]: DIR_UP,
    [DIR_LEFT]: DIR_RIGHT, [DIR_RIGHT]: DIR_LEFT
}

export class Patrol extends BTNode {

    tick(enemy, world) {

        const tileX = enemy.tileX
        const tileY = enemy.tileY

        const dirs = ALL_DIRS.filter(dir => {
            const nx   = tileX + VECTORS[dir].x
            const ny   = tileY + VECTORS[dir].y
            return isWalkable(world, nx, ny) 
        })

        if (dirs.length === 0) return BT_SUCCESS

        const forward    = dirs.filter(d => d !== OPPOSITE[enemy.currentDirection])
        const candidates = forward.length > 0 ? forward : dirs

        enemy.currentDirection = candidates[Math.floor(Math.random() * candidates.length)]
        enemy.desiredFacing    = enemy.currentDirection
        enemy.facing           = enemy.currentDirection

        return BT_RUNNING

    }

}