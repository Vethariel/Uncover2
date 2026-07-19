import { describe, it, expect } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepInput, stepBomb } from '../helpers/systems.js'
import { GridQuery } from '../../src/game/GridQuery.js'
import {
  PLAYER_BOMB_APPEAR_DELAY,
  TILE_PASS,
} from '../../src/config/constants.js'

describe('bombas', () => {
  it('no se coloca bomba en TILE_PASS', () => {
    const world = createTestWorld(
      ['###', '#P#', '###'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    expect(world.grid.get(1, 1)).toBe(TILE_PASS)
    stepInput(world, { justDown: ['bomb'] })

    expect(world.bombs).toHaveLength(0)
    expect(world.player.activeBombs).toBe(0)
  })

  it('coloca bomba en tile del jugador con passThrough activo', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    stepInput(world, { justDown: ['bomb'] })
    expect(world.bombs).toHaveLength(0)
    stepBomb(world, PLAYER_BOMB_APPEAR_DELAY)

    expect(world.bombs).toHaveLength(1)
    expect(world.bombs[0].tileX).toBe(2)
    expect(world.bombs[0].tileY).toBe(1)
    expect(world.bombs[0].passThrough).toBe(true)
    expect(GridQuery.for(world).bombBlocksEntity(2, 1, world.player)).toBe(false)
  })

  it('passThrough se desactiva al salir del tile', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        bombs: [{ x: 2, y: 1 }],
      },
    )
    const bomb = world.bombs[0]
    expect(bomb.passThrough).toBe(true)

    world.player.tileX = 3
    world.player.tileY = 1
    stepBomb(world, 0.016)

    expect(bomb.passThrough).toBe(false)
    expect(GridQuery.for(world).bombBlocksEntity(2, 1, world.player)).toBe(true)
  })

  it('no permite dos bombas en el mismo tile', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    stepInput(world, { justDown: ['bomb'] })
    stepInput(world, { justDown: ['bomb'] })
    stepBomb(world, PLAYER_BOMB_APPEAR_DELAY)

    expect(world.bombs).toHaveLength(1)
  })
})
