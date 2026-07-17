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

function borderGap(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y) - a.radius - b.radius
}

function hasEmptyOpen2x2(grid, carvedMask) {
  for (const cellKey of carvedMask) {
    const [x, y] = cellKey.split(',').map(Number)
    let allCarved = true
    let hasWall = false
    for (let oy = 0; oy < 2 && allCarved; oy++) {
      for (let ox = 0; ox < 2; ox++) {
        const windowKey = `${x + ox},${y + oy}`
        if (!carvedMask.has(windowKey)) {
          allCarved = false
          break
        }
        if (grid.get(x + ox, y + oy) === TILE_WALL) hasWall = true
      }
    }
    if (allCarved && !hasWall) return true
  }
  return false
}

function findIsolatedEmptyCell(world) {
  const reachable = reachableTiles(world.grid, world.playerSpawn)
  for (const cellKey of world.generationDebug.carvedMask) {
    if (reachable.has(cellKey)) continue
    const [x, y] = cellKey.split(',').map(Number)
    if (world.grid.get(x, y) === TILE_EMPTY) return cellKey
  }
  return null
}

function doorTouchesMouths(door, mouths) {
  const forbidden = new Set(mouths)
  for (const cellKey of mouths) {
    const [x, y] = cellKey.split(',').map(Number)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      forbidden.add(`${x + dx},${y + dy}`)
    }
  }
  return door.tiles.some((tile) => forbidden.has(`${tile.x},${tile.y}`))
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

  it('crea el patrón WWW / W.W / ... y conecta el trigger central', () => {
    const { grid, playerSpawn, entryDoor, exitDoor } = gen(spec)
    expect(entryDoor.tiles).toHaveLength(3)
    expect(exitDoor.tiles).toHaveLength(3)
    for (const door of [entryDoor, exitDoor]) {
      expect(door.triggerTiles).toEqual([door.center])
      expect(grid.get(door.trigger.x, door.trigger.y)).toBe(TILE_EMPTY)
      for (const tile of [...door.sideTiles, ...door.backingTiles]) {
        expect(grid.get(tile.x, tile.y)).toBe(TILE_WALL)
      }
      for (const tile of door.frontTiles) {
        expect(grid.get(tile.x, tile.y)).toBe(TILE_EMPTY)
      }
    }
    expect(playerSpawn).toEqual(entryDoor.trigger)

    const reachable = reachableTiles(grid, playerSpawn)
    expect(reachable.has(`${exitDoor.trigger.x},${exitDoor.trigger.y}`)).toBe(true)
  })

  it('permite que los rompibles bloqueen temporalmente la ruta', () => {
    let blocked = false
    for (let seed = 1; seed <= 30 && !blocked; seed++) {
      const { grid, playerSpawn, exitDoor } = gen({ ...LEVELS[5], seed })
      const reachableWithoutBreaking = reachableTiles(grid, playerSpawn, false)
      blocked = !reachableWithoutBreaking.has(`${exitDoor.trigger.x},${exitDoor.trigger.y}`)
      const reachableAfterBreaking = reachableTiles(grid, playerSpawn, true)
      expect(reachableAfterBreaking.has(`${exitDoor.trigger.x},${exitDoor.trigger.y}`)).toBe(true)
    }
    expect(blocked).toBe(true)
  })

  it('mantiene el grafo conectado y pasillos válidos', () => {
    const { levelGraph } = gen(spec)
    const seen = new Set([0])
    const queue = [0]
    for (const edge of levelGraph.edges) {
      if (!edge.proximity) {
        const sizes = [levelGraph.nodes[edge.a].size, levelGraph.nodes[edge.b].size]
        const baseLength = sizes.includes('large') ? 25 : sizes.includes('medium') ? 15 : 10
        expect(edge.length).toBeGreaterThanOrEqual(baseLength - 5)
        expect(edge.length).toBeLessThanOrEqual(baseLength + 5)
      }
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
  })

  it('conecta nodos cercanos y aleja las puertas de bocas de pasillo', () => {
    const { levelGraph, entryDoor, exitDoor } = gen(spec)
    const edgeSet = new Set(
      levelGraph.edges.map((edge) => (
        edge.a < edge.b ? `${edge.a}-${edge.b}` : `${edge.b}-${edge.a}`
      )),
    )

    for (let a = 0; a < levelGraph.nodes.length; a++) {
      for (let b = a + 1; b < levelGraph.nodes.length; b++) {
        const gap = borderGap(levelGraph.nodes[a], levelGraph.nodes[b])
        if (gap <= 10 && gap >= 0) {
          expect(edgeSet.has(`${a}-${b}`)).toBe(true)
        }
      }
    }

    const entryMouths = levelGraph.corridorMouths[0] ?? []
    const exitMouths = levelGraph.corridorMouths[levelGraph.exitNodeId] ?? []
    expect(doorTouchesMouths(entryDoor, entryMouths)).toBe(false)
    expect(doorTouchesMouths(exitDoor, exitMouths)).toBe(false)
  })

  it('impide ventanas excavadas 2×2 sin indestructible', () => {
    const { grid, generationDebug } = gen(spec)
    expect(hasEmptyOpen2x2(grid, generationDebug.carvedMask)).toBe(false)
    for (const wallKey of generationDebug.organicWalls) {
      const [x, y] = wallKey.split(',').map(Number)
      expect(grid.get(x, y)).toBe(TILE_WALL)
    }
  })

  it('no deja celdas vacías inaccesibles', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const world = gen({ ...LEVELS[5], seed, debug: true })
      expect(findIsolatedEmptyCell(world)).toBeNull()
    }
  })

  it('respeta presupuestos de enemigos y recursos', () => {
    const {
      enemySpawns,
      resourceSpawns,
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
        const world = gen({ ...level, seed, debug: true })
        const reachable = reachableTiles(world.grid, world.playerSpawn)
        expect(
          reachable.has(`${world.exitDoor.trigger.x},${world.exitDoor.trigger.y}`),
        ).toBe(true)
        expect(world.enemySpawns).toHaveLength(level.enemies)
        expect(world.resourceSpawns).toHaveLength(level.resourceCap)
        expect(hasEmptyOpen2x2(world.grid, world.generationDebug.carvedMask)).toBe(false)
        expect(findIsolatedEmptyCell(world)).toBeNull()
      }
    }
  })
})
