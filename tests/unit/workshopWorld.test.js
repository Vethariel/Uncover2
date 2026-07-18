import { describe, expect, it } from 'vitest'
import { PLAYER_SIZE, TILE_WALL } from '../../src/config/constants.js'
import {
  createWorkshopWorld,
  interactTarget,
} from '../../src/game/workshop/WorkshopWorld.js'
import { WorkshopLoop } from '../../src/game/workshop/WorkshopLoop.js'
import { positionFromTile } from '../../src/game/entityTiles.js'

describe('WorkshopWorld', () => {
  it('crea horno y yunque juntos arriba y una puerta abajo', () => {
    const world = createWorkshopWorld()
    expect(world.stations).toHaveLength(2)
    expect(world.stations[0].tiles).toHaveLength(6)
    expect(world.stations[1].tiles).toHaveLength(6)
    expect(world.exitDoor.triggerTiles.length).toBeGreaterThan(0)
    expect(Math.max(...world.stations.flatMap((station) => (
      station.tiles.map((tile) => tile.y)
    )))).toBeLessThan(world.playerSpawn.y)
    expect(world.exitDoor.center.y).toBe(world.grid.rows - 1)

    for (const tile of world.stations[0].tiles) {
      expect(world.grid.get(tile.x, tile.y)).toBe(TILE_WALL)
    }
  })

  it('detecta estación adyacente y puerta', () => {
    const world = createWorkshopWorld()
    // Frente al horno (tiles en x=7..8, y=2..4)
    world.player.tileX = 6
    world.player.tileY = 3
    expect(interactTarget(world)?.station?.kind).toBe('furnace')

    world.player.tileX = 10
    world.player.tileY = world.grid.rows - 2
    expect(interactTarget(world)?.type).toBe('door')
  })

  it('activa la salida al pisar el trigger sin pulsar E', () => {
    const world = createWorkshopWorld()
    const trigger = world.exitDoor.triggerTiles[1]
    const pos = positionFromTile(trigger.x, trigger.y, world.tileSize, PLAYER_SIZE)
    Object.assign(world.player, pos)

    const input = {
      isDown: () => false,
      isJustDown: () => false,
    }
    const result = new WorkshopLoop().update(world, 0, input)

    expect(result.interact?.type).toBe('door')
  })
})
