import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
} from '../../src/config/constants.js'
import { CollisionSystem } from '../../src/game/systems/CollisionSystem.js'
import { BombSystem } from '../../src/game/systems/BombSystem.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'
import { PowerUpSystem } from '../../src/game/systems/PowerUpSystem.js'
import { InputSystem } from '../../src/game/systems/InputSystem.js'
import { ScoreSystem } from '../../src/game/systems/ScoreSystem.js'
import { GameLoop } from '../../src/game/GameLoop.js'
import { mockInput } from './worldFactory.js'

const collision = new CollisionSystem()
const bomb = new BombSystem()
const life = new LifeSystem()
const powerUp = new PowerUpSystem()
const input = new InputSystem()
const score = new ScoreSystem()
const gameLoop = new GameLoop()

export function stepCollision(world, dt, direction) {
  const player = world.player
  const prevFacing = player.desiredFacing
  if (direction !== undefined) player.desiredFacing = direction
  collision.update(world, dt)
  if (direction !== undefined) player.desiredFacing = prevFacing
}

export function stepBomb(world, dt) {
  bomb.update(world, dt)
}

export function stepLife(world, dt, scoreSystem = score) {
  life.update(world, dt, scoreSystem)
}

export function stepScore(world, dt, scoreSystem = score) {
  scoreSystem.update(world, dt)
}

export function createScoreSystem() {
  return new ScoreSystem()
}

export function stepGameLoop(world, dt, keys = {}) {
  return gameLoop.update(world, dt, mockInput(keys))
}

export function stepPowerUp(world) {
  powerUp.update(world)
}

export function stepInput(world, keys) {
  input.update(world, mockInput(keys))
}

export function explodeBomb(world, bombIndex = 0) {
  bomb.explode(world, world.bombs[bombIndex])
}

export { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT }
