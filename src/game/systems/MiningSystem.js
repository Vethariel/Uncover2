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
import {
  fortuneChance,
  miningDurationFactor,
} from '../../config/crafting.js'

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
    if (!player?.alive || player.hurtAnimationTimer > 0) {
      world.activeMiningTarget = null
      return
    }

    // Debug: T = pico instantáneo sobre el destructible frontal.
    if (input?.isJustDown?.('debugMine')) {
      const target = this._facingDestructible(world, player)
      if (target) {
        this._completeMining(world, player, target.x, target.y)
        return
      }
    }

    if (!input?.isDown('mine')) {
      world.activeMiningTarget = null
      return
    }

    const target = this._facingDestructible(world, player)
    if (!target) {
      world.activeMiningTarget = null
      return
    }
    const { x: targetX, y: targetY } = target

    const key = tileKey(targetX, targetY)
    const spawn = findResourceSpawn(world, targetX, targetY)
    const profile = miningProfileFor(spawn?.material)
    const duration = profile.duration * miningDurationFactor(player.pickSpeed ?? 0)
    const progress = (world.miningProgress.get(key) ?? 0) + dt
    world.miningProgress.set(key, progress)
    world.activeMiningTarget = {
      x: targetX,
      y: targetY,
      progress,
      duration,
    }

    if (progress < duration) return

    this._completeMining(world, player, targetX, targetY)
  }

  _facingDestructible(world, player) {
    const vec = facingVector(player.facing)
    const x = player.tileX + vec.x
    const y = player.tileY + vec.y
    if (!world.grid.inBounds(x, y)) return null
    if (world.grid.get(x, y) !== TILE_DESTRUCTIBLE) return null
    return { x, y }
  }

  _completeMining(world, player, targetX, targetY) {
    const spawn = findResourceSpawn(world, targetX, targetY)
    const profile = miningProfileFor(spawn?.material)

    world.grid.set(targetX, targetY, TILE_EMPTY)
    world.miningProgress.delete(tileKey(targetX, targetY))
    world.activeMiningTarget = null

    if (spawn) {
      let amount = spawn.amount ?? profile.yield
      const chance = fortuneChance(player.fortune ?? 0)
      if (chance > 0 && Math.random() < chance) amount += 1
      addResources(world.runResources, spawn.material, amount)
      clearResourceSpawn(world, targetX, targetY)
      world.events.push('resourceCollected')
    } else {
      world.events.push('mineComplete')
    }
  }
}
