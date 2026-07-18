import { describe, expect, it } from 'vitest'
import {
  DIR_RIGHT,
  PLAYER_LIVES,
  PLAYER_SIZE,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../src/config/constants.js'
import { DART_WARNING_DURATION } from '../../src/config/trapTypes.js'
import { createTrap } from '../../src/config/trapTypes.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import {
  explodeBomb,
  stepInput,
  stepLife,
  stepTrap,
} from '../helpers/systems.js'
import { positionFromTile } from '../../src/game/entityTiles.js'
import { GridQuery } from '../../src/game/GridQuery.js'

function placePlayer(world, x, y) {
  const pos = positionFromTile(x, y, world.tileSize, PLAYER_SIZE)
  Object.assign(world.player, pos)
}

function dartWorld() {
  // Launcher (1,1) → plate (5,1), distancia 4, LOS libre.
  const world = createTestWorld(
    [
      '#######',
      '#.....#',
      '#.....#',
      '#######',
    ],
    { playerSpawn: { x: 3, y: 2 } },
  )
  world.traps = [
    createTrap({
      id: 0,
      plate: { x: 5, y: 1 },
      launcher: { x: 1, y: 1 },
      dir: { x: 1, y: 0 },
    }),
  ]
  return world
}

describe('TrapSystem', () => {
  it('avisa y dispara un dardo hacia la placa', () => {
    const world = dartWorld()
    placePlayer(world, 5, 1)
    stepTrap(world, 0)
    expect(world.traps[0].state).toBe('warning')

    stepTrap(world, DART_WARNING_DURATION - 0.01)
    expect(world.traps[0].state).toBe('warning')
    stepTrap(world, 0.02)
    expect(world.traps[0].state).toBe('fired')
    expect(world.darts).toHaveLength(1)
    expect(world.darts[0].tileX).toBe(1)
    expect(world.darts[0].tileY).toBe(1)
    expect(world.events).toContain('dartFire')
  })

  it('el dardo daña al jugador y muere en muro/destructible', () => {
    const world = dartWorld()
    placePlayer(world, 5, 1)
    stepTrap(world, 0)
    stepTrap(world, DART_WARNING_DURATION)

    // Avanzar dardo hasta el jugador en la placa.
    for (let i = 0; i < 20 && world.player.lives === PLAYER_LIVES; i++) {
      stepTrap(world, 0.12)
      stepLife(world, 0)
    }
    expect(world.player.lives).toBe(PLAYER_LIVES - 1)

    const blocked = dartWorld()
    blocked.grid.set(3, 1, TILE_DESTRUCTIBLE)
    placePlayer(blocked, 5, 1)
    stepTrap(blocked, 0)
    stepTrap(blocked, DART_WARNING_DURATION)
    for (let i = 0; i < 20 && blocked.darts.length; i++) {
      stepTrap(blocked, 0.12)
    }
    expect(blocked.darts).toHaveLength(0)
    expect(blocked.grid.get(3, 1)).toBe(TILE_DESTRUCTIBLE)

    const walled = dartWorld()
    walled.grid.set(3, 1, TILE_WALL)
    placePlayer(walled, 5, 1)
    stepTrap(walled, 0)
    stepTrap(walled, DART_WARNING_DURATION)
    for (let i = 0; i < 20 && walled.darts.length; i++) {
      stepTrap(walled, 0.12)
    }
    expect(walled.darts).toHaveLength(0)
  })

  it('se rearma al salir de la placa', () => {
    const world = dartWorld()
    placePlayer(world, 5, 1)
    stepTrap(world, 0)
    stepTrap(world, DART_WARNING_DURATION)
    expect(world.traps[0].state).toBe('fired')

    placePlayer(world, 3, 2)
    stepTrap(world, 0)
    expect(world.traps[0].state).toBe('idle')
  })

  it('la bomba desactiva placa o lanzador', () => {
    const world = dartWorld()
    world.player.tileX = 4
    world.player.tileY = 1
    world.player.facing = DIR_RIGHT
    stepInput(world, { justDown: ['bomb'] })
    expect(world.bombs).toHaveLength(1)
    world.bombs[0].range = 2
    explodeBomb(world, 0)
    expect(world.traps[0].state).toBe('disabled')
  })

  it('marca placa en warning como peligrosa', () => {
    const world = dartWorld()
    placePlayer(world, 5, 1)
    stepTrap(world, 0)
    const q = GridQuery.for(world)
    expect(q.isDangerous(5, 1)).toBe(true)
  })
})
