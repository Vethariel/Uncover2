import { LEVELS } from "../levels/levels.js"
import { LevelLoader } from "../world/levelLoader.js"
import { Enemy } from "../entities/enemy.js"
import { Player } from "../entities/player.js"
import { Portal } from "../entities/portal.js"
import { ENEMY_SIZE, ENEMY_SPEED, PLAYER_SIZE, PLAYER_SPEED, DIR_DOWN, LEVEL_TIMER } from "../config/constants.js"
import { ENEMY_TYPES } from "../config/enemyTypes.js"

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

    const levels = LEVELS[this.currentLevelIndex]
    if (levels.type === "tmj") {
      const tmj = assets.getTMJ(levels.data)
      const tsj = assets.getTSJ(levels.data)
      LevelLoader.loadTMJ(this, tmj, tsj, levels.data)
    } else {
      LevelLoader.loadLegacy(this, levels.data)
    }

    const spawn = this.playerSpawn

    const player = new Player(
      spawn.x * this.tileSize + (this.tileSize - PLAYER_SIZE) / 2,
      spawn.y * this.tileSize + (this.tileSize - PLAYER_SIZE) / 2,
      spawn.x,
      spawn.y,
      PLAYER_SPEED,
      PLAYER_SIZE,
      DIR_DOWN
    )

    this.player = player

    for (const spawn of this.enemySpawns) {
      const config = ENEMY_TYPES[spawn.kind]
      const enemy = new Enemy(
        spawn.x * this.tileSize + (this.tileSize - ENEMY_SIZE) / 2,
        spawn.y * this.tileSize + (this.tileSize - ENEMY_SIZE) / 2,
        spawn.x,
        spawn.y,
        config
      )

      this.enemies.push(enemy)

    }

    this.spawnPortal()

  }

  spawnPortal() {

    if (!this.portalSpawn) return
    
    const portal = new Portal(
      this.portalSpawn.x,
      this.portalSpawn.y,
      this.tileSize
    )

    this.portal = portal

  }

  isLastLevel() {
    return this.currentLevelIndex >= LEVELS.length - 1
  }

}