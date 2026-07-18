import { Grid } from '../Grid.js'
import { Player } from '../entities/Player.js'
import {
  DIR_DOWN,
  PLAYER_SIZE,
  PLAYER_SPEED,
  TILE_EMPTY,
  TILE_WALL,
  TILE_SIZE,
} from '../../config/constants.js'
import { positionFromTile } from '../entityTiles.js'

const COLS = 20
const ROWS = 11

/**
 * Habitación rectangular del taller.
 * Horno 2×3 a la izquierda, yunque 2×3 a la derecha, puerta al norte.
 */
export function createWorkshopWorld(tileSize = TILE_SIZE) {
  const grid = new Grid(COLS, ROWS)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1
      grid.set(x, y, border ? TILE_WALL : TILE_EMPTY)
    }
  }

  const furnace = {
    id: 'furnace',
    label: 'HORNO',
    kind: 'furnace',
    tiles: fillRect(4, 3, 2, 3),
  }
  const anvil = {
    id: 'anvil',
    label: 'YUNQUE',
    kind: 'anvil',
    tiles: fillRect(14, 3, 2, 3),
  }

  for (const station of [furnace, anvil]) {
    for (const tile of station.tiles) {
      grid.set(tile.x, tile.y, TILE_WALL)
    }
  }

  // Puerta norte centrada (3 tiles de muro se abren como trigger frontal).
  const doorTiles = [
    { x: 9, y: 0 },
    { x: 10, y: 0 },
    { x: 11, y: 0 },
  ]
  for (const tile of doorTiles) grid.set(tile.x, tile.y, TILE_EMPTY)
  const exitDoor = {
    kind: 'exit',
    tiles: doorTiles,
    triggerTiles: [
      { x: 9, y: 1 },
      { x: 10, y: 1 },
      { x: 11, y: 1 },
    ],
    center: { x: 10, y: 0 },
  }

  const spawn = { x: 10, y: 8 }
  const playerPos = positionFromTile(spawn.x, spawn.y, tileSize, PLAYER_SIZE)
  const player = new Player(
    playerPos.posX,
    playerPos.posY,
    playerPos.tileX,
    playerPos.tileY,
    PLAYER_SPEED,
    PLAYER_SIZE,
    DIR_DOWN,
  )

  return {
    tileSize,
    grid,
    player,
    stations: [furnace, anvil],
    exitDoor,
    playerSpawn: spawn,
    bombs: [],
    enemies: [],
    explosions: [],
    events: [],
  }
}

function fillRect(x0, y0, w, h) {
  const tiles = []
  for (let y = y0; y < y0 + h; y++) {
    for (let x = x0; x < x0 + w; x++) {
      tiles.push({ x, y })
    }
  }
  return tiles
}

export function stationAt(world, x, y) {
  return world.stations.find((station) => (
    station.tiles.some((tile) => tile.x === x && tile.y === y)
  )) ?? null
}

export function interactTarget(world) {
  const player = world.player
  const dirs = [
    { x: 0, y: -1 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
  ]
  for (const dir of dirs) {
    const x = player.tileX + dir.x
    const y = player.tileY + dir.y
    const station = stationAt(world, x, y)
    if (station) return { type: 'station', station }
  }

  const onDoor = world.exitDoor.triggerTiles.some(
    (tile) => tile.x === player.tileX && tile.y === player.tileY,
  )
  if (onDoor) return { type: 'door' }

  return null
}
