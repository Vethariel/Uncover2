import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_NONE,
  DIR_RIGHT,
  DIR_UP,
  TILE_WALL,
} from '../../config/constants.js'
import {
  addFragmentToBag,
  createEmptyFragmentBag,
  fragmentExtractDuration,
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

function findFragment(world, x, y) {
  return (world.recipeFragmentSpawns ?? []).find(
    (spawn) => spawn.x === x && spawn.y === y,
  ) ?? null
}

export function isExtractingFragment(world, player, input) {
  if (
    !player?.alive
    || player.hurtAnimationTimer > 0
    || !input?.isDown('interact')
  ) return false
  const vec = facingVector(player.facing)
  const x = player.tileX + vec.x
  const y = player.tileY + vec.y
  if (!world.grid.inBounds(x, y)) return false
  if (world.grid.get(x, y) !== TILE_WALL) return false
  return Boolean(findFragment(world, x, y))
}

export class FragmentExtractSystem {
  update(world, dt, input) {
    const player = world.player
    if (
      !player?.alive
      || player.hurtAnimationTimer > 0
      || !input?.isDown('interact')
    ) {
      world.activeFragmentTarget = null
      return
    }

    const vec = facingVector(player.facing)
    const targetX = player.tileX + vec.x
    const targetY = player.tileY + vec.y
    if (!world.grid.inBounds(targetX, targetY)) {
      world.activeFragmentTarget = null
      return
    }
    if (world.grid.get(targetX, targetY) !== TILE_WALL) {
      world.activeFragmentTarget = null
      return
    }

    const fragment = findFragment(world, targetX, targetY)
    if (!fragment) {
      world.activeFragmentTarget = null
      return
    }

    const key = tileKey(targetX, targetY)
    const duration = fragmentExtractDuration(fragment)
    const progress = (world.fragmentProgress.get(key) ?? 0) + dt
    world.fragmentProgress.set(key, progress)
    world.activeFragmentTarget = {
      x: targetX,
      y: targetY,
      progress,
      duration,
      kind: fragment.kind,
    }

    player.desiredFacing = DIR_NONE

    if (progress < duration) return

    world.fragmentProgress.delete(key)
    world.activeFragmentTarget = null
    world.recipeFragmentSpawns = (world.recipeFragmentSpawns ?? []).filter(
      (spawn) => !(spawn.x === targetX && spawn.y === targetY),
    )
    if (!world.runFragments) world.runFragments = createEmptyFragmentBag()
    addFragmentToBag(world.runFragments, fragment)
    world.events.push('fragmentCollected')
  }
}
