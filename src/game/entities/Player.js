import { DIR_DOWN, DIR_NONE, PLAYER_LIVES } from '../../config/constants.js'
import { HELMET_LIGHT } from '../systems/VisionSystem.js'

export class Player {
  constructor(posX, posY, tileX, tileY, speed, size, facing) {
    this.posX = posX
    this.posY = posY
    this.tileX = tileX
    this.tileY = tileY
    this.speed = speed
    this.baseSpeed = speed
    this.size = size
    this.facing = facing
    this.desiredFacing = DIR_NONE
    this.type = 'player'
    this.lightEmission = HELMET_LIGHT
    this.maxBombs = 1
    this.activeBombs = 0
    this.bombRange = 1
    this.lives = PLAYER_LIVES
    this.maxLives = PLAYER_LIVES
    this.pickSpeed = 0
    this.fortune = 0
    this.alive = true
    this.invulnerableTimer = 0
  }
}
