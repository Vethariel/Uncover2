import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_NONE,
  TILE_PASS,
} from '../../config/constants.js'
import { Bomb } from '../entities/Bomb.js'

export class InputSystem {
  update(world, input) {
    const player = world.player
    if (player.alive) {
      this.handlePlayerInput(world, player, input)
    }
  }

  handlePlayerInput(world, player, input) {
    let direction = DIR_NONE

    if (input.isDown('left')) direction = DIR_LEFT
    else if (input.isDown('right')) direction = DIR_RIGHT
    else if (input.isDown('up')) direction = DIR_UP
    else if (input.isDown('down')) direction = DIR_DOWN

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

    world.bombs.push(new Bomb(tileX, tileY, world.tileSize, player, player.bombRange))
    player.activeBombs++
    world.events.push('bombPlace')
  }

  bombExists(world, tileX, tileY) {
    return world.bombs.some((bomb) => bomb.tileX === tileX && bomb.tileY === tileY)
  }
}
