import { Grid } from '../Grid.js'
import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
} from '../../config/constants.js'

// PRNG determinista (mulberry32): mismo seed → mismo nivel.
function mulberry32(seed) {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Genera un nivel tipo Bomberman-mina de forma procedural.
 *
 * Contrato (igual que el antiguo LevelLoader): rellena
 * `world.grid`, `world.playerSpawn`, `world.enemySpawns`,
 * `world.portalSpawn` y `world.levelVisualConfig`.
 */
export class LevelGenerator {
  static generate(world, spec = {}) {
    const cols = spec.cols ?? 45
    const rows = spec.rows ?? 33
    const destructibleChance = spec.destructibleChance ?? 0.45
    const enemyCount = spec.enemies ?? 3
    const enemyKinds = spec.enemyKinds ?? ['scout']
    const seed = spec.seed ?? (Math.random() * 0xffffffff) >>> 0
    const rand = mulberry32(seed)

    const grid = new Grid(cols, rows)

    const isBorder = (x, y) => x === 0 || y === 0 || x === cols - 1 || y === rows - 1
    const isPillar = (x, y) => x % 2 === 0 && y % 2 === 0
    const isCorridor = (x, y) => !isBorder(x, y) && !isPillar(x, y)

    // Borde sólido + lattice de pilares indestructibles.
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (isBorder(x, y) || isPillar(x, y)) {
          grid.set(x, y, TILE_WALL)
        } else {
          grid.set(x, y, TILE_EMPTY)
        }
      }
    }

    const playerSpawn = { x: 1, y: 1 }
    const portalSpawn = { x: cols - 2, y: rows - 2 }

    // Casillas que nunca deben quedar bloqueadas por destructibles.
    const reserved = new Set()
    const reserve = (x, y) => reserved.add(`${x},${y}`)
    // L de arranque del jugador (movilidad inicial garantizada).
    reserve(playerSpawn.x, playerSpawn.y)
    reserve(playerSpawn.x + 1, playerSpawn.y)
    reserve(playerSpawn.x, playerSpawn.y + 1)
    // Tile del portal.
    reserve(portalSpawn.x, portalSpawn.y)

    // Enemigos: corredores lejanos al jugador, sobre casilla despejada.
    const minEnemyDist = 8
    const candidates = []
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (!isCorridor(x, y)) continue
        if (reserved.has(`${x},${y}`)) continue
        const dist = Math.abs(x - playerSpawn.x) + Math.abs(y - playerSpawn.y)
        if (dist >= minEnemyDist) candidates.push({ x, y })
      }
    }
    // Barajado Fisher-Yates con el PRNG.
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    }

    const enemySpawns = []
    for (let i = 0; i < enemyCount && i < candidates.length; i++) {
      const { x, y } = candidates[i]
      const kind = enemyKinds[Math.floor(rand() * enemyKinds.length)]
      enemySpawns.push({ x, y, kind })
      reserve(x, y)
    }

    // Rellenar corredores con destructibles según densidad.
    for (let y = 1; y < rows - 1; y++) {
      for (let x = 1; x < cols - 1; x++) {
        if (!isCorridor(x, y)) continue
        if (reserved.has(`${x},${y}`)) continue
        if (rand() < destructibleChance) grid.set(x, y, TILE_DESTRUCTIBLE)
      }
    }

    world.grid = grid
    world.playerSpawn = playerSpawn
    world.portalSpawn = portalSpawn
    world.enemySpawns = enemySpawns
    world.levelVisualConfig = {
      name: spec.name ?? 'Mina',
      bgMusic: spec.bgMusic ?? 'world1',
      seed,
      cols,
      rows,
    }
  }
}
