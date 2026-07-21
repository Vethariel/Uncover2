import { DIR_NONE, PLAYER_SPEED, TILE_SIZE } from '../../config/constants.js'
import { getAudio } from './AudioService.js'

/** Intervalo de pasos a velocidad base del jugador. */
const WALK_COOLDOWN_BASE = 0.4
/** Distancia (tiles) a la que el paso de golem deja de oírse. */
const GOLEM_WALK_HEAR_TILES = 7
/** Dentro de esta distancia el paso de golem va a volumen pleno. */
const GOLEM_WALK_FULL_TILES = 1.5

const GOLEM_KINDS = new Set(['golem_basic', 'golem_advanced'])

function tileDistance(ax, ay, bx, by) {
  const dx = ax - bx
  const dy = ay - by
  return Math.hypot(dx, dy)
}

function walkIntervalForSpeed(speed) {
  const safe = Math.max(1, speed ?? PLAYER_SPEED)
  return WALK_COOLDOWN_BASE * (PLAYER_SPEED / safe)
}

function walkRateForSpeed(speed) {
  const safe = Math.max(1, speed ?? PLAYER_SPEED)
  return Math.min(1.6, Math.max(0.75, safe / PLAYER_SPEED))
}

function golemWalkVolume(distanceTiles) {
  if (distanceTiles >= GOLEM_WALK_HEAR_TILES) return 0
  if (distanceTiles <= GOLEM_WALK_FULL_TILES) return 1
  const t = (distanceTiles - GOLEM_WALK_FULL_TILES)
    / (GOLEM_WALK_HEAR_TILES - GOLEM_WALK_FULL_TILES)
  return 1 - t
}

export class SoundBridge {
  constructor(scene) {
    this.audio = getAudio(scene)
    this.walkCooldown = 0
    /** @type {Map<number|string, number>} */
    this.golemWalkCooldowns = new Map()
  }

  handleEvents(events, dt, world) {
    if (this.walkCooldown > 0) this.walkCooldown -= dt

    for (const event of events) {
      switch (event) {
        case 'playerWalk':
          this._playPlayerWalk(world)
          break
        case 'playerDamaged':
          this.audio.playSFX('playerHurt')
          break
        case 'enemyDamaged':
          this.audio.playSFX('enemyHurt')
          break
        case 'enemyDeath':
          this.audio.playSFX('enemyDeath')
          break
        case 'spiritRage':
          this.audio.playSFX('spiritRage')
          break
        case 'golemAggro':
          this.audio.playSFX('golemAggro')
          break
        case 'puzzleStep':
        case 'trapArmed':
          this.audio.playSFX('uiStep')
          break
        case 'puzzleComplete':
          this.audio.playSFX('puzzleComplete')
          break
        case 'puzzleFail':
          this.audio.playSFX('puzzleFail')
          break
        case 'dartFire':
          this.audio.playSFX('dartFire')
          break
        case 'dartHit':
          this.audio.playSFX('dartHit')
          break
        case 'trapDestroyed':
          this.audio.playSFX('trapDestroyed')
          break
        case 'chestOpen':
          this.audio.playSFX('chestOpen')
          break
        case 'mineComplete':
        case 'resourceCollected':
          this.audio.playSFX('mineComplete')
          break
        case 'fragmentCollected':
          this.audio.playSFX('fragmentCollected')
          break
        case 'explosion':
          this.audio.playSFX('explosion')
          break
        case 'bombPlace':
        case 'playerDeath':
          // bombPlace / playerDeath: sincronizados a frame en EntityView.
          break
      }
    }

    this._updateGolemFootsteps(world, dt)
  }

  _playPlayerWalk(world) {
    if (this.walkCooldown > 0) return
    const player = world?.player
    const speed = player?.speed ?? PLAYER_SPEED
    this.audio.playSFX('walk', { rate: walkRateForSpeed(speed) })
    this.walkCooldown = walkIntervalForSpeed(speed)
  }

  _updateGolemFootsteps(world, dt) {
    if (!world?.player?.alive) {
      this.golemWalkCooldowns.clear()
      return
    }

    const player = world.player
    const playerCX = player.posX + player.size / 2
    const playerCY = player.posY + player.size / 2
    const activeIds = new Set()

    for (const enemy of world.enemies ?? []) {
      if (!enemy.alive || !GOLEM_KINDS.has(enemy.kind)) continue
      if (enemy.desiredFacing === DIR_NONE) continue

      const id = enemy.id ?? `${enemy.spawnTileX},${enemy.spawnTileY}`
      activeIds.add(id)

      let cooldown = this.golemWalkCooldowns.get(id) ?? 0
      if (cooldown > 0) {
        this.golemWalkCooldowns.set(id, cooldown - dt)
        continue
      }

      const enemyCX = enemy.posX + enemy.size / 2
      const enemyCY = enemy.posY + enemy.size / 2
      const distTiles = tileDistance(playerCX, playerCY, enemyCX, enemyCY) / TILE_SIZE
      const volume = golemWalkVolume(distTiles)
      if (volume <= 0.02) continue

      this.audio.playSFX('walk', {
        volume: volume * 0.85,
        rate: walkRateForSpeed(enemy.speed),
      })
      this.golemWalkCooldowns.set(id, walkIntervalForSpeed(enemy.speed))
    }

    for (const id of this.golemWalkCooldowns.keys()) {
      if (!activeIds.has(id)) this.golemWalkCooldowns.delete(id)
    }
  }
}
