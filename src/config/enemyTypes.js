import { createPatrolFleeTree } from '../game/ai/trees/patrolEnemy.js'
import { createChaseFleeTree } from '../game/ai/trees/basicEnemy.js'

export const ENEMY_INVULNERABLE_DURATION = 2
export const ENEMY_RESPAWN_DELAY = 20
export const ENEMY_CORPSE_DURATION = 1

export const GOLEM_BASIC_ALERT_RADIUS = 5
export const GOLEM_BASIC_CHASE_TIMEOUT = 8
export const GOLEM_BASIC_CHASE_MAX_DISTANCE = 10

export const SPIRIT_RAGE_RADIUS = 6
export const SPIRIT_CHASE_TIMEOUT = 8

export const GOLEM_ADVANCED_ALERT_RADIUS = 8
export const GOLEM_ADVANCED_CHASE_TIMEOUT = 10
export const GOLEM_ADVANCED_CHASE_MAX_DISTANCE = 12
export const GOLEM_ADVANCED_RESPAWN_DELAY = 35

// Roster Mov. I — ver docs/PROCEDURAL_LEVELS.md.
export const ENEMY_TYPES = {
  // Más rápido que el jugador; patrulla pasiva; daña solo si está agresivo.
  golem_basic: {
    speed: 110,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'golem_basic',
    maxHp: 2,
    alwaysAggressive: false,
    contactWhenAggressiveOnly: true,
    canPassDestructibles: false,
    alertRadius: GOLEM_BASIC_ALERT_RADIUS,
    chaseTimeout: GOLEM_BASIC_CHASE_TIMEOUT,
    chaseMaxDistance: GOLEM_BASIC_CHASE_MAX_DISTANCE,
    tree: () => createPatrolFleeTree(4, 1.5, 3),
    aggressiveTree: () => createChaseFleeTree(),
  },

  // Más lento en pasivo; se enfurece con explosiones cercanas; atraviesa destructibles.
  spirit: {
    speed: 75,
    aggressiveSpeed: 110,
    size: 24,
    thinkInterval: 0.2,
    colorRole: 'spirit',
    maxHp: 1,
    alwaysAggressive: false,
    contactWhenAggressiveOnly: false,
    canPassDestructibles: true,
    lightEmission: 2,
    aggressiveLightEmission: 5,
    rageRadius: SPIRIT_RAGE_RADIUS,
    chaseTimeout: SPIRIT_CHASE_TIMEOUT,
    tree: () => createPatrolFleeTree(4, 1.5, 3),
    aggressiveTree: () => createChaseFleeTree(),
  },

  // Guardián persistente: persigue dentro de leash; 3 vidas; respawn lento.
  golem_advanced: {
    speed: 72,
    size: 24,
    thinkInterval: 0.35,
    colorRole: 'golem_advanced',
    maxHp: 3,
    alwaysAggressive: false,
    startsAggressive: true,
    contactWhenAggressiveOnly: false,
    canPassDestructibles: false,
    alertRadius: GOLEM_ADVANCED_ALERT_RADIUS,
    chaseTimeout: GOLEM_ADVANCED_CHASE_TIMEOUT,
    chaseMaxDistance: GOLEM_ADVANCED_CHASE_MAX_DISTANCE,
    respawnDelay: GOLEM_ADVANCED_RESPAWN_DELAY,
    tree: () => createPatrolFleeTree(4, 1.5, 3),
    aggressiveTree: () => createChaseFleeTree(),
  },
}
