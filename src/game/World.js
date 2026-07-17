import { LEVELS } from '../config/levels.js'
import { LevelGenerator } from './level/LevelGenerator.js'
import { Enemy } from './entities/Enemy.js'
import { Player } from './entities/Player.js'
import { Portal } from './entities/Portal.js'
import {
  PLAYER_SIZE,
  PLAYER_SPEED,
  DIR_DOWN,
} from '../config/constants.js'
import { ENEMY_TYPES } from '../config/enemyTypes.js'
import { positionFromTile } from './entityTiles.js'

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
    this.portal = null
    this.scorePopups = []
    this.levelVisualConfig = null
    this.currentLevelIndex = 0
    this.gameOver = false
    this.gameWon = false
    this.respawnTimer = 0
    this.tileAnimTimer = 0
    this.events = []
  }

  reset() {
    this.grid = null
    this.player = null
    this.enemies = []
    this.explosions = []
    this.playerSpawn = null
    this.portalSpawn = null
    this.bombs = []
    this.scorePopups = []
    this.gameOver = false
    this.gameWon = false
    this.portal = null
    this.enemySpawns = []
    this.tileAnimTimer = 0
    this.events = []

    const level = LEVELS[this.currentLevelIndex] ?? LEVELS[0]
    LevelGenerator.generate(this, level)

    const spawn = this.playerSpawn
    const playerPos = positionFromTile(spawn.x, spawn.y, this.tileSize, PLAYER_SIZE)
    this.player = new Player(
      playerPos.posX,
      playerPos.posY,
      playerPos.tileX,
      playerPos.tileY,
      PLAYER_SPEED,
      PLAYER_SIZE,
      DIR_DOWN,
    )

    for (const enemySpawn of this.enemySpawns) {
      const config = ENEMY_TYPES[enemySpawn.kind]
      if (!config) continue

      const enemyPos = positionFromTile(enemySpawn.x, enemySpawn.y, this.tileSize, config.size)
      this.enemies.push(
        new Enemy(enemyPos.posX, enemyPos.posY, enemyPos.tileX, enemyPos.tileY, config),
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
