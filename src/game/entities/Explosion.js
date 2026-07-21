import { EXPLOSION_LIGHT } from '../systems/VisionSystem.js'

/** Duración de la animación del centro (9 frames). */
export const EXPLOSION_DURATION = 0.3
/** Aledaños: 7→9 + 1→9 = 12 frames al mismo ritmo de frame que el centro. */
export const EXPLOSION_ADJACENT_DURATION = EXPLOSION_DURATION * (12 / 9)

export class Explosion {
  constructor(tileX, tileY, size, kind = 'center', timer = EXPLOSION_DURATION) {
    this.tileX = tileX
    this.tileY = tileY
    this.kind = kind
    this.size = size
    this.posX = this.tileX * this.size
    this.posY = this.tileY * this.size
    this.animDuration = timer
    this.timer = timer
    this.type = 'explosion'
    this.lightEmission = EXPLOSION_LIGHT
  }
}
