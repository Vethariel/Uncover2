import { Blackboard } from '../ai/blackboard.js'
import { DIR_DOWN, DIR_NONE } from '../../config/constants.js'
import {
  ENEMY_CORPSE_DURATION,
  ENEMY_INVULNERABLE_DURATION,
  ENEMY_RESPAWN_DELAY,
} from '../../config/enemyTypes.js'
import { ENEMY_LIGHT } from '../systems/VisionSystem.js'

export class Enemy {
  constructor(posX, posY, tileX, tileY, config) {
    this.posX = posX
    this.posY = posY
    this.tileX = tileX
    this.tileY = tileY
    this.spawnTileX = tileX
    this.spawnTileY = tileY
    this.speed = config.speed
    this.baseSpeed = config.speed
    this.aggressiveSpeed = config.aggressiveSpeed ?? config.speed
    this.size = config.size
    this.kind = config.colorRole
    this.maxHp = config.maxHp ?? 1
    this.hp = this.maxHp
    this.alwaysAggressive = Boolean(config.alwaysAggressive)
    this.initialAggressive = config.startsAggressive ?? this.alwaysAggressive
    this.contactWhenAggressiveOnly = Boolean(config.contactWhenAggressiveOnly)
    this.canPassDestructibles = Boolean(config.canPassDestructibles)
    this.alertRadius = config.alertRadius ?? 0
    this.rageRadius = config.rageRadius ?? 0
    this.chaseTimeout = config.chaseTimeout ?? 0
    this.chaseMaxDistance = config.chaseMaxDistance ?? Infinity
    this.invulnerableDuration = config.invulnerableDuration ?? ENEMY_INVULNERABLE_DURATION
    this.respawnDelay = config.respawnDelay ?? ENEMY_RESPAWN_DELAY
    this.corpseDuration = config.corpseDuration ?? ENEMY_CORPSE_DURATION
    this.lightEmission = config.lightEmission ?? ENEMY_LIGHT
    this.aggressiveLightEmission = config.aggressiveLightEmission ?? this.lightEmission
    this.facing = DIR_DOWN
    this.desiredFacing = DIR_NONE
    this.currentDirection = DIR_DOWN
    this.passiveTree = config.tree()
    this.aggressiveTree = (config.aggressiveTree ?? config.tree)()
    this.aggressive = config.startsAggressive ?? this.alwaysAggressive
    this.behaviorTree = this.aggressive ? this.aggressiveTree : this.passiveTree
    if (this.aggressive && this.aggressiveSpeed !== this.baseSpeed) {
      this.speed = this.aggressiveSpeed
    }
    this.blackboard = new Blackboard()
    this.type = 'enemy'
    this.alive = true
    this.aggressionTimer = 0
    this.invulnerableTimer = 0
    this.thinkTimer = 0
    this.thinkInterval = config.thinkInterval
    this.deathTimer = 0
    this.respawnTimer = 0
    this.visible = true
  }

  getLightEmission() {
    if (!this.alive) return 0
    if (this.aggressive) return this.aggressiveLightEmission
    return this.lightEmission
  }

  canDamagePlayer() {
    if (!this.alive) return false
    if (this.contactWhenAggressiveOnly) return this.aggressive
    return true
  }

  setAggressive(active, duration = this.chaseTimeout) {
    if (this.alwaysAggressive) {
      this.aggressive = true
      this.aggressionTimer = 0
      this.speed = this.baseSpeed
      this.behaviorTree = this.aggressiveTree
      return
    }

    this.aggressive = active
    this.aggressionTimer = active ? duration : 0
    this.speed = active ? this.aggressiveSpeed : this.baseSpeed
    this.behaviorTree = active ? this.aggressiveTree : this.passiveTree
    if (!active) {
      this.blackboard.clear('patrolTarget')
      this.blackboard.clear('patrolWaiting')
      this.blackboard.clear('patrolWaitTimer')
      this.blackboard.clear('safeTarget')
    }
  }
}
