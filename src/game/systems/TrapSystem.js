import {
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../config/constants.js'
import {
  DART_STEP_INTERVAL,
  DART_WARNING_DURATION,
  createDart,
} from '../../config/trapTypes.js'

function sameTile(a, b) {
  return a.x === b.x && a.y === b.y
}

function tileBlocksDart(tile) {
  return tile === TILE_WALL || tile === TILE_DESTRUCTIBLE
}

export function disableTrapAt(world, x, y) {
  let disabled = false
  for (const trap of world.traps ?? []) {
    if (trap.state === 'disabled') continue
    if (
      (trap.plate.x === x && trap.plate.y === y)
      || (trap.launcher.x === x && trap.launcher.y === y)
    ) {
      trap.state = 'disabled'
      trap.warningTimer = 0
      trap.occupiedLastFrame = false
      disabled = true
      world.events.push('trapDestroyed')
    }
  }
  if (disabled) {
    world.darts = (world.darts ?? []).filter((dart) => {
      const trap = (world.traps ?? []).find((entry) => entry.id === dart.trapId)
      return trap && trap.state !== 'disabled'
    })
  }
  return disabled
}

export class TrapSystem {
  constructor(lifeSystem = null) {
    this.lifeSystem = lifeSystem
  }

  update(world, dt) {
    if (!world.traps) world.traps = []
    if (!world.darts) world.darts = []

    this._updatePlates(world, dt)
    this._updateDarts(world, dt)
  }

  _updatePlates(world, dt) {
    const player = world.player
    for (const trap of world.traps) {
      if (trap.state === 'disabled') continue

      const onPlate = Boolean(
        player?.alive
        && player.tileX === trap.plate.x
        && player.tileY === trap.plate.y,
      )

      if (trap.state === 'idle') {
        if (onPlate && !trap.occupiedLastFrame) {
          trap.state = 'warning'
          trap.warningTimer = DART_WARNING_DURATION
          world.events.push('trapArmed')
        }
      } else if (trap.state === 'warning') {
        trap.warningTimer = Math.max(0, trap.warningTimer - dt)
        if (trap.warningTimer <= 0) {
          this._fireDart(world, trap)
          trap.state = 'fired'
        }
      } else if (trap.state === 'fired') {
        if (!onPlate) {
          trap.state = 'idle'
        }
      }

      trap.occupiedLastFrame = onPlate
    }
  }

  _fireDart(world, trap) {
    world.darts.push(createDart({
      tileX: trap.launcher.x,
      tileY: trap.launcher.y,
      dir: trap.dir,
      trapId: trap.id,
    }))
    world.events.push('dartFire')
  }

  _updateDarts(world, dt) {
    const survivors = []
    for (const dart of world.darts) {
      if (!dart.alive) continue
      dart.stepTimer -= dt
      if (dart.stepTimer > 0) {
        survivors.push(dart)
        continue
      }

      // Un tile por frame para preservar tiempo de reacción.
      dart.stepTimer = DART_STEP_INTERVAL
      const nextX = dart.tileX + dart.dir.x
      const nextY = dart.tileY + dart.dir.y
      if (!world.grid.inBounds(nextX, nextY)) continue

      const tile = world.grid.get(nextX, nextY)
      if (tileBlocksDart(tile)) continue

      dart.tileX = nextX
      dart.tileY = nextY

      const player = world.player
      if (
        player?.alive
        && player.tileX === dart.tileX
        && player.tileY === dart.tileY
      ) {
        this.lifeSystem?.damagePlayer?.(world)
        world.events.push('dartHit')
        continue
      }

      survivors.push(dart)
    }
    world.darts = survivors
  }
}

export function trapOccupiesTile(traps, x, y) {
  return (traps ?? []).some((trap) => (
    trap.state !== 'disabled'
    && (
      sameTile(trap.plate, { x, y })
      || sameTile(trap.launcher, { x, y })
    )
  ))
}
