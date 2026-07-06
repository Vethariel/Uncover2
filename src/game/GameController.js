import { GameLoop } from './GameLoop.js'

export class GameController {
  constructor() {
    this.loop = new GameLoop()
  }

  createWorld(tileSize, levelIndex, assets) {
    const world = this.loop.createWorld(tileSize)
    world.currentLevelIndex = levelIndex
    world.reset(assets)
    return world
  }

  update(world, dt, input) {
    return this.loop.update(world, dt, input)
  }
}
