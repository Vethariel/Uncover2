import { describe, it, expect } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepLife, explodeBomb } from '../helpers/systems.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { TILE_SIZE } from '../../src/config/constants.js'

describe('daño por explosión (tile-based)', () => {
  it('mata al jugador solo si comparte tile con explosión', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.player.alive).toBe(false)
    expect(world.events).toContain('playerDeath')
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

  it('mata enemigo en tile de explosión', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        enemies: [{ x: 3, y: 1 }],
      },
    )

    world.explosions.push(new Explosion(3, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.enemies[0].alive).toBe(false)
    expect(world.events).toContain('enemyDeath')
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
