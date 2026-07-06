// config/enemyTypes.js
import { createBasicEnemyTree } from "../ai/trees/basicEnemy.js"
import { createPatrolEnemyTree } from "../ai/trees/patrolEnemy.js"

export const ENEMY_TYPES = {

    dino: {
        speed:         25,
        size:          12,
        thinkInterval: 0.2,
        sprite:        'dino',
        score: 100,
        tree:          () => createPatrolEnemyTree(2,0.1,0.2),
    },

    demon: {
        speed:         50,
        size:          12,
        thinkInterval: 0.2,
        sprite:        'demon',
        score: 100,
        tree:          () => createPatrolEnemyTree(2,0.01,0.4),
    },

    bomber: {
        speed:         50,
        size:          14,
        thinkInterval: 0.5,
        sprite:        'bomber',
        tree:          () => createBasicEnemyTree(),  // pone bombas
    },

}