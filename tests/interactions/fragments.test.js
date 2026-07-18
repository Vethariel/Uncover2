import { describe, expect, it } from 'vitest'
import {
  DIR_NONE,
  DIR_RIGHT,
  TILE_WALL,
} from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepFragments, stepInput } from '../helpers/systems.js'

function fragmentWorld(fragment) {
  const world = createTestWorld(
    [
      '#####',
      '#...#',
      '#####',
    ],
    { playerSpawn: { x: 2, y: 1 }, player: { facing: DIR_RIGHT } },
  )
  world.grid.set(3, 1, TILE_WALL)
  world.recipeFragmentSpawns = [{
    x: 3,
    y: 1,
    rank: fragment.rank ?? 2,
    kind: fragment.kind ?? 'generic',
    upgradeId: fragment.upgradeId ?? null,
    interact: { x: 2, y: 1 },
    nodeId: 0,
  }]
  world.player.tileX = 2
  world.player.tileY = 1
  world.player.facing = DIR_RIGHT
  return world
}

describe('FragmentExtractSystem', () => {
  it('acumula progreso con E y no lo pierde al soltar', () => {
    const world = fragmentWorld({ kind: 'generic' })

    stepFragments(world, 1.0, { held: ['interact'] })
    expect(world.fragmentProgress.get('3,1')).toBeCloseTo(1.0)
    expect(world.grid.get(3, 1)).toBe(TILE_WALL)
    expect(world.runFragments.generic).toBe(0)

    stepFragments(world, 0.2, { held: [] })
    expect(world.fragmentProgress.get('3,1')).toBeCloseTo(1.0)

    stepFragments(world, 1.6, { held: ['interact'] })
    expect(world.runFragments.generic).toBe(1)
    expect(world.recipeFragmentSpawns).toHaveLength(0)
    expect(world.grid.get(3, 1)).toBe(TILE_WALL)
    expect(world.events).toContain('fragmentCollected')
  })

  it('especializado tarda 3.5s', () => {
    const world = fragmentWorld({ kind: 'specialized', upgradeId: 'fortune', rank: 3 })

    stepFragments(world, 3.4, { held: ['interact'] })
    expect(world.runFragments.specialized.fortune).toBe(0)

    stepFragments(world, 0.2, { held: ['interact'] })
    expect(world.runFragments.specialized.fortune).toBe(1)
  })

  it('inmoviliza al jugador mientras extrae', () => {
    const world = fragmentWorld({ kind: 'generic' })
    stepInput(world, { held: ['interact', 'left'] })
    expect(world.player.desiredFacing).toBe(DIR_NONE)
  })
})
