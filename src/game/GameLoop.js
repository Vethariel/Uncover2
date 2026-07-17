import { EnemyAISystem } from './systems/EnemyAISystem.js'
import { InputSystem } from './systems/InputSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { BombSystem } from './systems/BombSystem.js'
import { LifeSystem } from './systems/LifeSystem.js'
import { ScoreSystem } from './systems/ScoreSystem.js'
import { World } from './World.js'

export class GameLoop {
  constructor() {
    this.enemyAI = new EnemyAISystem()
    this.input = new InputSystem()
    this.collision = new CollisionSystem()
    this.bomb = new BombSystem()
    this.life = new LifeSystem()
    this.score = new ScoreSystem()
  }

  createWorld(tileSize) {
    return new World(tileSize)
  }

  update(world, dt, input) {
    this.input.update(world, input)
    this.enemyAI.update(world, dt)
    this.collision.update(world, dt)
    this.bomb.update(world, dt)
    this.life.update(world, dt, this.score)
    this.score.update(world, dt)

    return {
      events: world.events.splice(0),
      gameOver: world.gameOver,
      gameWon: world.gameWon,
    }
  }
}
