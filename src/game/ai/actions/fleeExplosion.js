import { BTNode, BT_RUNNING } from '../behaviorTree.js'
import { bfsToSafeTile, bfsToTarget } from '../helpers/bfsHelper.js'
import { DIR_NONE } from '../../../config/constants.js'

export class FleeExplosion extends BTNode {
  tick(enemy, world) {
    const tileX = enemy.tileX
    const tileY = enemy.tileY
    const safeTarget = enemy.blackboard.get('safeTarget')

    if (safeTarget) {
      if (tileX === safeTarget.x && tileY === safeTarget.y) {
        enemy.desiredFacing = DIR_NONE
        return BT_RUNNING
      }

      const dir = bfsToTarget(
        world,
        tileX,
        tileY,
        safeTarget.x,
        safeTarget.y,
        false,
        enemy,
      )
      if (dir) {
        enemy.currentDirection = dir
        enemy.desiredFacing = dir
        enemy.thinkTimer = 0.15
        return BT_RUNNING
      }

      enemy.blackboard.clear('safeTarget')
    }

    const result = bfsToSafeTile(world, tileX, tileY, enemy)

    if (!result) {
      enemy.desiredFacing = DIR_NONE
      return BT_RUNNING
    }

    enemy.blackboard.set('safeTarget', result.tile)
    enemy.currentDirection = result.dir
    enemy.desiredFacing = result.dir
    enemy.facing = result.dir
    enemy.thinkTimer = 0.15

    return BT_RUNNING
  }
}
