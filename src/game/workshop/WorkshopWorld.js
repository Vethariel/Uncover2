import { Grid } from '../Grid.js'
import { Player } from '../entities/Player.js'
import { Furnace } from '../entities/Furnace.js'
import { Anvil } from '../entities/Anvil.js'
import {
  DIR_DOWN,
  PLAYER_SIZE,
  PLAYER_SPEED,
  TILE_EMPTY,
  TILE_WALL,
  TILE_SIZE,
} from '../../config/constants.js'
import {
  ANVIL_FRAME_H,
  ANVIL_FRAME_W,
  FURNACE_FRAME_H,
  FURNACE_FRAME_W,
} from '../../config/workshopProps.js'
import { positionFromTile } from '../entityTiles.js'

// Habitación compacta (antes 20×11 = viewport entero).
const COLS = 12
const ROWS = 8

/** Esquina superior izquierda del sprite (px, tamaño nativo). */
const FURNACE_ORIGIN = { x: 2 * TILE_SIZE, y: 1 * TILE_SIZE }
const ANVIL_ORIGIN = { x: 7 * TILE_SIZE, y: 1 * TILE_SIZE }

/**
 * Habitación rectangular del taller.
 * Horno y yunque = entidades con body 3×3 (+ sprites nativos); puerta al sur.
 */
export function createWorkshopWorld(tileSize = TILE_SIZE, options = {}) {
  const grid = new Grid(COLS, ROWS)
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const border = x === 0 || y === 0 || x === COLS - 1 || y === ROWS - 1
      grid.set(x, y, border ? TILE_WALL : TILE_EMPTY)
    }
  }

  const furnaceOrigin = {
    x: (FURNACE_ORIGIN.x / TILE_SIZE) * tileSize,
    y: (FURNACE_ORIGIN.y / TILE_SIZE) * tileSize,
  }
  const furnace = new Furnace({
    tileX: Math.floor((furnaceOrigin.x + FURNACE_FRAME_W / 2) / tileSize),
    tileY: Math.floor((furnaceOrigin.y + FURNACE_FRAME_H / 2) / tileSize),
    originX: furnaceOrigin.x,
    originY: furnaceOrigin.y,
    width: FURNACE_FRAME_W,
    height: FURNACE_FRAME_H,
    bodySize: 3,
  })

  const anvilOrigin = {
    x: (ANVIL_ORIGIN.x / TILE_SIZE) * tileSize,
    y: (ANVIL_ORIGIN.y / TILE_SIZE) * tileSize,
  }
  const anvil = new Anvil({
    tileX: Math.floor((anvilOrigin.x + ANVIL_FRAME_W / 2) / tileSize),
    tileY: Math.floor((anvilOrigin.y + ANVIL_FRAME_H / 2) / tileSize),
    originX: anvilOrigin.x,
    originY: anvilOrigin.y,
    width: ANVIL_FRAME_W,
    height: ANVIL_FRAME_H,
    bodySize: 3,
  })

  // Puerta sur centrada. Al pisar su trigger interior se sale automáticamente.
  const doorTiles = [
    { x: 5, y: ROWS - 1 },
    { x: 6, y: ROWS - 1 },
    { x: 7, y: ROWS - 1 },
  ]
  for (const tile of doorTiles) grid.set(tile.x, tile.y, TILE_EMPTY)
  const exitDoor = {
    kind: 'exit',
    tiles: doorTiles,
    triggerTiles: [
      { x: 5, y: ROWS - 2 },
      { x: 6, y: ROWS - 2 },
      { x: 7, y: ROWS - 2 },
    ],
    center: { x: 6, y: ROWS - 1 },
  }

  const spawn = { x: 6, y: 5 }
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

  const npcs = [
    {
      id: 'brun',
      label: 'BRUN',
      kind: 'smith',
      tile: { x: 2, y: 5 },
      color: 0xc77b3f,
    },
  ]
  if (options.excavatorInHub) {
    npcs.push({
      id: 'excavator',
      label: 'EXCAVADOR',
      kind: 'excavator',
      tile: { x: 10, y: 4 },
      color: 0x6b7a88,
    })
  }

  // Bloquean movimiento; se habla desde un tile adyacente (interactTarget).
  for (const npc of npcs) {
    grid.set(npc.tile.x, npc.tile.y, TILE_WALL)
  }

  return {
    tileSize,
    grid,
    player,
    stations: [furnace, anvil],
    npcs,
    exitDoor,
    playerSpawn: spawn,
    bombs: [],
    enemies: [],
    explosions: [],
    events: [],
  }
}

export function stationAt(world, x, y) {
  return world.stations.find((station) => {
    if (station.tileX === x && station.tileY === y) return true
    if (station.tile?.x === x && station.tile?.y === y) return true
    return station.tiles?.some((tile) => tile.x === x && tile.y === y) ?? false
  }) ?? null
}

export function npcAt(world, x, y) {
  return (world.npcs ?? []).find((npc) => npc.tile.x === x && npc.tile.y === y) ?? null
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
    const npc = npcAt(world, x, y)
    if (npc) return { type: 'npc', npc }
  }

  const onDoor = world.exitDoor.triggerTiles.some(
    (tile) => tile.x === player.tileX && tile.y === player.tileY,
  )
  if (onDoor) return { type: 'door' }

  return null
}
