import { Selector, Sequence } from "../behaviorTree.js"
import { IsInDanger }    from "../conditions/isInDanger.js"
import { FleeExplosion }      from "../actions/fleeExplosion.js"
import { ChasePlayer }        from "../actions/chasePlayer.js"
import { Patrol }             from "../actions/patrol.js"

export function createBasicEnemyTree() {
    return new Selector(
        // Prioridad 1 — huir si hay peligro
        new Sequence(
            new IsInDanger(),
            new FleeExplosion()
        ),
        // Prioridad 2 — perseguir jugador
        new ChasePlayer(),
        // Fallback — patrullar
        new Patrol()
    )
}