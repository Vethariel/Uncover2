import { EnemyAISystem } from './systems/EnemyAISystem.js'
import { InputSystem } from './systems/InputSystem.js'
import { MiningSystem } from './systems/MiningSystem.js'
import { FragmentExtractSystem } from './systems/FragmentExtractSystem.js'
import { CollisionSystem } from './systems/CollisionSystem.js'
import { BombSystem } from './systems/BombSystem.js'
import { LifeSystem } from './systems/LifeSystem.js'
import { VisionSystem } from './systems/VisionSystem.js'
import { PuzzleSystem } from './systems/PuzzleSystem.js'
import { TrapSystem } from './systems/TrapSystem.js'
import { World } from './World.js'

export class GameLoop {
  constructor() {
    this.enemyAI = new EnemyAISystem()
    this.input = new InputSystem()
    this.mining = new MiningSystem()
    this.fragments = new FragmentExtractSystem()
    this.collision = new CollisionSystem()
    this.bomb = new BombSystem()
    this.life = new LifeSystem()
    this.traps = new TrapSystem(this.life)
    this.puzzle = new PuzzleSystem()
    this.vision = new VisionSystem()
  }

  createWorld(tileSize) {
    return new World(tileSize)
  }

  initialize(world) {
    this.vision.update(world)
  }

  update(world, dt, input) {
    this.input.update(world, input)
    this.mining.update(world, dt, input)
    this.fragments.update(world, dt, input)
    this.enemyAI.update(world, dt)
    this.collision.update(world, dt)
    this.puzzle.update(world, dt, input)
    this.bomb.update(world, dt)
    this.traps.update(world, dt)
    this.life.update(world, dt)
    this.vision.update(world, dt)

    return {
      events: world.events.splice(0),
      gameOver: world.gameOver,
      gameWon: world.gameWon,
      trialTimeUp: Boolean(world.trialTimeUp),
    }
  }
}
