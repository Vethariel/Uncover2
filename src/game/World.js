import { LEVELS } from '../config/levels.js'
import { LevelGenerator } from './level/LevelGenerator.js'
import { Enemy } from './entities/Enemy.js'
import { Player } from './entities/Player.js'
import {
  PLAYER_SIZE,
  PLAYER_SPEED,
  DIR_DOWN,
} from '../config/constants.js'
import { ENEMY_TYPES } from '../config/enemyTypes.js'
import { createEmptyResources } from '../config/miningTypes.js'
import { createEmptyFragmentBag } from '../config/crafting.js'
import { createPuzzleState, clonePuzzleReward } from '../config/puzzleTypes.js'
import { positionFromTile } from './entityTiles.js'
import { placeLevelNpcs } from './level/levelNpcs.js'

export class World {
  constructor(tileSize) {
    this.tileSize = tileSize
    this.grid = null
    this.terrainRegions = null
    this.player = null
    this.enemies = []
    this.bombs = []
    this.explosions = []
    this.pendingBlastWaves = []
    this.playerSpawn = null
    this.entryDoor = null
    this.exitDoor = null
    this.wallLightSpawns = []
    this.enemySpawns = []
    this.resourceSpawns = []
    this.recipeFragmentSpawns = []
    this.puzzleTablets = []
    this.puzzle = createPuzzleState()
    this.puzzleReward = null
    this.chest = null
    this.traps = []
    this.darts = []
    this.levelGraph = null
    this.levelTimer = null
    this.levelVisualConfig = null
    this.currentLevelIndex = 0
    this.gameOver = false
    this.gameWon = false
    this.trialTimeUp = false
    this.trialWastedScore = 0
    this.playerDeathTimer = 0
    this.visibleTiles = new Set()
    this.discoveredTiles = new Set()
    this.lightLevels = new Map()
    /** Luz suavizada (FogOfWarView) para tint de sprites alineado a la niebla. */
    this.displayedLightLevels = new Map()
    /** Luces por cuarto de muro [NW,NE,SW,SE], suavizadas. */
    this.displayedWallQuarters = new Map()
    this.lightDisplayRevision = 0
    this.visionViewport = null
    this.visionSourceSignature = ''
    this.visionRevision = 0
    this.tileAnimTimer = 0
    this.events = []
    this.runResources = createEmptyResources()
    this.runFragments = createEmptyFragmentBag()
    this.miningProgress = new Map()
    this.fragmentProgress = new Map()
    this.activeMiningTarget = null
    this.activeFragmentTarget = null
    this.pendingLevelSpec = null
    this.npcs = []
  }

  reset() {
    this.grid = null
    this.terrainRegions = null
    this.player = null
    this.enemies = []
    this.explosions = []
    this.pendingBlastWaves = []
    this.playerSpawn = null
    this.entryDoor = null
    this.exitDoor = null
    this.wallLightSpawns = []
    this.bombs = []
    this.gameOver = false
    this.gameWon = false
    this.trialTimeUp = false
    this.trialWastedScore = 0
    this.enemySpawns = []
    this.resourceSpawns = []
    this.recipeFragmentSpawns = []
    this.puzzleTablets = []
    this.puzzle = createPuzzleState()
    this.puzzleReward = null
    this.chest = null
    this.traps = []
    this.darts = []
    this.levelGraph = null
    this.levelTimer = null
    this.playerDeathTimer = 0
    this.visibleTiles = new Set()
    this.discoveredTiles = new Set()
    this.lightLevels = new Map()
    this.displayedLightLevels = new Map()
    this.displayedWallQuarters = new Map()
    this.lightDisplayRevision = 0
    this.visionViewport = null
    this.visionSourceSignature = ''
    this.visionRevision = 0
    this.tileAnimTimer = 0
    this.events = []
    this.miningProgress = new Map()
    this.fragmentProgress = new Map()
    this.activeMiningTarget = null
    this.activeFragmentTarget = null
    this.npcs = []

    const level = this.pendingLevelSpec
      ?? LEVELS[this.currentLevelIndex]
      ?? LEVELS[0]
    this.pendingLevelSpec = null
    LevelGenerator.generate(this, level)

    if (level.puzzle?.reward) {
      this.puzzleReward = clonePuzzleReward(level.puzzle.reward)
    }

    placeLevelNpcs(this, this.currentLevelIndex)

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
  }

  isLastLevel() {
    return this.currentLevelIndex >= LEVELS.length - 1
  }
}
