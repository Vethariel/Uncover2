import { describe, it, expect } from 'vitest'
import { GridQuery } from '../../src/game/GridQuery.js'
import { Bomb } from '../../src/game/entities/Bomb.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { TILE_SIZE } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'

describe('GridQuery', () => {
  const map = ['#####', '#...#', '#.#.#', '#...#', '#####']

  it('isSolidTile detecta pared y destructible, salvo para espíritus', () => {
    const world = createTestWorld(map, {
      playerSpawn: { x: 1, y: 1 },
      enemies: [{ x: 1, y: 1, kind: 'spirit' }],
    })
    const q = GridQuery.for(world)

    expect(q.isSolidTile(0, 0)).toBe(true)
    expect(q.isSolidTile(1, 1)).toBe(false)
    world.grid.set(2, 2, 2) // TILE_DESTRUCTIBLE
    expect(q.isSolidTile(2, 2)).toBe(true)
    expect(q.isSolidTile(2, 2, world.enemies[0])).toBe(false)
  })

  it('hasBomb y bombBlocksEntity respetan passThrough del dueño', () => {
    const world = createTestWorld(map, { playerSpawn: { x: 2, y: 2 } })
    const bomb = new Bomb(2, 2, TILE_SIZE, world.player, 1, 2.5)
    world.bombs.push(bomb)

    const q = GridQuery.for(world)
    expect(q.hasBomb(2, 2)).toBe(true)
    expect(q.bombBlocksEntity(2, 2, world.player)).toBe(false)

    bomb.passThrough = false
    expect(q.bombBlocksEntity(2, 2, world.player)).toBe(true)
  })

  it('isWalkable excluye sólidos y bombas', () => {
    const world = createTestWorld(['###', '#P#', '###'], { playerSpawn: { x: 1, y: 1 } })
    const q = GridQuery.for(world)

    expect(q.isWalkable(1, 1)).toBe(true) // TILE_PASS
    world.bombs.push(new Bomb(1, 1, TILE_SIZE, world.player))
    expect(q.isWalkable(1, 1)).toBe(false)
  })

  it('isDangerous detecta explosión activa y bomba a punto de detonar', () => {
    const world = createTestWorld(map, { playerSpawn: { x: 2, y: 2 } })
    const q = GridQuery.for(world)

    world.explosions.push(new Explosion(2, 2, TILE_SIZE))
    expect(q.isDangerous(2, 2)).toBe(true)
    expect(q.isDangerous(3, 2)).toBe(false)

    world.explosions = []
    world.bombs.push(new Bomb(2, 2, TILE_SIZE, world.player, 1, 1.0))
    expect(q.isDangerous(2, 2)).toBe(true)
    expect(q.isDangerous(2, 3)).toBe(true) // en rango vertical
    expect(q.isDangerous(2, 4)).toBe(false) // fuera de rango 1
  })

  it('lineOfSight se bloquea con pared intermedia', () => {
    const world = createTestWorld(map)
    const q = GridQuery.for(world)

    expect(q.lineOfSight(2, 1, 2, 3)).toBe(false) // pared en (2,2)
    expect(q.lineOfSight(1, 3, 3, 3)).toBe(true)
  })

  it('isSafe requiere walkable y no peligroso', () => {
    const world = createTestWorld(map, { playerSpawn: { x: 2, y: 2 } })
    const q = GridQuery.for(world)

    expect(q.isSafe(2, 1)).toBe(true)
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    expect(q.isSafe(2, 1)).toBe(false)
  })
})
