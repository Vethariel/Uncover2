import { describe, it, expect } from 'vitest'
import { DIR_RIGHT, TILE_DESTRUCTIBLE, TILE_SIZE } from '../../src/config/constants.js'
import { Bomb } from '../../src/game/entities/Bomb.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { GridQuery } from '../../src/game/GridQuery.js'
import { EnemyAISystem } from '../../src/game/systems/EnemyAISystem.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'
import { bfsToTarget } from '../../src/game/ai/helpers/bfsHelper.js'
import { ENEMY_TYPES } from '../../src/config/enemyTypes.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepLife } from '../helpers/systems.js'

const life = new LifeSystem()
const ai = new EnemyAISystem()

describe('ciclo e IA de enemigos', () => {
  it('usa las velocidades y vidas del roster', () => {
    expect(ENEMY_TYPES.golem_basic.speed).toBe(88)
    expect(ENEMY_TYPES.golem_basic.maxHp).toBe(2)
    expect(ENEMY_TYPES.spirit.speed).toBe(60)
    expect(ENEMY_TYPES.spirit.aggressiveSpeed).toBe(88)
    expect(ENEMY_TYPES.spirit.maxHp).toBe(1)
    expect(ENEMY_TYPES.golem_advanced.speed).toBe(57.6)
    expect(ENEMY_TYPES.golem_advanced.maxHp).toBe(3)
    expect(ENEMY_TYPES.golem_advanced.respawnDelay).toBe(35)
  })

  it('alerta golems básicos cercanos al recibir daño', () => {
    const world = createTestWorld(
      ['#########', '#.......#', '#########'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [
          { x: 2, y: 1, kind: 'golem_basic' },
          { x: 4, y: 1, kind: 'golem_basic' },
          { x: 8, y: 1, kind: 'golem_basic' },
        ],
      },
    )

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.enemies[0].aggressive).toBe(true)
    expect(world.enemies[1].aggressive).toBe(true)
    expect(world.enemies[2].aggressive).toBe(false)
  })

  it('el golem básico vuelve a pasivo por distancia', () => {
    const world = createTestWorld(
      ['###############', '#.............#', '###############'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 2, y: 1, kind: 'golem_basic' }],
      },
    )

    const enemy = world.enemies[0]
    enemy.setAggressive(true, 8)
    world.player.tileX = 13
    world.player.tileY = 1

    ai.update(world, 0.016)
    expect(enemy.aggressive).toBe(false)
  })

  it('el espíritu se enfurece con una explosión cercana y acelera', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 5, y: 1, kind: 'spirit' }],
      },
    )

    const spirit = world.enemies[0]
    expect(spirit.speed).toBe(60)
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    ai.update(world, 0.016)

    expect(spirit.aggressive).toBe(true)
    expect(spirit.speed).toBe(88)
  })

  it('el espíritu atraviesa destructibles pero no bombas', () => {
    const world = createTestWorld(
      ['#####', '#D.D#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 1, y: 1, kind: 'spirit' }],
      },
    )

    const spirit = world.enemies[0]
    const query = GridQuery.for(world)
    expect(world.grid.get(1, 1)).toBe(TILE_DESTRUCTIBLE)
    expect(query.isWalkable(1, 1, spirit)).toBe(true)
    expect(query.blocksMovement(1, 1, spirit)).toBe(false)

    world.bombs.push(new Bomb(3, 1, TILE_SIZE, world.player, 1, 2.5))
    expect(query.isWalkable(3, 1, spirit)).toBe(false)
    expect(bfsToTarget(world, 1, 1, 3, 1, false, spirit)).toBeNull()
    expect(bfsToTarget(world, 1, 1, 2, 1, false, spirit)).toBe(DIR_RIGHT)
  })

  it('reaparece en el spawn original tras 20s si el tile está libre', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 3, y: 1, kind: 'spirit' }],
      },
    )

    const spirit = world.enemies[0]
    spirit.posX = 40
    spirit.tileX = 2
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(spirit.alive).toBe(false)
    expect(spirit.respawnTimer).toBe(20)

    stepLife(world, spirit.corpseDuration)
    expect(spirit.visible).toBe(false)

    world.player.tileX = 3
    world.player.tileY = 1
    stepLife(world, 19)
    expect(spirit.alive).toBe(false)

    world.player.tileX = 1
    world.player.tileY = 1
    stepLife(world, 0.016)
    expect(spirit.alive).toBe(true)
    expect(spirit.hp).toBe(1)
    expect(spirit.tileX).toBe(3)
    expect(spirit.tileY).toBe(1)
    expect(world.events).toContain('enemyRespawn')
  })

  it('el golem avanzado empieza agresivo y contacta siempre', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 2, y: 1, kind: 'golem_advanced' }],
      },
    )

    const enemy = world.enemies[0]
    expect(enemy.aggressive).toBe(true)
    expect(enemy.maxHp).toBe(3)
    expect(enemy.canDamagePlayer()).toBe(true)

    life.update(world, 0.016)
    expect(world.player.lives).toBe(2)
  })

  it('el golem avanzado deja de perseguir si el jugador se aleja', () => {
    const world = createTestWorld(
      ['#################', '#...............#', '#################'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 2, y: 1, kind: 'golem_advanced' }],
      },
    )

    const enemy = world.enemies[0]
    world.player.tileX = 15
    world.player.tileY = 1

    ai.update(world, 0.016)
    expect(enemy.aggressive).toBe(false)
  })

  it('el golem avanzado reanuda la persecución al reentrar en rango', () => {
    const world = createTestWorld(
      ['#########', '#.......#', '#########'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 2, y: 1, kind: 'golem_advanced' }],
      },
    )

    const enemy = world.enemies[0]
    enemy.setAggressive(false)
    enemy.aggressionTimer = 0
    world.player.tileX = 9
    world.player.tileY = 1

    ai.update(world, 0.016)
    expect(enemy.aggressive).toBe(true)
  })

  it('el golem avanzado reaparece tras 35s', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 3, y: 1, kind: 'golem_advanced' }],
      },
    )

    const enemy = world.enemies[0]
    for (let hit = 0; hit < 3; hit++) {
      enemy.invulnerableTimer = 0
      world.explosions.push(new Explosion(3, 1, TILE_SIZE))
      stepLife(world, 0.016)
    }

    expect(enemy.alive).toBe(false)
    expect(enemy.respawnTimer).toBe(35)

    world.explosions = []
    world.player.tileX = 1
    world.player.tileY = 1
    stepLife(world, 35)
    expect(enemy.alive).toBe(true)
    expect(enemy.hp).toBe(3)
    expect(enemy.aggressive).toBe(true)
  })
})
