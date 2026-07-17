import { DIR_NONE } from '../../config/constants.js'

function tileDistance(a, b) {
  return Math.abs(a.tileX - b.tileX) + Math.abs(a.tileY - b.tileY)
}

function updatePatrolWait(enemy, dt) {
  if (!enemy.blackboard.get('patrolWaiting')) return false

  enemy.desiredFacing = DIR_NONE
  const remaining = (enemy.blackboard.get('patrolWaitTimer') ?? 0) - dt
  if (remaining <= 0) {
    enemy.blackboard.clear('patrolWaiting')
    enemy.blackboard.clear('patrolWaitTimer')
    enemy.blackboard.clear('patrolTarget')
    return false
  }

  enemy.blackboard.set('patrolWaitTimer', remaining)
  return true
}

function updateGolemBasicAggression(enemy, world, dt) {
  if (!enemy.aggressive || enemy.alwaysAggressive) return

  enemy.aggressionTimer = Math.max(0, enemy.aggressionTimer - dt)
  const player = world.player
  const tooFar = player?.alive
    && Number.isFinite(enemy.chaseMaxDistance)
    && tileDistance(enemy, player) > enemy.chaseMaxDistance

  if (enemy.aggressionTimer <= 0 || tooFar) {
    enemy.setAggressive(false)
  }
}

function updateSpiritRage(enemy, world, dt) {
  if (enemy.alwaysAggressive) return

  let nearExplosion = false
  for (const explosion of world.explosions) {
    const dist = Math.abs(explosion.tileX - enemy.tileX)
      + Math.abs(explosion.tileY - enemy.tileY)
    if (dist <= enemy.rageRadius) {
      nearExplosion = true
      break
    }
  }

  if (nearExplosion) {
    enemy.setAggressive(true, enemy.chaseTimeout)
    return
  }

  if (!enemy.aggressive) return

  enemy.aggressionTimer = Math.max(0, enemy.aggressionTimer - dt)
  if (enemy.aggressionTimer <= 0) {
    enemy.setAggressive(false)
  }
}

function updateAggression(enemy, world, dt) {
  if (enemy.kind === 'golem_basic') {
    updateGolemBasicAggression(enemy, world, dt)
    return
  }
  if (enemy.kind === 'spirit') {
    updateSpiritRage(enemy, world, dt)
  }
}

export class EnemyAISystem {
  update(world, dt) {
    for (const enemy of world.enemies) {
      if (!enemy.alive) {
        enemy.desiredFacing = DIR_NONE
        continue
      }

      updateAggression(enemy, world, dt)

      if (updatePatrolWait(enemy, dt)) {
        enemy.thinkTimer = Math.max(0, enemy.thinkTimer - dt)
        continue
      }

      enemy.thinkTimer -= dt
      if (enemy.thinkTimer > 0) continue

      enemy.thinkTimer = enemy.thinkInterval
      enemy.behaviorTree?.tick(enemy, world, enemy.blackboard, enemy.thinkInterval)
    }
  }
}

export {
  tileDistance,
  updateAggression,
  updatePatrolWait,
}
