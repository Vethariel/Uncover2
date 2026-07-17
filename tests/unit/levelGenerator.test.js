import { describe, it, expect } from 'vitest'
import { LevelGenerator } from '../../src/game/level/LevelGenerator.js'
import { TILE_WALL } from '../../src/config/constants.js'

function gen(spec) {
  const world = {}
  LevelGenerator.generate(world, spec)
  return world
}

describe('LevelGenerator', () => {
  const spec = {
    cols: 45,
    rows: 33,
    destructibleChance: 0.5,
    enemies: 5,
    enemyKinds: ['scout', 'hunter'],
    seed: 12345,
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

  it('deja libre la L de arranque del jugador', () => {
    const { grid, playerSpawn } = gen(spec)
    expect(playerSpawn).toEqual({ x: 1, y: 1 })
    expect(grid.get(1, 1)).not.toBe(TILE_WALL)
    expect(grid.get(2, 1)).not.toBe(TILE_WALL)
    expect(grid.get(1, 2)).not.toBe(TILE_WALL)
  })

  it('coloca portal y enemigos en casillas transitables y distintas', () => {
    const { grid, portalSpawn, enemySpawns, playerSpawn } = gen(spec)
    expect(grid.get(portalSpawn.x, portalSpawn.y)).not.toBe(TILE_WALL)

    expect(enemySpawns.length).toBe(5)
    const seen = new Set()
    for (const e of enemySpawns) {
      const key = `${e.x},${e.y}`
      expect(seen.has(key)).toBe(false)
      seen.add(key)
      expect(grid.get(e.x, e.y)).not.toBe(TILE_WALL)
      expect(spec.enemyKinds).toContain(e.kind)
      const dist = Math.abs(e.x - playerSpawn.x) + Math.abs(e.y - playerSpawn.y)
      expect(dist).toBeGreaterThanOrEqual(8)
    }
  })

  it('es determinista con el mismo seed', () => {
    const a = gen(spec)
    const b = gen(spec)
    expect(a.grid.tiles).toEqual(b.grid.tiles)
    expect(a.enemySpawns).toEqual(b.enemySpawns)
  })
})
