import { describe, it, expect } from 'vitest'
import { LevelGenerator } from '../../src/game/level/LevelGenerator.js'
import { LEVELS } from '../../src/config/levels.js'
import { TILE_EMPTY, TILE_WALL } from '../../src/config/constants.js'

function gen(spec) {
  const world = {}
  LevelGenerator.generate(world, spec)
  return world
}

function reachableTiles(grid, start, destructiblesArePassable = true) {
  const seen = new Set([`${start.x},${start.y}`])
  const queue = [start]
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]
  for (let index = 0; index < queue.length; index++) {
    const current = queue[index]
    for (const [dx, dy] of directions) {
      const x = current.x + dx
      const y = current.y + dy
      const key = `${x},${y}`
      const tile = grid.get(x, y)
      const passable = tile === TILE_EMPTY
        || (destructiblesArePassable && tile !== null && tile !== TILE_WALL)
      if (seen.has(key) || !passable) continue
      seen.add(key)
      queue.push({ x, y })
    }
  }
  return seen
}

describe('LevelGenerator', () => {
  const spec = {
    ...LEVELS[5],
    seed: 12345,
    debug: true,
  }

  it('rodea el nivel con muros sólidos', () => {
    const { grid } = gen(spec)
    for (let x = 0; x < grid.cols; x++) {
      expect(grid.get(x, 0)).toBe(TILE_WALL)
      expect(grid.get(x, grid.rows - 1)).toBe(TILE_WALL)
    }
    for (let y = 0; y < grid.rows; y++) {
      expect(grid.get(0, y)).toBe(TILE_WALL)
      expect(grid.get(grid.cols - 1, y)).toBe(TILE_WALL)
    }
  })

  it('crea puertas de tres tiles abiertas y una ruta entre ellas', () => {
    const { grid, playerSpawn, entryDoor, exitDoor } = gen(spec)
    expect(entryDoor.tiles).toHaveLength(3)
    expect(exitDoor.tiles).toHaveLength(3)
    for (const tile of [...entryDoor.tiles, ...exitDoor.tiles]) {
      expect(grid.get(tile.x, tile.y)).toBe(TILE_EMPTY)
    }

    const reachable = reachableTiles(grid, playerSpawn)
    expect(exitDoor.tiles.some(({ x, y }) => reachable.has(`${x},${y}`))).toBe(true)
  })

  it('permite que los rompibles bloqueen temporalmente la ruta', () => {
    const { grid, playerSpawn, exitDoor } = gen(spec)
    const reachableWithoutBreaking = reachableTiles(grid, playerSpawn, false)
    expect(
      exitDoor.tiles.some(({ x, y }) => reachableWithoutBreaking.has(`${x},${y}`)),
    ).toBe(false)

    const reachableAfterBreaking = reachableTiles(grid, playerSpawn, true)
    expect(
      exitDoor.tiles.some(({ x, y }) => reachableAfterBreaking.has(`${x},${y}`)),
    ).toBe(true)
  })

  it('mantiene conectado el grafo, grado máximo tres y pasillos objetivo', () => {
    const { levelGraph } = gen(spec)
    const degrees = new Array(levelGraph.nodes.length).fill(0)
    const seen = new Set([0])
    const queue = [0]
    for (const edge of levelGraph.edges) {
      degrees[edge.a]++
      degrees[edge.b]++
      const largestRadius = Math.max(
        levelGraph.nodes[edge.a].radius,
        levelGraph.nodes[edge.b].radius,
      )
      const baseLength = largestRadius === 21 ? 25 : largestRadius === 14 ? 15 : 10
      expect(edge.length).toBeGreaterThanOrEqual(baseLength - 5)
      expect(edge.length).toBeLessThanOrEqual(baseLength + 5)
      expect([3, 5]).toContain(edge.width)
    }
    for (let index = 0; index < queue.length; index++) {
      for (const edge of levelGraph.edges) {
        const next = edge.a === queue[index]
          ? edge.b
          : edge.b === queue[index]
            ? edge.a
            : -1
        if (next < 0 || seen.has(next)) continue
        seen.add(next)
        queue.push(next)
      }
    }
    expect(seen.size).toBe(levelGraph.nodes.length)
    expect(Math.max(...degrees)).toBeLessThanOrEqual(3)
  })

  it('respeta presupuestos de enemigos, recursos y lattice fijo', () => {
    const {
      grid,
      enemySpawns,
      resourceSpawns,
      generationDebug,
    } = gen(spec)
    expect(enemySpawns).toHaveLength(spec.enemies)
    expect(resourceSpawns).toHaveLength(spec.resourceCap)
    const corridorResources = resourceSpawns.filter((spawn) => spawn.location === 'corridor')
    const corridorEnemies = enemySpawns.filter((spawn) => spawn.location === 'corridor')
    expect(corridorResources.length).toBeGreaterThan(0)
    expect(corridorResources.length).toBeLessThan(resourceSpawns.length / 4)
    expect(corridorEnemies.length).toBeGreaterThan(0)
    expect(corridorEnemies.length).toBeLessThan(enemySpawns.length / 2)

    const seen = new Set()
    for (const spawn of [...enemySpawns, ...resourceSpawns]) {
      const spawnKey = `${spawn.x},${spawn.y}`
      expect(seen.has(spawnKey)).toBe(false)
      seen.add(spawnKey)
    }
    for (const wallKey of generationDebug.fixedWalls) {
      const [x, y] = wallKey.split(',').map(Number)
      expect(grid.get(x, y)).toBe(TILE_WALL)
    }
  })

  it('es determinista con el mismo seed', () => {
    const a = gen(spec)
    const b = gen(spec)
    expect(a.grid.tiles).toEqual(b.grid.tiles)
    expect(a.levelGraph).toEqual(b.levelGraph)
    expect(a.entryDoor).toEqual(b.entryDoor)
    expect(a.exitDoor).toEqual(b.exitDoor)
    expect(a.enemySpawns).toEqual(b.enemySpawns)
    expect(a.resourceSpawns).toEqual(b.resourceSpawns)
  })

  it('N3 decide cuatro o cinco nodos de recorrido', () => {
    for (let seed = 1; seed <= 12; seed++) {
      const world = gen({ ...LEVELS[2], seed })
      expect([5, 6]).toContain(world.levelGraph.nodes.length)
    }
  })

  it('mantiene salida y presupuestos en varias semillas de toda la progresión', () => {
    for (const level of LEVELS) {
      for (let seed = 1; seed <= 3; seed++) {
        const world = gen({ ...level, seed })
        const reachable = reachableTiles(world.grid, world.playerSpawn)
        expect(
          world.exitDoor.tiles.some(({ x, y }) => reachable.has(`${x},${y}`)),
        ).toBe(true)
        expect(world.enemySpawns).toHaveLength(level.enemies)
        expect(world.resourceSpawns).toHaveLength(level.resourceCap)
      }
    }
  })
})
