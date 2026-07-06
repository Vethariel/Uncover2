import { describe, it, expect } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepPowerUp } from '../helpers/systems.js'

describe('power-ups (tile-based)', () => {
  it('recoge solo al compartir tile con el jugador', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        powerUps: [{ x: 2, y: 1, kind: 'bomb' }],
      },
    )

    expect(world.player.maxBombs).toBe(1)
    stepPowerUp(world)

    expect(world.player.maxBombs).toBe(2)
    expect(world.powerUps['2,1']).toBeUndefined()
    expect(world.events).toContain('powerUpPickup')
  })

  it('no recoge en tile adyacente', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        powerUps: [{ x: 3, y: 1, kind: 'range' }],
      },
    )

    stepPowerUp(world)

    expect(world.player.bombRange).toBe(1)
    expect(world.powerUps['3,1']).toBeDefined()
  })

  it('no recoge power-up oculto (alive=false)', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        powerUps: [{ x: 2, y: 1, kind: 'speed', alive: false }],
      },
    )

    const speedBefore = world.player.speed
    stepPowerUp(world)

    expect(world.player.speed).toBe(speedBefore)
    expect(world.powerUps['2,1']).toBeDefined()
  })
})
