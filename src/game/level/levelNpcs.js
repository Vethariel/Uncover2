import { TILE_EMPTY, DIR_DOWN, DIR_LEFT, DIR_RIGHT, DIR_UP } from '../../config/constants.js'
import { HELMET_LIGHT } from '../systems/VisionSystem.js'

/** Índice 0-based de N7 — El Primer Excavador. */
export const PRIMER_EXCAVADOR_LEVEL_INDEX = 6

/**
 * Coloca NPCs de nivel tras generar el mapa.
 * El Excavador aparece en N7 al frente de la puerta de entrada,
 * en un tile vacío lateral (no el de la caminata intro del jugador).
 */
export function placeLevelNpcs(world, levelIndex) {
  world.npcs = []
  if (levelIndex === PRIMER_EXCAVADOR_LEVEL_INDEX) {
    placePrimerExcavadorAtEntry(world)
  }
}

function placePrimerExcavadorAtEntry(world) {
  const door = world.entryDoor
  if (!door) return

  const walkTarget = entryWalkTarget(door)
  const tile = pickBesideWalkTarget(world, door, walkTarget)
  if (!tile) return

  world.npcs.push({
    id: 'excavator',
    label: 'EXCAVADOR',
    kind: 'excavator',
    tile: { x: tile.x, y: tile.y },
    color: 0x6b7a88,
    // Misma linterna que el viajero (casco + cono).
    lightEmission: HELMET_LIGHT,
    facing: facingIntoRoom(door.orientation),
  })
}

/** Mismo criterio que GameScene: centro de frontTiles / un paso hacia dentro. */
export function entryWalkTarget(door) {
  if (!door) return null
  const front = door.frontTiles
  if (front?.length) return front[Math.floor(front.length / 2)]
  const trigger = door.trigger ?? door.triggerTiles?.[0]
  if (!trigger) return null
  switch (door.orientation) {
    case 'north': return { x: trigger.x, y: trigger.y + 1 }
    case 'south': return { x: trigger.x, y: trigger.y - 1 }
    case 'west': return { x: trigger.x + 1, y: trigger.y }
    case 'east': return { x: trigger.x - 1, y: trigger.y }
    default: return null
  }
}

function pickBesideWalkTarget(world, door, walkTarget) {
  const grid = world.grid
  const isFree = (t) => (
    t
    && grid.inBounds(t.x, t.y)
    && grid.get(t.x, t.y) === TILE_EMPTY
    && !(walkTarget && t.x === walkTarget.x && t.y === walkTarget.y)
  )

  // Preferir laterales de la fila frontal de la puerta (al lado del intro).
  const fronts = door.frontTiles ?? []
  for (const tile of fronts) {
    if (isFree(tile)) return tile
  }

  if (!walkTarget) return null

  // Fallback: vecinos perpendiculares al inward, junto al tile de caminata.
  const inward = inwardVector(door.orientation)
  const perp = { x: -inward.y, y: inward.x }
  for (const sign of [1, -1]) {
    const candidate = {
      x: walkTarget.x + perp.x * sign,
      y: walkTarget.y + perp.y * sign,
    }
    if (isFree(candidate)) return candidate
  }

  return null
}

function inwardVector(orientation) {
  switch (orientation) {
    case 'north': return { x: 0, y: 1 }
    case 'south': return { x: 0, y: -1 }
    case 'west': return { x: 1, y: 0 }
    case 'east': return { x: -1, y: 0 }
    default: return { x: 0, y: 0 }
  }
}

function facingIntoRoom(orientation) {
  switch (orientation) {
    case 'north': return DIR_DOWN
    case 'south': return DIR_UP
    case 'west': return DIR_RIGHT
    case 'east': return DIR_LEFT
    default: return DIR_DOWN
  }
}
