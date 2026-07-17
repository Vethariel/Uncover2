import { describe, it, expect } from 'vitest'
import { TILE_EXPLOSION } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { explodeBomb, stepBomb } from '../helpers/systems.js'

describe('BombSystem — explosiones avanzadas', () => {
  it('cadena de bombas: la explosión detona bombas en su camino', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      {
        playerSpawn: { x: 1, y: 1 },
        bombs: [
          { x: 2, y: 1, range: 2, timer: 0 },
          { x: 4, y: 1, range: 1, timer: 10 },
        ],
      },
    )

    explodeBomb(world, 0)
    expect(world.bombs).toHaveLength(1)
    expect(world.bombs[0].timer).toBe(0)

    stepBomb(world, 0.016)
    expect(world.bombs).toHaveLength(0)
    expect(world.explosions.some((e) => e.tileX === 4 && e.tileY === 1)).toBe(true)
  })

  it('destructible se convierte en TILE_EXPLOSION y corta el blast', () => {
    const world = createTestWorld(
      ['#######', '#..D..#', '#######'],
      {
        playerSpawn: { x: 1, y: 1 },
        bombs: [{ x: 2, y: 1, range: 3, timer: 0 }],
      },
    )

    explodeBomb(world, 0)

    expect(world.grid.get(3, 1)).toBe(TILE_EXPLOSION)
    expect(world.explosions.some((e) => e.tileX === 4 && e.tileY === 1)).toBe(false)
  })

  it('TILE_PASS detiene la propagación de la explosión', () => {
    const world = createTestWorld(
      ['#######', '#..P..#', '#######'],
      {
        playerSpawn: { x: 1, y: 1 },
        bombs: [{ x: 2, y: 1, range: 3, timer: 0 }],
      },
    )

    explodeBomb(world, 0)

    expect(world.explosions.some((e) => e.tileX === 3 && e.tileY === 1)).toBe(false)
    expect(world.explosions.some((e) => e.tileX === 4 && e.tileY === 1)).toBe(false)
  })

  it('decrementa activeBombs del dueño al explotar', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        bombs: [{ x: 2, y: 1, timer: 0 }],
      },
    )

    expect(world.player.activeBombs).toBe(1)
    explodeBomb(world, 0)
    expect(world.player.activeBombs).toBe(0)
  })
})
