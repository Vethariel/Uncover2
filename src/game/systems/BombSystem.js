import {
  TILE_WALL,
  TILE_DESTRUCTIBLE,
  TILE_EMPTY,
  TILE_EXPLOSION,
  TILE_PASS,
  PLAYER_BOMB_ANIMATION_DURATION,
  PLAYER_BOMB_APPEAR_DELAY,
} from '../../config/constants.js'
import { Bomb } from '../entities/Bomb.js'
import {
  Explosion,
  EXPLOSION_DURATION,
  EXPLOSION_ADJACENT_DURATION,
} from '../entities/Explosion.js'
import { destroyDestructibleWithoutYield } from './MiningSystem.js'
import { disableTrapAt } from './TrapSystem.js'

/** Retraso entre el centro y cada anillo / dirección de la cadena. */
export const BLAST_EXPAND_DELAY = 0.1

const BLAST_DIRECTIONS = [
  { x: 1, y: 0, key: 'e' },
  { x: -1, y: 0, key: 'w' },
  { x: 0, y: 1, key: 's' },
  { x: 0, y: -1, key: 'n' },
]

export class BombSystem {
  update(world, dt) {
    if (!world.pendingBlastWaves) world.pendingBlastWaves = []

    for (const bomb of world.bombs) {
      bomb.timer -= dt

      if (bomb.timer <= 0) {
        this.explode(world, bomb)
        world.events.push('explosion')
        continue
      }

      if (!bomb.passThrough) continue

      const player = bomb.owner
      if (player.tileX !== bomb.tileX || player.tileY !== bomb.tileY) {
        bomb.passThrough = false
      }
    }

    this.updatePendingBlastWaves(world, dt)

    for (const explosion of world.explosions) {
      if (explosion.type !== 'explosion') continue
      explosion.timer -= dt

      if (explosion.timer <= 0) {
        const grid = world.grid
        const tileX = explosion.tileX
        const tileY = explosion.tileY

        if (grid.get(tileX, tileY) === TILE_EXPLOSION) {
          grid.set(tileX, tileY, TILE_EMPTY)
        }
      }
    }

    world.explosions = world.explosions.filter((explosion) => explosion.timer > 0)
    this.updateBombPlacement(world, dt)
  }

  updatePendingBlastWaves(world, dt) {
    const survivors = []
    for (const wave of world.pendingBlastWaves) {
      wave.timer -= dt
      if (wave.timer > 0) {
        survivors.push(wave)
        continue
      }

      this.expandBlastRing(world, wave)
      wave.nextStep += 1
      if (wave.nextStep <= wave.range && !this._waveFullyBlocked(wave)) {
        wave.timer = BLAST_EXPAND_DELAY
        survivors.push(wave)
      }
    }
    world.pendingBlastWaves = survivors
  }

  _waveFullyBlocked(wave) {
    return BLAST_DIRECTIONS.every((dir) => wave.blocked[dir.key])
  }

  expandBlastRing(world, wave) {
    const grid = world.grid
    const step = wave.nextStep
    const level = wave.level

    for (const dir of BLAST_DIRECTIONS) {
      if (wave.blocked[dir.key]) continue

      const tx = wave.originX + dir.x * step
      const ty = wave.originY + dir.y * step
      if (!grid.inBounds(tx, ty)) {
        wave.blocked[dir.key] = true
        continue
      }

      const tile = grid.get(tx, ty)
      if (tile === TILE_WALL || tile === TILE_EXPLOSION || tile === TILE_PASS) {
        wave.blocked[dir.key] = true
        continue
      }

      const isLast = step === wave.range
      const isDestructible = tile === TILE_DESTRUCTIBLE
      const kind = this.explosionKind(dir, isLast, isDestructible, level)

      const existing = this.getExplosion(world, tx, ty)
      if (existing) {
        existing.kind = this.mergeKind(existing.kind, kind)
      } else {
        this.spawnExplosion(world, tx, ty, kind)
      }

      disableTrapAt(world, tx, ty)

      if (isDestructible) {
        destroyDestructibleWithoutYield(world, tx, ty)
        grid.set(tx, ty, TILE_EXPLOSION)
        wave.blocked[dir.key] = true
        continue
      }

      this.triggerBomb(world, tx, ty)
    }
  }

  updateBombPlacement(world, dt) {
    const player = world.player
    const placement = player?.bombPlacement
    if (!placement) return
    if (!player.alive) {
      player.bombPlacement = null
      return
    }

    placement.elapsed += dt
    if (!placement.spawned && placement.elapsed >= PLAYER_BOMB_APPEAR_DELAY) {
      const bombExists = world.bombs.some((bomb) => (
        bomb.tileX === placement.tileX && bomb.tileY === placement.tileY
      ))
      const canSpawn = (
        player.activeBombs < player.maxBombs
        && world.grid.get(placement.tileX, placement.tileY) !== TILE_PASS
        && !bombExists
      )
      if (canSpawn) {
        world.bombs.push(new Bomb(
          placement.tileX,
          placement.tileY,
          world.tileSize,
          player,
          player.bombRange,
        ))
        player.activeBombs++
        world.events.push('bombPlace')
      }
      placement.spawned = true
    }

    if (placement.elapsed >= PLAYER_BOMB_ANIMATION_DURATION) {
      player.bombPlacement = null
    }
  }

  explode(world, bomb) {
    if (!world.pendingBlastWaves) world.pendingBlastWaves = []

    const tileX = bomb.tileX
    const tileY = bomb.tileY
    const range = bomb.range || 1

    this.spawnExplosion(world, tileX, tileY, 'center')
    disableTrapAt(world, tileX, tileY)

    if (range >= 1) {
      world.pendingBlastWaves.push({
        originX: tileX,
        originY: tileY,
        range,
        level: world.currentLevelIndex + 1,
        nextStep: 1,
        timer: BLAST_EXPAND_DELAY,
        blocked: { n: false, e: false, s: false, w: false },
      })
    }

    bomb.owner.activeBombs--
    world.bombs = world.bombs.filter((b) => b !== bomb)
  }

  explosionKind(dir, isLast, isDestructible, level) {
    if (isDestructible) return `tilelevel${level}`
    if (dir.x !== 0) return isLast ? (dir.x > 0 ? 'tipRight' : 'tipLeft') : 'horizontal'
    if (dir.y !== 0) return isLast ? (dir.y > 0 ? 'tipDown' : 'tipUp') : 'vertical'
    return 'center'
  }

  mergeKind(existing, incoming) {
    if (existing === 'center' || incoming === 'center') return 'center'

    const segments = ['horizontal', 'vertical', 'center']
    if (segments.includes(existing)) return existing
    if (['tipLeft', 'tipRight'].includes(existing)) return 'horizontal'
    if (['tipUp', 'tipDown'].includes(existing)) return 'vertical'
    return incoming
  }

  getExplosion(world, tileX, tileY) {
    return world.explosions.find((e) => e.tileX === tileX && e.tileY === tileY)
  }

  spawnExplosion(world, tx, ty, kind = 'center') {
    const duration = kind === 'center'
      ? EXPLOSION_DURATION
      : EXPLOSION_ADJACENT_DURATION
    world.explosions.push(new Explosion(tx, ty, world.tileSize, kind, duration))
  }

  triggerBomb(world, tx, ty) {
    for (const bomb of world.bombs) {
      if (bomb.tileX === tx && bomb.tileY === ty) {
        bomb.timer = 0
      }
    }
  }
}
