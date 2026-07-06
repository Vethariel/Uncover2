import { Selector, Sequence }  from "../behaviorTree.js"
import { IsInDanger }          from "../conditions/isInDanger.js"
import { FleeExplosion }       from "../actions/fleeExplosion.js"
import { PatrolAndWait }       from "../actions/patrolAndWait.js"

export function createPatrolEnemyTree( minDistance = 4, minWaitTime = 2, maxWaitTime = 4) {
    return new Selector(
        new Sequence(
            new IsInDanger(),
            new FleeExplosion()
        ),
        new PatrolAndWait(minDistance, minWaitTime, maxWaitTime)  // mínimo 4 tiles de distancia, espera 2 segundos
    )
}