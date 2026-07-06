import { describe, it, expect } from 'vitest'
import { DIR_LEFT, DIR_RIGHT, DIR_NONE } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepInput } from '../helpers/systems.js'

describe('InputSystem', () => {
  it('respeta maxBombs — no coloca más de las permitidas', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, player: { maxBombs: 1 } },
    )

    stepInput(world, { justDown: ['bomb'] })
    stepInput(world, { justDown: ['bomb'] })

    expect(world.bombs).toHaveLength(1)
    expect(world.player.activeBombs).toBe(1)
  })

  it('no acepta input si el jugador está muerto', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    world.player.alive = false
    world.player.desiredFacing = DIR_NONE

    stepInput(world, { held: ['right'], justDown: ['bomb'] })

    expect(world.player.desiredFacing).toBe(DIR_NONE)
    expect(world.bombs).toHaveLength(0)
  })

  it('prioridad de dirección: left > right > up > down', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    stepInput(world, { held: ['left', 'right', 'up', 'down'] })
    expect(world.player.desiredFacing).toBe(DIR_LEFT)

    stepInput(world, { held: ['right', 'up', 'down'] })
    expect(world.player.desiredFacing).toBe(DIR_RIGHT)
  })

  it('emite playerWalk al moverse', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    stepInput(world, { held: ['up'] })
    expect(world.events).toContain('playerWalk')
  })
})
