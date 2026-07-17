import { describe, it, expect } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepLife, explodeBomb } from '../helpers/systems.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { TILE_SIZE } from '../../src/config/constants.js'

describe('daño por explosión (tile-based)', () => {
  it('daña al jugador solo si comparte tile con explosión', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.player.alive).toBe(true)
    expect(world.player.lives).toBe(2)
    expect(world.events).toContain('playerDamaged')
  })

  it('no daña en tile adyacente', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    world.explosions.push(new Explosion(3, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.player.alive).toBe(true)
  })

  it('daña gradualmente al golem básico y mata al espíritu de un golpe', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [
          { x: 2, y: 1, kind: 'golem_basic' },
          { x: 3, y: 1, kind: 'spirit' },
        ],
      },
    )

    const golem = world.enemies[0]
    const spirit = world.enemies[1]
    expect(golem.hp).toBe(2)
    expect(spirit.hp).toBe(1)

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    world.explosions.push(new Explosion(3, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(golem.alive).toBe(true)
    expect(golem.hp).toBe(1)
    expect(golem.invulnerableTimer).toBeGreaterThan(0)
    expect(golem.aggressive).toBe(true)
    expect(world.events).toContain('enemyDamaged')

    expect(spirit.alive).toBe(false)
    expect(world.events).toContain('enemyDeath')
  })

  it('la invulnerabilidad evita un segundo golpe de la misma ráfaga', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 2, y: 1, kind: 'golem_basic' }],
      },
    )

    const golem = world.enemies[0]
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)
    expect(golem.hp).toBe(1)

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)
    expect(golem.hp).toBe(1)
    expect(golem.alive).toBe(true)

    golem.invulnerableTimer = 0
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)
    expect(golem.alive).toBe(false)
    expect(golem.respawnTimer).toBe(20)
  })

  it('explosión de bomba alcanza tiles en cruz según rango', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      {
        playerSpawn: { x: 1, y: 1 },
        bombs: [{ x: 3, y: 1, range: 2, timer: 0 }],
      },
    )

    explodeBomb(world)

    const tiles = world.explosions.map((e) => `${e.tileX},${e.tileY}`)
    expect(tiles).toContain('3,1')
    expect(tiles).toContain('4,1')
    expect(tiles).toContain('5,1')
    expect(tiles).not.toContain('6,1')
  })
})
