import { GameLoop } from './GameLoop.js'

export class GameController {
  constructor() {
    this.loop = new GameLoop()
  }

  createWorld(tileSize, levelIndex) {
    const world = this.loop.createWorld(tileSize)
    world.currentLevelIndex = levelIndex
    world.reset()
    return world
  }

  update(world, dt, input) {
    return this.loop.update(world, dt, input)
  }
}
