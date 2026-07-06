import { describe, it, expect } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepGameLoop, DIR_RIGHT } from '../helpers/systems.js'

describe('GameLoop — humo end-to-end', () => {
  it('un frame completo no lanza errores y devuelve estado', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    const result = stepGameLoop(world, 0.016, { held: ['right'] })

    expect(result).toMatchObject({
      gameOver: false,
      gameWon: false,
      timeUp: false,
    })
    expect(Array.isArray(result.events)).toBe(true)
  })

  it('coloca bomba y avanza simulación varios frames', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    stepGameLoop(world, 0.016, { justDown: ['bomb'] })
    expect(world.bombs).toHaveLength(1)

    let hadExplosion = false
    for (let i = 0; i < 200; i++) {
      stepGameLoop(world, 0.05)
      if (world.explosions.length > 0) hadExplosion = true
    }

    expect(world.bombs).toHaveLength(0)
    expect(world.player.activeBombs).toBe(0)
    expect(hadExplosion).toBe(true)
  })

  it('jugador se mueve con input sostenido', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    const startX = world.player.posX
    for (let i = 0; i < 30; i++) {
      stepGameLoop(world, 0.05, { held: ['right'] })
    }

    expect(world.player.posX).toBeGreaterThan(startX)
  })
})
