import { describe, it, expect } from 'vitest'
import { DIR_RIGHT, DIR_DOWN } from '../../src/config/constants.js'
import { Bomb } from '../../src/game/entities/Bomb.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { TILE_SIZE } from '../../src/config/constants.js'
import { bfsToTarget, bfsToSafeTile, bfsLeafNodes } from '../../src/game/ai/helpers/bfsHelper.js'
import { createTestWorld } from '../helpers/worldFactory.js'

describe('bfsHelper', () => {
  const corridor = ['#######', '#.....#', '#######']

  it('bfsToTarget encuentra dirección hacia objetivo', () => {
    const world = createTestWorld(corridor, { playerSpawn: { x: 1, y: 1 } })
    const dir = bfsToTarget(world, 1, 1, 5, 1)
    expect(dir).toBe(DIR_RIGHT)
  })

  it('bfsToTarget evita tiles peligrosos por defecto', () => {
    const world = createTestWorld(corridor, { playerSpawn: { x: 1, y: 1 } })
    world.bombs.push(new Bomb(3, 1, TILE_SIZE, world.player, 1, 1.0))

    const dir = bfsToTarget(world, 1, 1, 5, 1)
    expect(dir).toBeNull()
  })

  it('bfsToTarget con avoidDanger=false atraviesa tiles con explosión activa', () => {
    const world = createTestWorld(corridor, { playerSpawn: { x: 1, y: 1 } })
    world.explosions.push(new Explosion(2, 1, TILE_SIZE))

    expect(bfsToTarget(world, 1, 1, 5, 1, true)).toBeNull()
    expect(bfsToTarget(world, 1, 1, 5, 1, false)).toBe(DIR_RIGHT)
  })

  it('bfsToSafeTile encuentra tile seguro lejos de bomba', () => {
    const world = createTestWorld(corridor, { playerSpawn: { x: 3, y: 1 } })
    world.bombs.push(new Bomb(3, 1, TILE_SIZE, world.player, 1, 1.0))

    const result = bfsToSafeTile(world, 3, 1)
    expect(result).not.toBeNull()
    expect(result.dir).toBeDefined()
    expect(result.tile.x).not.toBe(3)
  })

  it('bfsLeafNodes devuelve hojas a distancia mínima', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#.....#', '#######'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    const leaves = bfsLeafNodes(world, 1, 1, 2)
    expect(leaves.length).toBeGreaterThan(0)
    expect(leaves.every((l) => l.dist >= 2)).toBe(true)
  })

  it('bfsToTarget retorna null si no hay camino', () => {
    const world = createTestWorld(
      ['#####', '#.#.#', '#####'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    const dir = bfsToTarget(world, 1, 1, 3, 1)
    expect(dir).toBeNull()
  })
})
