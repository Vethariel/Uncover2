import { LEVELS } from '../config/levels.js'
import { GameLoop } from './GameLoop.js'

export class GameController {
  constructor() {
    this.loop = new GameLoop()
  }

  createWorld(tileSize, levelIndex, options = {}) {
    const world = this.loop.createWorld(tileSize)
    world.currentLevelIndex = levelIndex
    const base = LEVELS[levelIndex] ?? LEVELS[0]
    world.pendingLevelSpec = {
      ...base,
      ...(options.levelSpec ?? {}),
    }
    world.reset()
    this.loop.initialize(world)
    return world
  }

  update(world, dt, input) {
    return this.loop.update(world, dt, input)
  }
}
