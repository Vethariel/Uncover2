import { PowerUp } from '../entities/PowerUp.js'
import {
  TILE_DESTRUCTIBLE,
  POWERUP_POOL_RATIO,
  POWERUP_LIFE_CHANCE,
  POWERUP_WEIGHTS,
} from '../../config/constants.js'

export class PowerUpPool {
  static generate(world) {
    const grid = world.grid
    const destructibles = []

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        if (grid.get(x, y) === TILE_DESTRUCTIBLE) {
          destructibles.push({ x, y })
        }
      }
    }

    this.shuffle(destructibles)

    const poolSize = Math.floor(destructibles.length * POWERUP_POOL_RATIO)
    const selected = destructibles.slice(0, poolSize)
    const pool = this.buildPool(poolSize)
    this.shuffle(pool)

    world.powerUps = {}

    for (let i = 0; i < selected.length; i++) {
      const { x, y } = selected[i]
      const kind = Math.random() < POWERUP_LIFE_CHANCE ? 'life' : pool[i]
      world.powerUps[`${x},${y}`] = new PowerUp(x, y, world.tileSize, kind)
    }
  }

  static buildPool(size) {
    const total = Object.values(POWERUP_WEIGHTS).reduce((a, b) => a + b, 0)
    const pool = []

    for (const [kind, weight] of Object.entries(POWERUP_WEIGHTS)) {
      const count = Math.round((weight / total) * size)
      for (let i = 0; i < count; i++) pool.push(kind)
    }

    while (pool.length < size) pool.push('range')

    return pool.slice(0, size)
  }

  static shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
  }
}
