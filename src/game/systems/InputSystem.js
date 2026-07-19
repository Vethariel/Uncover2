import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_NONE,
  TILE_DESTRUCTIBLE,
  TILE_PASS,
} from '../../config/constants.js'
import { isExtractingFragment } from './FragmentExtractSystem.js'

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

function isMiningDestructible(world, player) {
  const vec = facingVector(player.facing)
  const x = player.tileX + vec.x
  const y = player.tileY + vec.y
  if (!world.grid.inBounds(x, y)) return false
  return world.grid.get(x, y) === TILE_DESTRUCTIBLE
}

export class InputSystem {
  update(world, input) {
    const player = world.player
    if (player.alive) {
      this.handlePlayerInput(world, player, input)
    }
  }

  handlePlayerInput(world, player, input) {
    if (player.hurtAnimationTimer > 0 || player.bombPlacement) {
      player.desiredFacing = DIR_NONE
      return
    }

    const mining = input.isDown('mine') && isMiningDestructible(world, player)
    const extracting = isExtractingFragment(world, player, input)

    let direction = DIR_NONE
    if (!mining && !extracting) {
      if (input.isDown('left')) direction = DIR_LEFT
      else if (input.isDown('right')) direction = DIR_RIGHT
      else if (input.isDown('up')) direction = DIR_UP
      else if (input.isDown('down')) direction = DIR_DOWN
    }

    if (direction !== DIR_NONE) world.events.push('playerWalk')

    player.facing = direction === DIR_NONE ? player.facing : direction
    player.desiredFacing = direction

    if (input.isJustDown('bomb')) {
      this.tryPlaceBomb(world, player)
    }
  }

  tryPlaceBomb(world, player) {
    if (player.activeBombs >= player.maxBombs) return

    const tileX = player.tileX
    const tileY = player.tileY

    if (world.grid.get(tileX, tileY) === TILE_PASS) return
    if (this.bombExists(world, tileX, tileY)) return

    player.desiredFacing = DIR_NONE
    player.bombPlacement = {
      elapsed: 0,
      tileX,
      tileY,
      spawned: false,
    }
  }

  bombExists(world, tileX, tileY) {
    return world.bombs.some((bomb) => bomb.tileX === tileX && bomb.tileY === tileY)
  }
}
