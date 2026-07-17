import { BOMB_LIGHT } from '../systems/VisionSystem.js'

export class Bomb {
  constructor(tileX, tileY, size, owner, range = 1, timer = 2.5) {
    this.tileX = tileX
    this.tileY = tileY
    this.size = size
    this.posX = this.tileX * this.size
    this.posY = this.tileY * this.size
    this.timer = timer
    this.owner = owner
    this.range = range
    this.passThrough = true
    this.type = 'bomb'
    this.lightEmission = BOMB_LIGHT
  }
}
