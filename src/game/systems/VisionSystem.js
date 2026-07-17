import {
  PLAYER_VISION_RADIUS,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
} from '../../config/constants.js'

const HELMET_LIGHT = 7
const BOMB_LIGHT = 2
const ENEMY_LIGHT = 2
const ENRAGED_SPIRIT_LIGHT = 5
const EXPLOSION_LIGHT = 5
const WALL_LIGHT = 10
const MAX_LIGHT = 10

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
  const dist = Math.hypot(sourceX - player.tileX, sourceY - player.tileY)
  return dist <= PLAYER_VISION_RADIUS + strength - 1
}

function hasLineOfSight(grid, startX, startY, targetX, targetY) {
  let x = startX
  let y = startY
  const dx = Math.abs(targetX - startX)
  const dy = Math.abs(targetY - startY)
  const stepX = startX < targetX ? 1 : -1
  const stepY = startY < targetY ? 1 : -1
  let error = dx - dy

  while (x !== targetX || y !== targetY) {
    const doubledError = error * 2
    if (doubledError > -dy) {
      error -= dy
      x += stepX
    }
    if (doubledError < dx) {
      error += dx
      y += stepY
    }

    if (x === targetX && y === targetY) return true
    if (isOpaque(grid.get(x, y))) return false
  }

  return true
}

function propagateSource(world, levels, startX, startY, strength) {
  const { grid, player } = world
  if (!grid.inBounds(startX, startY)) return
  if (!shouldStartSource(player, startX, startY, strength)) return

  const radius = strength - 1
  for (let y = startY - radius; y <= startY + radius; y++) {
    for (let x = startX - radius; x <= startX + radius; x++) {
      if (!grid.inBounds(x, y)) continue

      const sourceDistance = Math.ceil(Math.hypot(x - startX, y - startY))
      const intensity = strength - sourceDistance
      if (intensity <= 0) continue

      const playerDistance = Math.hypot(x - player.tileX, y - player.tileY)
      if (playerDistance > PLAYER_VISION_RADIUS) continue
      if (!hasLineOfSight(grid, startX, startY, x, y)) continue

      addLight(levels, x, y, intensity)
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

    for (const bomb of world.bombs) {
      propagateSource(world, lightLevels, bomb.tileX, bomb.tileY, BOMB_LIGHT)
    }

    for (const enemy of world.enemies) {
      if (!enemy.alive) continue
      const strength = enemy.kind === 'spirit' && enemy.aggressive
        ? ENRAGED_SPIRIT_LIGHT
        : ENEMY_LIGHT
      propagateSource(world, lightLevels, enemy.tileX, enemy.tileY, strength)
    }

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
