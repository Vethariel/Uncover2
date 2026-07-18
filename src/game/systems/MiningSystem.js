import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  TILE_DESTRUCTIBLE,
  TILE_EMPTY,
} from '../../config/constants.js'
import {
  addResources,
  miningProfileFor,
} from '../../config/miningTypes.js'

function tileKey(x, y) {
  return `${x},${y}`
}

function facingVector(facing) {
  switch (facing) {
    case DIR_UP:
      return { x: 0, y: -1 }
    case DIR_DOWN:
      return { x: 0, y: 1 }
    case DIR_LEFT:
      return { x: -1, y: 0 }
    case DIR_RIGHT:
      return { x: 1, y: 0 }
    default:
      return { x: 0, y: 0 }
  }
}

function findResourceSpawn(world, x, y) {
  return (world.resourceSpawns ?? []).find((spawn) => spawn.x === x && spawn.y === y) ?? null
}

function clearResourceSpawn(world, x, y) {
  world.resourceSpawns = (world.resourceSpawns ?? []).filter(
    (spawn) => !(spawn.x === x && spawn.y === y),
  )
  world.miningProgress?.delete(tileKey(x, y))
}

export function destroyDestructibleWithoutYield(world, x, y) {
  clearResourceSpawn(world, x, y)
}

export class MiningSystem {
  update(world, dt, input) {
    const player = world.player
    if (!player?.alive || !input?.isDown('mine')) {
      world.activeMiningTarget = null
      return
    }

    const vec = facingVector(player.facing)
    const targetX = player.tileX + vec.x
    const targetY = player.tileY + vec.y
    if (!world.grid.inBounds(targetX, targetY)) {
      world.activeMiningTarget = null
      return
    }
    if (world.grid.get(targetX, targetY) !== TILE_DESTRUCTIBLE) {
      world.activeMiningTarget = null
      return
    }

    const key = tileKey(targetX, targetY)
    const spawn = findResourceSpawn(world, targetX, targetY)
    const profile = miningProfileFor(spawn?.material)
    const progress = (world.miningProgress.get(key) ?? 0) + dt
    world.miningProgress.set(key, progress)
    world.activeMiningTarget = {
      x: targetX,
      y: targetY,
      progress,
      duration: profile.duration,
    }

    if (progress < profile.duration) return

    world.grid.set(targetX, targetY, TILE_EMPTY)
    world.miningProgress.delete(key)
    world.activeMiningTarget = null

    if (spawn) {
      const amount = spawn.amount ?? profile.yield
      addResources(world.runResources, spawn.material, amount)
      clearResourceSpawn(world, targetX, targetY)
      world.events.push('resourceCollected')
    } else {
      world.events.push('mineComplete')
    }
  }
}
