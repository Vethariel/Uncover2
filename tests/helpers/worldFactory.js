import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
  TILE_PASS,
  TILE_SIZE,
  PLAYER_SIZE,
  PLAYER_SPEED,
  DIR_DOWN,
} from '../../src/config/constants.js'
import { Grid } from '../../src/game/Grid.js'
import { World } from '../../src/game/World.js'
import { Player } from '../../src/game/entities/Player.js'
import { Enemy } from '../../src/game/entities/Enemy.js'
import { Portal } from '../../src/game/entities/Portal.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { Bomb } from '../../src/game/entities/Bomb.js'
import { positionFromTile } from '../../src/game/entityTiles.js'
import { ENEMY_TYPES } from '../../src/config/enemyTypes.js'

const TILE_CHARS = {
  '.': TILE_EMPTY,
  '#': TILE_WALL,
  D: TILE_DESTRUCTIBLE,
  P: TILE_PASS,
}

/** Construye un mundo mínimo desde un mapa ASCII (sin assets Tiled). */
export function createTestWorld(rows, options = {}) {
  const world = new World(TILE_SIZE)
  const cols = rows[0].length

  world.grid = new Grid(cols, rows.length)
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < cols; x++) {
      const ch = rows[y][x]
      world.grid.set(x, y, TILE_CHARS[ch] ?? TILE_EMPTY)
    }
  }

  world.bombs = []
  world.explosions = []
  world.enemies = []
  world.events = []
  world.currentLevelIndex = 0
  world.gameOver = false
  world.gameWon = false
  world.respawnTimer = 0

  const spawn = options.playerSpawn ?? findFirstTile(world, TILE_EMPTY) ?? { x: 1, y: 1 }
  world.playerSpawn = spawn
  world.player = spawnPlayer(spawn)

  if (options.player) {
    Object.assign(world.player, options.player)
  }

  if (options.enemies) {
    for (const e of options.enemies) {
      world.enemies.push(spawnEnemy(e.x, e.y, e.kind ?? 'golem_basic'))
    }
  }

  if (options.portal) {
    world.portal = new Portal(options.portal.x, options.portal.y, TILE_SIZE)
    world.portal.visible = options.portal.visible ?? false
  }

  if (options.bombs) {
    for (const b of options.bombs) {
      const bomb = new Bomb(b.x, b.y, TILE_SIZE, world.player, b.range ?? 1, b.timer ?? 2.5)
      if (b.passThrough === false) bomb.passThrough = false
      world.bombs.push(bomb)
      world.player.activeBombs++
    }
  }

  if (options.explosions) {
    for (const e of options.explosions) {
      world.explosions.push(new Explosion(e.x, e.y, TILE_SIZE, e.kind ?? 'center', e.timer ?? 0.3))
    }
  }

  return world
}

function findFirstTile(world, tile) {
  for (let y = 0; y < world.grid.rows; y++) {
    for (let x = 0; x < world.grid.cols; x++) {
      if (world.grid.get(x, y) === tile) return { x, y }
    }
  }
  return null
}

export function spawnPlayer(tile) {
  const pos = positionFromTile(tile.x, tile.y, TILE_SIZE, PLAYER_SIZE)
  return new Player(
    pos.posX,
    pos.posY,
    pos.tileX,
    pos.tileY,
    PLAYER_SPEED,
    PLAYER_SIZE,
    DIR_DOWN,
  )
}

export function spawnEnemy(tileX, tileY, kind = 'golem_basic') {
  const config = ENEMY_TYPES[kind]
  const pos = positionFromTile(tileX, tileY, TILE_SIZE, config.size)
  return new Enemy(pos.posX, pos.posY, pos.tileX, pos.tileY, config)
}

/** Input falso para InputSystem. */
export function mockInput(keys = {}) {
  const held = new Set(keys.held ?? [])
  const justDown = new Set(keys.justDown ?? [])

  return {
    isDown(key) {
      return held.has(key)
    },
    isJustDown(key) {
      return justDown.has(key)
    },
  }
}
