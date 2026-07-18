import { describe, expect, it } from 'vitest'
import { TILE_EMPTY } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepPuzzle } from '../helpers/systems.js'
import { positionFromTile } from '../../src/game/entityTiles.js'
import { PLAYER_SIZE } from '../../src/config/constants.js'

function placePlayer(world, x, y) {
  const pos = positionFromTile(x, y, world.tileSize, PLAYER_SIZE)
  Object.assign(world.player, pos)
}

function puzzleWorld() {
  const world = createTestWorld(
    [
      '#######',
      '#.....#',
      '#.....#',
      '#.....#',
      '#######',
    ],
    { playerSpawn: { x: 1, y: 1 } },
  )
  world.puzzleTablets = [
    { x: 2, y: 1, order: 0, visual: 'off' },
    { x: 3, y: 1, order: 1, visual: 'off' },
    { x: 4, y: 1, order: 2, visual: 'off' },
  ]
  world.puzzleReward = { bronze: 3, iron: 2, crystal: 1 }
  return world
}

describe('PuzzleSystem', () => {
  it('avanza en orden y completa con cofre', () => {
    const world = puzzleWorld()
    placePlayer(world, 2, 1)
    stepPuzzle(world)
    expect(world.puzzle.nextExpected).toBe(1)
    expect(world.puzzleTablets[0].visual).toBe('flashGreen')

    placePlayer(world, 3, 1)
    stepPuzzle(world)
    placePlayer(world, 4, 1)
    stepPuzzle(world)

    expect(world.puzzle.completed).toBe(true)
    expect(world.chest).toBeTruthy()
    expect(world.grid.get(world.chest.x, world.chest.y)).toBe(TILE_EMPTY)
    expect(world.events).toContain('puzzleComplete')
  })

  it('falla y reinicia con flash rojo', () => {
    const world = puzzleWorld()
    placePlayer(world, 3, 1)
    stepPuzzle(world)
    expect(world.puzzle.nextExpected).toBe(0)
    expect(world.puzzleTablets.every((tablet) => tablet.visual === 'flashRed')).toBe(true)
    expect(world.events).toContain('puzzleFail')
  })

  it('solo dispara al entrar al tile, no al quedarse', () => {
    const world = puzzleWorld()
    placePlayer(world, 2, 1)
    stepPuzzle(world)
    expect(world.puzzle.nextExpected).toBe(1)
    stepPuzzle(world)
    expect(world.puzzle.nextExpected).toBe(1)
  })

  it('abre el cofre con E y entrega recompensa', () => {
    const world = puzzleWorld()
    placePlayer(world, 2, 1)
    stepPuzzle(world)
    placePlayer(world, 3, 1)
    stepPuzzle(world)
    placePlayer(world, 4, 1)
    stepPuzzle(world)

    placePlayer(world, world.chest.x, world.chest.y)
    stepPuzzle(world, 0, { justDown: ['interact'] })

    expect(world.chest.opened).toBe(true)
    expect(world.runResources).toEqual({ bronze: 3, iron: 2, crystal: 1 })
    expect(world.events).toContain('chestOpen')
  })
})
