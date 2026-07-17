import { createBasicEnemyTree } from '../game/ai/trees/basicEnemy.js'
import { createPatrolEnemyTree } from '../game/ai/trees/patrolEnemy.js'

export const ENEMY_TYPES = {
  scout: {
    speed: 50,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'scout',
    score: 100,
    tree: () => createPatrolEnemyTree(2, 0.1, 0.2),
  },

  hunter: {
    speed: 100,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'hunter',
    score: 100,
    tree: () => createPatrolEnemyTree(2, 0.01, 0.4),
  },

  brute: {
    speed: 100,
    size: 28,
    thinkInterval: 0.5,
    colorRole: 'brute',
    score: 100,
    tree: () => createBasicEnemyTree(),
  },
}
