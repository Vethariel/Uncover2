import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_NONE,
  DIR_RIGHT,
  DIR_UP,
} from '../../config/constants.js'
import { CollisionSystem } from '../systems/CollisionSystem.js'
import { interactTarget } from './WorkshopWorld.js'

export class WorkshopLoop {
  constructor() {
    this.collision = new CollisionSystem()
  }

  update(world, dt, input) {
    const player = world.player
    if (!player?.alive) return { interact: null, focus: null }

    let direction = DIR_NONE
    if (input.isDown('left')) direction = DIR_LEFT
    else if (input.isDown('right')) direction = DIR_RIGHT
    else if (input.isDown('up')) direction = DIR_UP
    else if (input.isDown('down')) direction = DIR_DOWN

    player.facing = direction === DIR_NONE ? player.facing : direction
    player.desiredFacing = direction
    this.collision.update(world, dt)

    const focus = interactTarget(world)
    let interact = null
    if (focus?.type === 'door') {
      interact = focus
    } else if (input.isJustDown('interact') && focus?.type === 'station') {
      interact = focus
    }

    return { interact, focus }
  }
}
