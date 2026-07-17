import { BTNode, BT_RUNNING } from '../behaviorTree.js'
import { DIR_NONE } from '../../../config/constants.js'
import { bfsToTarget, bfsLeafNodes } from '../helpers/bfsHelper.js'

export class PatrolAndWait extends BTNode {
  constructor(minDistance = 4, minWaitTime = 2, maxWaitTime = 2) {
    super()
    this.minDistance = minDistance
    this.minWaitTime = minWaitTime
    this.maxWaitTime = maxWaitTime
  }

  tick(enemy, world, blackboard) {
    if (blackboard.get('patrolWaiting')) {
      enemy.desiredFacing = DIR_NONE
      return BT_RUNNING
    }

    const target = blackboard.get('patrolTarget')

    if (target && enemy.tileX === target.x && enemy.tileY === target.y) {
      blackboard.set('patrolWaiting', true)
      blackboard.set(
        'patrolWaitTimer',
        this.minWaitTime + Math.random() * (this.maxWaitTime - this.minWaitTime),
      )
      blackboard.clear('patrolTarget')
      enemy.desiredFacing = DIR_NONE
      return BT_RUNNING
    }

    if (target) {
      const dir = bfsToTarget(
        world,
        enemy.tileX,
        enemy.tileY,
        target.x,
        target.y,
        true,
        enemy,
      )
      if (dir) {
        enemy.currentDirection = dir
        enemy.desiredFacing = dir
        enemy.facing = dir
        return BT_RUNNING
      }
      blackboard.clear('patrolTarget')
    }

    const newTarget = this.findDistantTile(world, enemy)
    if (newTarget) {
      blackboard.set('patrolTarget', newTarget)
    } else {
      enemy.desiredFacing = DIR_NONE
    }

    return BT_RUNNING
  }

  findDistantTile(world, enemy) {
    const leaves = bfsLeafNodes(
      world,
      enemy.tileX,
      enemy.tileY,
      this.minDistance,
      Infinity,
      enemy,
    )
    if (leaves.length === 0) return null
    return leaves[Math.floor(Math.random() * leaves.length)]
  }
}
