import { createBasicEnemyTree } from '../game/ai/trees/basicEnemy.js'
import { createPatrolEnemyTree } from '../game/ai/trees/patrolEnemy.js'

// Roster Mov. I — comportamientos objetivo en docs/PROCEDURAL_LEVELS.md.
// Trees actuales son placeholders hasta implementar huida / furia / chase dedicados.
export const ENEMY_TYPES = {
  // Patrulla; debe huir de bombas (AI pendiente).
  golem_basic: {
    speed: 50,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'golem_basic',
    score: 100,
    tree: () => createPatrolEnemyTree(2, 0.1, 0.2),
  },

  // Se enfurece con explosiones cercanas; atraviesa destructibles (AI/collision pendientes).
  spirit: {
    speed: 70,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'spirit',
    score: 120,
    tree: () => createPatrolEnemyTree(2, 0.05, 0.3),
  },

  // Persigue al jugador (basicEnemy ≈ chase placeholder).
  golem_advanced: {
    speed: 90,
    size: 28,
    thinkInterval: 0.25,
    colorRole: 'golem_advanced',
    score: 150,
    tree: () => createBasicEnemyTree(),
  },
}
