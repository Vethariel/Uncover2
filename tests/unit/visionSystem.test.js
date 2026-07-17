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
    expect(world.lightLevels.get('13,13')).toBe(6)

    world.player.tileX = 14
    vision.update(world)

    // Se guarda para un futuro minimapa; la niebla de pantalla no lo muestra.
    expect(world.discoveredTiles.has('12,12')).toBe(true)
  })

  it('ilumina a 10 todas las casillas vacías visibles en niveles iniciales', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    world.levelVisualConfig = { emptyTileLight: 10 }
    world.grid.set(15, 12, TILE_DESTRUCTIBLE)

    vision.update(world)

    expect(world.lightLevels.get('12,12')).toBe(10)
    expect(world.lightLevels.get('12,18')).toBe(10)
    expect(world.lightLevels.get('12,19')).toBe(10)
    expect(world.visibleTiles.has('16,12')).toBe(false)
  })

  it('muestra el primer obstáculo pero no propaga detrás', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    world.grid.set(15, 12, TILE_WALL)

    vision.update(world)

    expect(world.visibleTiles.has('14,12')).toBe(true)
    expect(world.visibleTiles.has('15,12')).toBe(true)
    expect(world.visibleTiles.has('16,12')).toBe(false)
  })

  it('aplica intensidades vía lightEmission de cada fuente', () => {
    const world = createTestWorld(openMap(25), {
      playerSpawn: { x: 12, y: 12 },
      bombs: [{ x: 18, y: 12 }],
      enemies: [
        { x: 12, y: 18, kind: 'golem_basic' },
        { x: 6, y: 12, kind: 'spirit' },
      ],
    })
    world.enemies[1].setAggressive(true)
    world.explosions = [{ tileX: 12, tileY: 6, lightEmission: 5 }]
    world.wallLightSpawns = [{
      x: 16,
      y: 16,
      wallX: 17,
      wallY: 16,
      orientation: 'east',
      intensity: 10,
    }]

    vision.update(world)

    expect(world.enemies[0].getLightEmission()).toBe(2)
    expect(world.enemies[1].getLightEmission()).toBe(5)
    expect(world.lightLevels.get('18,12')).toBe(9)
    expect(world.lightLevels.get('12,18')).toBe(9)
    expect(world.lightLevels.get('6,12')).toBe(6)
    expect(world.lightLevels.get('12,6')).toBe(6)
    expect(world.lightLevels.get('16,16')).toBe(10)
    expect(Math.max(...world.lightLevels.values())).toBe(10)
  })

  it('no recalcula si el jugador y las fuentes no cambian', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    vision.update(world)
    const revision = world.visionRevision
    vision.update(world)
    expect(world.visionRevision).toBe(revision)
  })

  it('un muro de luz ligeramente fuera del radio puede iluminar hacia dentro', () => {
    const world = createTestWorld(openMap(27), { playerSpawn: { x: 12, y: 12 } })
    world.wallLightSpawns = [{ x: 20, y: 12, wallX: 21, wallY: 12, orientation: 'east' }]

    vision.update(world)

    expect(world.visibleTiles.has('19,12')).toBe(true)
    expect(world.lightLevels.get('19,12')).toBe(9)
    // La fuente queda fuera del radio: ilumina, pero no es visible.
    expect(world.visibleTiles.has('20,12')).toBe(false)
  })

  it('no muestra los efectos de una luz separada por un destructible', () => {
    const world = createTestWorld(openMap(27), { playerSpawn: { x: 12, y: 12 } })
    world.grid.set(15, 12, TILE_DESTRUCTIBLE)
    world.wallLightSpawns = [{
      x: 18,
      y: 12,
      wallX: 19,
      wallY: 12,
      orientation: 'east',
      intensity: 10,
    }]

    vision.update(world)

    expect(world.visibleTiles.has('15,12')).toBe(true)
    expect(world.visibleTiles.has('16,12')).toBe(false)
    expect(world.visibleTiles.has('17,12')).toBe(false)
    expect(world.visibleTiles.has('18,12')).toBe(false)
  })

  it('conserva tiles explorados sin luz actual para la memoria de niebla', () => {
    const world = createTestWorld(openMap(25), { playerSpawn: { x: 12, y: 12 } })
    vision.update(world)
    expect(world.discoveredTiles.has('12,12')).toBe(true)

    world.player.tileX = 20
    world.player.tileY = 12
    vision.update(world)

    expect(world.visibleTiles.has('12,12')).toBe(false)
    expect(world.discoveredTiles.has('12,12')).toBe(true)
    expect(world.lightLevels.get('12,12') ?? 0).toBe(0)
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
