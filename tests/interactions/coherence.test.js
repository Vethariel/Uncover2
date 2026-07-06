import { describe, it, expect } from 'vitest'
import { GridQuery } from '../../src/game/GridQuery.js'
import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
  TILE_PASS,
} from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'

/**
 * Coherencia entre APIs: mismas reglas para movimiento, IA y futuras trampas.
 * Si estos tests fallan, algún sistema está interpretando el grid distinto.
 */
describe('coherencia del modelo tile', () => {
  const map = [
    '#######',
    '#.PD..#',
    '#.....#',
    '#######',
  ]

  it('isWalkable coincide con !blocksMovement sin entidad en tiles transitables', () => {
    const world = createTestWorld(map, { playerSpawn: { x: 2, y: 1 } })
    const q = GridQuery.for(world)

    for (let y = 0; y < world.grid.rows; y++) {
      for (let x = 0; x < world.grid.cols; x++) {
        const walkable = q.isWalkable(x, y)
        const blocked = q.blocksMovement(x, y)
        expect(walkable).toBe(!blocked)
      }
    }
  })

  it('sólidos bloquean movimiento y no son walkable', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    for (const [tile, label] of [
      [TILE_WALL, 'wall'],
      [TILE_DESTRUCTIBLE, 'destructible'],
    ]) {
      world.grid.set(3, 2, tile)
      expect(q.isSolidTile(3, 2)).toBe(true)
      expect(q.blocksMovement(3, 2)).toBe(true)
      expect(q.isWalkable(3, 2)).toBe(false)
    }
  })

  it('TILE_PASS es transitable para movimiento e IA', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    expect(world.grid.get(2, 1)).toBe(TILE_PASS)
    expect(q.isSolidTile(2, 1)).toBe(false)
    expect(q.blocksMovement(2, 1)).toBe(false)
    expect(q.isWalkable(2, 1)).toBe(true)
    expect(q.isSafe(2, 1)).toBe(true)
  })

  it('bomba hace tile no walkable pero passThrough no bloquea al dueño', () => {
    const world = createTestWorld(map, { playerSpawn: { x: 4, y: 1 } })
    const q = GridQuery.for(world)

    world.bombs.push({
      tileX: 4,
      tileY: 1,
      passThrough: true,
      owner: world.player,
    })

    expect(q.hasBomb(4, 1)).toBe(true)
    expect(q.isWalkable(4, 1)).toBe(false)
    expect(q.bombBlocksEntity(4, 1, world.player)).toBe(false)
    expect(q.blocksMovement(4, 1, world.player)).toBe(false)
    expect(q.blocksMovement(4, 1)).toBe(true)
  })

  it('fuera de bounds: sólido para movimiento, no walkable', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    expect(q.inBounds(-1, 0)).toBe(false)
    expect(q.isSolidTile(-1, 0)).toBe(true)
    expect(q.isWalkable(-1, 0)).toBe(false)
  })

  it('destructible en el mapa bloquea walkable y lineOfSight', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    expect(world.grid.get(3, 1)).toBe(TILE_DESTRUCTIBLE)
    expect(q.isWalkable(3, 1)).toBe(false)
    expect(q.lineOfSight(1, 1, 5, 1)).toBe(false)
  })

  it('TILE_PASS: walkable y visible en lineOfSight (explosiones lo bloquean aparte)', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    expect(q.isWalkable(2, 1)).toBe(true)
    expect(q.lineOfSight(1, 1, 3, 1)).toBe(true)
  })
})
