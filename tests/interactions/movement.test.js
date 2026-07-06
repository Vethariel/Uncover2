import { describe, it, expect } from 'vitest'
import { GridQuery } from '../../src/game/GridQuery.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepCollision, DIR_RIGHT, DIR_DOWN } from '../helpers/systems.js'
import { TILE_PASS } from '../../src/config/constants.js'

describe('movimiento vs grid', () => {
  it('no atraviesa paredes', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 } },
    )
    const startX = world.player.posX

    for (let i = 0; i < 30; i++) stepCollision(world, 0.05, DIR_RIGHT)

    expect(world.player.posX).toBeGreaterThan(startX)
    expect(world.player.tileX).toBeLessThan(4)
    expect(world.player.tileX).not.toBe(4)
  })

  it('puede caminar sobre TILE_PASS', () => {
    const world = createTestWorld(
      ['#####', '#P.P#', '#####'],
      { playerSpawn: { x: 1, y: 1 } },
    )
    const q = GridQuery.for(world)

    expect(world.grid.get(1, 1)).toBe(TILE_PASS)
    expect(q.blocksMovement(1, 1, world.player)).toBe(false)
    expect(q.isWalkable(1, 1)).toBe(true)

    for (let i = 0; i < 20; i++) stepCollision(world, 0.05, DIR_RIGHT)

    expect(world.player.tileX).toBe(3)
  })

  it('bomba bloquea movimiento salvo passThrough del dueño', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, bombs: [{ x: 3, y: 1 }] },
    )
    const q = GridQuery.for(world)
    const bomb = world.bombs[0]

    expect(q.bombBlocksEntity(3, 1, world.player)).toBe(false)

    bomb.passThrough = false
    expect(q.bombBlocksEntity(3, 1, world.player)).toBe(true)

    world.player.desiredFacing = DIR_RIGHT
    const xBefore = world.player.posX
    for (let i = 0; i < 20; i++) stepCollision(world, 0.05, DIR_RIGHT)

    expect(world.player.posX).toBeCloseTo(xBefore, 0)
    expect(world.player.tileX).toBe(2)
  })

  it('actualiza tileX/tileY tras mover', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 2 } },
    )

    stepCollision(world, 0.2, DIR_DOWN)
    expect(world.player.tileY).toBeGreaterThanOrEqual(2)
  })

  it('corner assist: navega un giro en L sin quedarse atascado', () => {
    const world = createTestWorld(
      [
        '#######',
        '#.....#',
        '#.....#',
        '#####.#',
        '#.....#',
        '#######',
      ],
      { playerSpawn: { x: 1, y: 1 } },
    )

    for (let i = 0; i < 40; i++) stepCollision(world, 0.05, DIR_RIGHT)
    expect(world.player.tileX).toBeGreaterThanOrEqual(4)

    for (let i = 0; i < 40; i++) stepCollision(world, 0.05, DIR_DOWN)
    expect(world.player.tileY).toBeGreaterThanOrEqual(3)
  })
})
