import { describe, expect, it } from 'vitest'
import { TILE_WALL } from '../../src/config/constants.js'
import {
  createWorkshopWorld,
  interactTarget,
} from '../../src/game/workshop/WorkshopWorld.js'

describe('WorkshopWorld', () => {
  it('crea horno y yunque de 2x3 y una puerta', () => {
    const world = createWorkshopWorld()
    expect(world.stations).toHaveLength(2)
    expect(world.stations[0].tiles).toHaveLength(6)
    expect(world.stations[1].tiles).toHaveLength(6)
    expect(world.exitDoor.triggerTiles.length).toBeGreaterThan(0)

    for (const tile of world.stations[0].tiles) {
      expect(world.grid.get(tile.x, tile.y)).toBe(TILE_WALL)
    }
  })

  it('detecta estación adyacente y puerta', () => {
    const world = createWorkshopWorld()
    // Frente al horno (tiles en x=4..5, y=3..5)
    world.player.tileX = 3
    world.player.tileY = 4
    expect(interactTarget(world)?.station?.kind).toBe('furnace')

    world.player.tileX = 10
    world.player.tileY = 1
    expect(interactTarget(world)?.type).toBe('door')
  })
})
