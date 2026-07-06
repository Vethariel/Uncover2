import { LEVELS } from '../config/levels.js'
import { LevelLoader } from './level/LevelLoader.js'
import { Enemy } from './entities/Enemy.js'
import { Player } from './entities/Player.js'
import { Portal } from './entities/Portal.js'
import {
  ENEMY_SIZE,
  PLAYER_SIZE,
  PLAYER_SPEED,
  DIR_DOWN,
  LEVEL_TIMER,
} from '../config/constants.js'
import { ENEMY_TYPES } from '../config/enemyTypes.js'

export class World {
  constructor(tileSize) {
    this.tileSize = tileSize
    this.grid = null
    this.player = null
    this.enemies = []
    this.bombs = []
    this.explosions = []
    this.playerSpawn = null
    this.portalSpawn = null
    this.enemySpawns = []
    this.powerUps = {}
    this.portal = null
    this.scorePopups = []
    this.levelVisualConfig = null
    this.currentLevelIndex = 0
    this.levelTimer = LEVEL_TIMER
    this.timeUp = false
    this.gameOver = false
    this.gameWon = false
    this.respawnTimer = 0
    this.tileAnimTimer = 0
    this.events = []
  }

  reset(assets) {
    this.grid = null
    this.player = null
    this.enemies = []
    this.explosions = []
    this.playerSpawn = null
    this.portalSpawn = null
    this.bombs = []
    this.levelTimer = LEVEL_TIMER
    this.timeUp = false
    this.scorePopups = []
    this.gameOver = false
    this.gameWon = false
    this.portal = null
    this.enemySpawns = []
    this.powerUps = {}
    this.tileAnimTimer = 0
    this.events = []

    const level = LEVELS[this.currentLevelIndex]
    if (level.type === 'tmj') {
      const tmj = assets.getTMJ(level.data)
      const tsj = assets.getTSJ(level.data)
      LevelLoader.loadTMJ(this, tmj, tsj, level.data)
    }

    const spawn = this.playerSpawn
    this.player = new Player(
      spawn.x * this.tileSize + (this.tileSize - PLAYER_SIZE) / 2,
      spawn.y * this.tileSize + (this.tileSize - PLAYER_SIZE) / 2,
      spawn.x,
      spawn.y,
      PLAYER_SPEED,
      PLAYER_SIZE,
      DIR_DOWN,
    )

    for (const enemySpawn of this.enemySpawns) {
      const config = ENEMY_TYPES[enemySpawn.kind]
      if (!config) continue

      this.enemies.push(
        new Enemy(
          enemySpawn.x * this.tileSize + (this.tileSize - ENEMY_SIZE) / 2,
          enemySpawn.y * this.tileSize + (this.tileSize - ENEMY_SIZE) / 2,
          enemySpawn.x,
          enemySpawn.y,
          config,
        ),
      )
    }

    this.spawnPortal()
  }

  spawnPortal() {
    if (!this.portalSpawn) return

    this.portal = new Portal(this.portalSpawn.x, this.portalSpawn.y, this.tileSize)
  }

  isLastLevel() {
    return this.currentLevelIndex >= LEVELS.length - 1
  }
}
