import { describe, it, expect, vi, afterEach } from 'vitest'
import { TILE_DESTRUCTIBLE } from '../../src/config/constants.js'
import { Grid } from '../../src/game/Grid.js'
import { World } from '../../src/game/World.js'
import { PowerUpPool } from '../../src/game/level/PowerUpPool.js'

describe('PowerUpPool', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('buildPool respeta proporciones de pesos', () => {
    const pool = PowerUpPool.buildPool(8)
    const counts = pool.reduce((acc, k) => {
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})

    expect(pool).toHaveLength(8)
    expect(counts.bomb).toBeGreaterThan(0)
    expect(counts.range).toBeGreaterThan(0)
    expect(counts.speed).toBeGreaterThan(0)
  })

  it('generate asigna power-ups solo a tiles destructibles', () => {
    const world = new World(16)
    world.grid = new Grid(5, 3)

    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 3; y++) {
        world.grid.set(x, y, TILE_DESTRUCTIBLE)
      }
    }

    vi.spyOn(Math, 'random').mockReturnValue(0.99)

    PowerUpPool.generate(world)

    const count = Object.keys(world.powerUps).length
    expect(count).toBe(Math.floor(15 * 0.3))

    for (const key of Object.keys(world.powerUps)) {
      const [x, y] = key.split(',').map(Number)
      expect(world.grid.get(x, y)).toBe(TILE_DESTRUCTIBLE)
    }
  })
})
