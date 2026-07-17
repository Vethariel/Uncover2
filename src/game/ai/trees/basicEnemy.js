import { Selector, Sequence } from '../behaviorTree.js'
import { IsInDanger } from '../conditions/isInDanger.js'
import { FleeExplosion } from '../actions/fleeExplosion.js'
import { ChasePlayer } from '../actions/chasePlayer.js'
import { Patrol } from '../actions/patrol.js'

/** Prioriza huir de bombas y luego perseguir al jugador. */
export function createChaseFleeTree() {
  return new Selector(
    new Sequence(
      new IsInDanger(),
      new FleeExplosion(),
    ),
    new ChasePlayer(),
    new Patrol(),
  )
}

/** Alias histórico usado por golem avanzado. */
export function createBasicEnemyTree() {
  return createChaseFleeTree()
}
