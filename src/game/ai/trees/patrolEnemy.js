import { Selector, Sequence } from '../behaviorTree.js'
import { IsInDanger } from '../conditions/isInDanger.js'
import { FleeExplosion } from '../actions/fleeExplosion.js'
import { PatrolAndWait } from '../actions/patrolAndWait.js'

/** Patrulla pasiva con huida de bombas. */
export function createPatrolFleeTree(minDistance = 4, minWaitTime = 1.5, maxWaitTime = 3) {
  return new Selector(
    new Sequence(
      new IsInDanger(),
      new FleeExplosion(),
    ),
    new PatrolAndWait(minDistance, minWaitTime, maxWaitTime),
  )
}

/** Alias histórico. */
export function createPatrolEnemyTree(minDistance, minWaitTime, maxWaitTime) {
  return createPatrolFleeTree(minDistance, minWaitTime, maxWaitTime)
}
