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
  it('usa casco 7 dentro del radio visual máximo 7', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    vision.update(world)

    expect(world.lightLevels.get('12,12')).toBe(7)
    expect(world.lightLevels.get('13,12')).toBe(6)
    expect(world.lightLevels.get('18,12')).toBe(1)
    expect(world.visibleTiles.has('19,12')).toBe(false)
    expect(world.lightLevels.get('13,13')).toBe(5)

    world.player.tileX = 14
    vision.update(world)

    expect(world.discoveredTiles.has('12,12')).toBe(true)
  })

  it('muestra el primer obstáculo pero no propaga detrás', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    world.grid.set(15, 12, TILE_WALL)

    vision.update(world)

    expect(world.visibleTiles.has('14,12')).toBe(true)
    expect(world.visibleTiles.has('15,12')).toBe(true)
    expect(world.visibleTiles.has('16,12')).toBe(false)
    expect(world.discoveredTiles.has('16,12')).toBe(false)
  })

  it('aplica intensidades de bomba, monstruos, espíritu, explosión y antorcha', () => {
    const world = createTestWorld(openMap(25), {
      playerSpawn: { x: 12, y: 12 },
      bombs: [{ x: 18, y: 12 }],
      enemies: [
        { x: 12, y: 18, kind: 'golem_basic' },
        { x: 6, y: 12, kind: 'spirit' },
      ],
    })
    world.enemies[1].setAggressive(true)
    world.explosions = [{ tileX: 12, tileY: 6 }]
    world.wallLightSpawns = [{
      x: 16,
      y: 16,
      wallX: 17,
      wallY: 16,
      orientation: 'east',
    }]

    vision.update(world)

    // Casco, fuente local y borde de la antorcha se acumulan.
    expect(world.lightLevels.get('18,12')).toBe(8)
    expect(world.lightLevels.get('12,18')).toBe(8)
    expect(world.lightLevels.get('6,12')).toBe(6)
    expect(world.lightLevels.get('12,6')).toBe(6)
    expect(world.lightLevels.get('16,16')).toBe(10)
    expect(Math.max(...world.lightLevels.values())).toBe(10)
  })

  it('un muro de luz ligeramente fuera del radio puede iluminar hacia dentro', () => {
    const world = createTestWorld(openMap(27), { playerSpawn: { x: 12, y: 12 } })
    world.wallLightSpawns = [{ x: 20, y: 12, wallX: 21, wallY: 12, orientation: 'east' }]

    vision.update(world)

    expect(world.visibleTiles.has('19,12')).toBe(true)
    expect(world.lightLevels.get('19,12')).toBe(9)
    expect(world.visibleTiles.has('20,12')).toBe(false)
  })

  it('los destructibles también bloquean la propagación', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    world.grid.set(15, 12, TILE_DESTRUCTIBLE)
    vision.update(world)

    expect(world.visibleTiles.has('15,12')).toBe(true)
    expect(world.visibleTiles.has('16,12')).toBe(false)
  })

  it('un obstáculo diagonal proyecta sombra radial', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    world.wallLightSpawns = [{
      x: 12,
      y: 12,
      wallX: 12,
      wallY: 11,
      orientation: 'north',
    }]
    world.grid.set(13, 13, TILE_WALL)

    vision.update(world)

    expect(world.visibleTiles.has('13,13')).toBe(true)
    expect(world.visibleTiles.has('14,14')).toBe(false)
  })
})
