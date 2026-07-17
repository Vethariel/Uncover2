import { describe, expect, it } from 'vitest'
import { TILE_DESTRUCTIBLE, TILE_WALL } from '../../src/config/constants.js'
import { VisionSystem } from '../../src/game/systems/VisionSystem.js'
import { createTestWorld } from '../helpers/worldFactory.js'

const vision = new VisionSystem()

function openMap(size = 13) {
  const border = '#'.repeat(size)
  const middle = `#${'.'.repeat(size - 2)}#`
  return [border, ...Array.from({ length: size - 2 }, () => middle), border]
}

describe('VisionSystem', () => {
  it('usa luz del casco con radio 3 y persiste descubrimiento', () => {
    const world = createTestWorld(openMap(), { playerSpawn: { x: 6, y: 6 } })
    vision.update(world)

    expect(world.lightLevels.get('6,6')).toBe(3)
    expect(world.lightLevels.get('7,6')).toBe(2)
    expect(world.lightLevels.get('8,6')).toBe(1)
    expect(world.visibleTiles.has('9,6')).toBe(false)
    expect(world.visibleTiles.has('7,7')).toBe(false)

    world.player.tileX = 8
    vision.update(world)

    expect(world.visibleTiles.has('8,6')).toBe(true)
    expect(world.visibleTiles.has('6,6')).toBe(true)
    expect(world.discoveredTiles.has('7,6')).toBe(true)
  })

  it('muestra el primer obstáculo pero no propaga detrás', () => {
    const world = createTestWorld(openMap(), { playerSpawn: { x: 6, y: 6 } })
    world.grid.set(9, 6, TILE_WALL)

    vision.update(world)

    expect(world.visibleTiles.has('7,6')).toBe(true)
    expect(world.visibleTiles.has('8,6')).toBe(true)
    expect(world.visibleTiles.has('9,6')).toBe(false)
    expect(world.visibleTiles.has('10,6')).toBe(false)
    expect(world.discoveredTiles.has('10,6')).toBe(false)
  })

  it('la explosión añade luz y la luz de muro gira con penalización del 50%', () => {
    const world = createTestWorld(openMap(), { playerSpawn: { x: 6, y: 6 } })
    world.grid.set(8, 7, TILE_WALL)
    world.wallLightSpawns = [{ x: 8, y: 6, wallX: 8, wallY: 7, orientation: 'south' }]
    world.explosions = [{ tileX: 9, tileY: 6 }]
    vision.update(world)

    expect(world.lightLevels.get('8,6')).toBe(5)
    expect(world.lightLevels.get('9,6')).toBe(5)
    expect(world.lightLevels.get('8,5')).toBe(3)
    expect(world.lightLevels.get('8,7')).toBe(3)
    expect(world.visibleTiles.has('8,8')).toBe(false)
  })

  it('un muro de luz ligeramente fuera del radio puede iluminar hacia dentro', () => {
    const world = createTestWorld(openMap(17), { playerSpawn: { x: 8, y: 8 } })
    world.wallLightSpawns = [{ x: 14, y: 8, wallX: 15, wallY: 8, orientation: 'east' }]

    vision.update(world)

    expect(world.visibleTiles.has('13,8')).toBe(true)
    expect(world.lightLevels.get('13,8')).toBe(3)
    expect(world.visibleTiles.has('14,8')).toBe(false)
  })

  it('los destructibles también bloquean la propagación', () => {
    const world = createTestWorld(openMap(), { playerSpawn: { x: 6, y: 6 } })
    world.grid.set(8, 6, TILE_DESTRUCTIBLE)
    vision.update(world)

    expect(world.visibleTiles.has('7,6')).toBe(true)
    expect(world.visibleTiles.has('8,6')).toBe(true)
    expect(world.visibleTiles.has('9,6')).toBe(false)
  })
})
