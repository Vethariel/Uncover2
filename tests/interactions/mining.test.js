import { describe, expect, it } from 'vitest'
import {
  DIR_RIGHT,
  TILE_DESTRUCTIBLE,
  TILE_EMPTY,
} from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import {
  explodeBomb,
  stepInput,
  stepMining,
  stepGameLoop,
} from '../helpers/systems.js'

function oreWorld(material = 'bronze', amount = 1) {
  const world = createTestWorld(
    [
      '#####',
      '#..D#',
      '#####',
    ],
    { playerSpawn: { x: 1, y: 1 }, player: { facing: DIR_RIGHT } },
  )
  world.grid.set(3, 1, TILE_DESTRUCTIBLE)
  world.resourceSpawns = [{ x: 3, y: 1, material, amount }]
  world.player.tileX = 2
  world.player.tileY = 1
  world.player.facing = DIR_RIGHT
  return world
}

describe('MiningSystem', () => {
  it('acumula progreso en el bloque y no lo pierde al soltar Q', () => {
    const world = oreWorld('bronze', 1)

    stepMining(world, 0.5, { held: ['mine'] })
    expect(world.miningProgress.get('3,1')).toBeCloseTo(0.5)
    expect(world.grid.get(3, 1)).toBe(TILE_DESTRUCTIBLE)

    stepMining(world, 0.2, { held: [] })
    expect(world.miningProgress.get('3,1')).toBeCloseTo(0.5)

    stepMining(world, 2.0, { held: ['mine'] })
    expect(world.grid.get(3, 1)).toBe(TILE_EMPTY)
    expect(world.runResources.bronze).toBe(1)
    expect(world.resourceSpawns).toHaveLength(0)
    expect(world.events).toContain('resourceCollected')
  })

  it('cristal tarda más y entrega 2 unidades', () => {
    const world = oreWorld('crystal', 2)

    stepMining(world, 2.5, { held: ['mine'] })
    expect(world.grid.get(3, 1)).toBe(TILE_DESTRUCTIBLE)
    expect(world.runResources.crystal).toBe(0)

    stepMining(world, 1.0, { held: ['mine'] })
    expect(world.grid.get(3, 1)).toBe(TILE_EMPTY)
    expect(world.runResources.crystal).toBe(2)
  })

  it('pickSpeed reduce el tiempo de picado', () => {
    const world = oreWorld('bronze', 1)
    world.player.pickSpeed = 1

    stepMining(world, 2.13, { held: ['mine'] })
    expect(world.grid.get(3, 1)).toBe(TILE_EMPTY)
    expect(world.runResources.bronze).toBe(1)
  })

  it('destructible sin mena solo abre camino', () => {
    const world = createTestWorld(
      ['#####', '#..D#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, player: { facing: DIR_RIGHT } },
    )
    world.grid.set(3, 1, TILE_DESTRUCTIBLE)
    world.player.facing = DIR_RIGHT

    stepMining(world, 2.5, { held: ['mine'] })
    expect(world.grid.get(3, 1)).toBe(TILE_EMPTY)
    expect(world.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(world.events).toContain('mineComplete')
  })

  it('bloquea movimiento mientras se pica un destructible', () => {
    const world = oreWorld('iron', 1)

    stepInput(world, { held: ['mine', 'right'] })
    expect(world.player.desiredFacing).toBe(0)
    expect(world.player.facing).toBe(DIR_RIGHT)
  })

  it('la bomba destruye mena sin entregar material', () => {
    const world = oreWorld('bronze', 1)
    world.player.tileX = 1
    world.bombs = []
    stepInput(world, { justDown: ['bomb'] })
    // Colocar bomba en (2,1) y explotar hacia la mena.
    world.player.tileX = 2
    world.player.activeBombs = 0
    world.bombs = []
    stepInput(world, { justDown: ['bomb'] })
    expect(world.bombs).toHaveLength(1)
    world.bombs[0].range = 1
    explodeBomb(world, 0)

    expect(world.grid.get(3, 1)).not.toBe(TILE_DESTRUCTIBLE)
    expect(world.resourceSpawns).toHaveLength(0)
    expect(world.runResources.bronze).toBe(0)
  })

  it('integra minería en el game loop', () => {
    const world = oreWorld('bronze', 1)
    stepGameLoop(world, 2.5, { held: ['mine'] })
    expect(world.runResources.bronze).toBe(1)
  })
})
