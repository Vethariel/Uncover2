import { EXPLOSION_LIGHT } from '../systems/VisionSystem.js'

export class Explosion {
  constructor(tileX, tileY, size, kind = 'center', timer = 0.3) {
    this.tileX = tileX
    this.tileY = tileY
    this.kind = kind
    this.size = size
    this.posX = this.tileX * this.size
    this.posY = this.tileY * this.size
    this.timer = timer
    this.type = 'explosion'
    this.lightEmission = EXPLOSION_LIGHT
  }
}
