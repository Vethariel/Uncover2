import { EnemyAISystem } from './systems/EnemyAISystem.js'
import { InputSystem } from './systems/InputSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { BombSystem } from './systems/BombSystem.js'
import { LifeSystem } from './systems/LifeSystem.js'
import { World } from './World.js'

export class GameLoop {
  constructor() {
    this.enemyAI = new EnemyAISystem()
    this.input = new InputSystem()
    this.collision = new CollisionSystem()
    this.bomb = new BombSystem()
    this.life = new LifeSystem()
  }

  createWorld(tileSize) {
    return new World(tileSize)
  }

  update(world, dt, input) {
    this.input.update(world, input)
    this.enemyAI.update(world, dt)
    this.collision.update(world, dt)
    this.bomb.update(world, dt)
    this.life.update(world, dt)

    return {
      events: world.events.splice(0),
      gameOver: world.gameOver,
      gameWon: world.gameWon,
    }
  }
}
