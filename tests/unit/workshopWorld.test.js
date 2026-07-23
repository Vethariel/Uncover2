import { describe, expect, it } from 'vitest'
import { PLAYER_SIZE, TILE_EMPTY } from '../../src/config/constants.js'
import {
  createWorkshopWorld,
  interactTarget,
} from '../../src/game/workshop/WorkshopWorld.js'
import { WorkshopLoop } from '../../src/game/workshop/WorkshopLoop.js'
import { GridQuery } from '../../src/game/GridQuery.js'
import { positionFromTile } from '../../src/game/entityTiles.js'

describe('WorkshopWorld', () => {
  it('crea horno y yunque como entidades 3×3', () => {
    const world = createWorkshopWorld()
    expect(world.stations).toHaveLength(2)
    const furnace = world.stations.find((s) => s.kind === 'furnace')
    const anvil = world.stations.find((s) => s.kind === 'anvil')
    expect(furnace.tiles).toHaveLength(9)
    expect(anvil.tiles).toHaveLength(9)
    expect(furnace.bodySize).toBe(3)
    expect(anvil.bodySize).toBe(3)
    expect(furnace.solid).toBe(true)
    expect(anvil.solid).toBe(true)
    expect(world.exitDoor.triggerTiles.length).toBeGreaterThan(0)
    expect(furnace.tileY).toBeLessThan(world.playerSpawn.y)
    expect(world.exitDoor.center.y).toBe(world.grid.rows - 1)

    const query = GridQuery.for(world)
    for (const station of [furnace, anvil]) {
      for (const tile of station.tiles) {
        expect(world.grid.get(tile.x, tile.y)).toBe(TILE_EMPTY)
        expect(query.blocksMovement(tile.x, tile.y)).toBe(true)
        expect(query.hasSolidEntity(tile.x, tile.y)).toBe(true)
      }
    }
  })

  it('detecta estación adyacente y puerta', () => {
    const world = createWorkshopWorld()
    const furnace = world.stations.find((s) => s.kind === 'furnace')
    world.player.tileX = furnace.tileX - 1
    world.player.tileY = furnace.tileY
    expect(interactTarget(world)?.station?.kind).toBe('furnace')

    const anvil = world.stations.find((s) => s.kind === 'anvil')
    world.player.tileX = anvil.tileX
    world.player.tileY = anvil.tileY + 2
    expect(interactTarget(world)?.station?.kind).toBe('anvil')

    world.player.tileX = 6
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
