import {
  PLAYER_VISION_RADIUS,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../config/constants.js'

const HELMET_LIGHT = 3
const EXPLOSION_LIGHT = 2
const WALL_LIGHT = 4
const MAX_LIGHT = 5

const CARDINAL_DIRECTIONS = [
  { x: 1, y: 0, id: 'east' },
  { x: -1, y: 0, id: 'west' },
  { x: 0, y: 1, id: 'south' },
  { x: 0, y: -1, id: 'north' },
]

function tileKey(x, y) {
  return `${x},${y}`
}

function isOpaque(tile) {
  return tile === TILE_WALL || tile === TILE_DESTRUCTIBLE
}

function addLight(levels, x, y, amount) {
  const key = tileKey(x, y)
  levels.set(key, Math.min(MAX_LIGHT, (levels.get(key) ?? 0) + amount))
}

function shouldStartSource(player, sourceX, sourceY, strength) {
  const dist = Math.abs(sourceX - player.tileX) + Math.abs(sourceY - player.tileY)
  return dist <= PLAYER_VISION_RADIUS + strength
}

function propagateSource(world, levels, startX, startY, strength) {
  const { grid, player } = world
  if (!grid.inBounds(startX, startY)) return
  if (!shouldStartSource(player, startX, startY, strength)) return

  const queue = [{ x: startX, y: startY, direction: null, intensity: strength }]
  const best = new Map()

  while (queue.length > 0) {
    const current = queue.shift()
    const distanceToPlayer = Math.abs(current.x - player.tileX) + Math.abs(current.y - player.tileY)

    const stateKey = `${current.x},${current.y},${current.direction ?? 'origin'}`
    if ((best.get(stateKey) ?? -1) >= current.intensity) continue
    best.set(stateKey, current.intensity)

    if (distanceToPlayer <= PLAYER_VISION_RADIUS) {
      addLight(levels, current.x, current.y, current.intensity)
    }

    if (current.intensity <= 1 || isOpaque(grid.get(current.x, current.y))) continue

    for (const nextDirection of CARDINAL_DIRECTIONS) {
      const nx = current.x + nextDirection.x
      const ny = current.y + nextDirection.y
      if (!grid.inBounds(nx, ny)) continue

      let nextIntensity = current.intensity
      if (current.direction && current.direction !== nextDirection.id) {
        nextIntensity = Math.floor(nextIntensity * 0.5)
      }
      nextIntensity -= 1
      if (nextIntensity <= 0) continue

      queue.push({
        x: nx,
        y: ny,
        direction: nextDirection.id,
        intensity: nextIntensity,
      })
    }
  }
}

function levelsSignature(levels) {
  return [...levels.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`)
    .join('|')
}

export class VisionSystem {
  update(world) {
    const { grid, player } = world
    if (!grid || !player) return

    const lightLevels = new Map()

    propagateSource(world, lightLevels, player.tileX, player.tileY, HELMET_LIGHT)

    for (const explosion of world.explosions) {
      propagateSource(world, lightLevels, explosion.tileX, explosion.tileY, EXPLOSION_LIGHT)
    }

    for (const light of world.wallLightSpawns ?? []) {
      propagateSource(world, lightLevels, light.x, light.y, WALL_LIGHT)
    }

    const visible = new Set()
    for (const [cellKey, level] of lightLevels) {
      if (level <= 0) continue
      visible.add(cellKey)
    }

    const signature = levelsSignature(lightLevels)
    let changed = signature !== world.visionSignature
    world.lightLevels = lightLevels
    world.visibleTiles = visible
    world.visionSignature = signature
    for (const cellKey of visible) {
      if (!world.discoveredTiles.has(cellKey)) changed = true
      world.discoveredTiles.add(cellKey)
    }
    if (changed) world.visionRevision++
  }
}
