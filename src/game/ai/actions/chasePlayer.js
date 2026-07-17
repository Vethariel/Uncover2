import { BTNode, BT_FAILURE, BT_RUNNING } from '../behaviorTree.js'
import { bfsToTarget } from '../helpers/bfsHelper.js'

export class ChasePlayer extends BTNode {
  tick(enemy, world) {
    if (!world.player?.alive) return BT_FAILURE

    const player = world.player
    const dir = bfsToTarget(
      world,
      enemy.tileX,
      enemy.tileY,
      player.tileX,
      player.tileY,
      true,
      enemy,
    )

    if (!dir) return BT_FAILURE

    enemy.currentDirection = dir
    enemy.desiredFacing = dir
    enemy.facing = dir

    return BT_RUNNING
  }
}
