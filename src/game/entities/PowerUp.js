export class PowerUp {
  constructor(tileX, tileY, size, kind) {
    this.tileX = tileX
    this.tileY = tileY
    this.kind = kind
    this.size = size
    this.posX = this.tileX * this.size
    this.posY = this.tileY * this.size
    this.type = 'powerup'
    this.alive = false
  }
}
