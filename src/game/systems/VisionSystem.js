import {
  PLAYER_VISION_RADIUS,
  TILE_DESTRUCTIBLE,
  TILE_WALL,
  VIEW_TILES_X,
  VIEW_TILES_Y,
} from '../../config/constants.js'

export const HELMET_LIGHT = 7
export const BOMB_LIGHT = 2
export const ENEMY_LIGHT = 2
export const ENRAGED_SPIRIT_LIGHT = 5
export const EXPLOSION_LIGHT = 5
export const WALL_LIGHT = 10
export const MAX_LIGHT = 10

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

function sourceCanAffectViewport(sourceX, sourceY, strength, viewport) {
  const radius = strength - 1
  return !(
    sourceX + radius < viewport.minX
    || sourceX - radius > viewport.maxX
    || sourceY + radius < viewport.minY
    || sourceY - radius > viewport.maxY
  )
}

function shouldStartSource(player, sourceX, sourceY, strength, viewport) {
  const dist = Math.hypot(sourceX - player.tileX, sourceY - player.tileY)
  if (dist > PLAYER_VISION_RADIUS + strength - 1) return false
  return sourceCanAffectViewport(sourceX, sourceY, strength, viewport)
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

function propagateSource(world, levels, startX, startY, strength, viewport) {
  const { grid, player } = world
  if (!grid.inBounds(startX, startY)) return
  if (!shouldStartSource(player, startX, startY, strength, viewport)) return

  const radius = strength - 1
  const minX = Math.max(viewport.minX, startX - radius)
  const maxX = Math.min(viewport.maxX, startX + radius)
  const minY = Math.max(viewport.minY, startY - radius)
  const maxY = Math.min(viewport.maxY, startY + radius)

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!grid.inBounds(x, y)) continue

      const sourceDistance = Math.round(Math.hypot(x - startX, y - startY))
      const intensity = strength - sourceDistance
      if (intensity <= 0) continue

      const playerDistance = Math.hypot(x - player.tileX, y - player.tileY)
      if (playerDistance > PLAYER_VISION_RADIUS) continue
      if (!hasLineOfSight(grid, startX, startY, x, y)) continue

      addLight(levels, x, y, intensity)
    }
  }
}

function buildVisionViewport(player, grid) {
  const halfW = Math.ceil(VIEW_TILES_X / 2) + 1
  const halfH = Math.ceil(VIEW_TILES_Y / 2) + 1
  return {
    minX: Math.max(0, player.tileX - halfW),
    maxX: Math.min(grid.cols - 1, player.tileX + halfW),
    minY: Math.max(0, player.tileY - halfH),
    maxY: Math.min(grid.rows - 1, player.tileY + halfH),
  }
}

function collectSourceSignature(world) {
  const bombs = (world.bombs ?? [])
    .map((bomb) => `${bomb.tileX},${bomb.tileY}:${bomb.lightEmission ?? BOMB_LIGHT}`)
    .sort()
    .join(';')
  const enemies = (world.enemies ?? [])
    .filter((enemy) => enemy.alive)
    .map((enemy) => {
      const emission = typeof enemy.getLightEmission === 'function'
        ? enemy.getLightEmission()
        : (enemy.lightEmission ?? ENEMY_LIGHT)
      return `${enemy.tileX},${enemy.tileY}:${emission}`
    })
    .sort()
    .join(';')
  const explosions = (world.explosions ?? [])
    .map((explosion) => `${explosion.tileX},${explosion.tileY}:${explosion.lightEmission ?? EXPLOSION_LIGHT}`)
    .sort()
    .join(';')
  return `${bombs}|${enemies}|${explosions}`
}

export class VisionSystem {
  update(world) {
    const { grid, player } = world
    if (!grid || !player) return

    const viewport = buildVisionViewport(player, grid)
    world.visionViewport = viewport

    const helmet = player.lightEmission ?? HELMET_LIGHT
    const sourceSignature = collectSourceSignature(world)
    const frameSignature = `${player.tileX},${player.tileY}|${helmet}|${sourceSignature}`
    if (frameSignature === world.visionSourceSignature) return

    const lightLevels = new Map()

    propagateSource(world, lightLevels, player.tileX, player.tileY, helmet, viewport)

    for (const bomb of world.bombs ?? []) {
      propagateSource(
        world,
        lightLevels,
        bomb.tileX,
        bomb.tileY,
        bomb.lightEmission ?? BOMB_LIGHT,
        viewport,
      )
    }

    for (const enemy of world.enemies ?? []) {
      if (!enemy.alive) continue
      const strength = typeof enemy.getLightEmission === 'function'
        ? enemy.getLightEmission()
        : (enemy.lightEmission ?? ENEMY_LIGHT)
      if (strength <= 0) continue
      propagateSource(world, lightLevels, enemy.tileX, enemy.tileY, strength, viewport)
    }

    for (const explosion of world.explosions ?? []) {
      propagateSource(
        world,
        lightLevels,
        explosion.tileX,
        explosion.tileY,
        explosion.lightEmission ?? EXPLOSION_LIGHT,
        viewport,
      )
    }

    for (const light of world.wallLightSpawns ?? []) {
      propagateSource(
        world,
        lightLevels,
        light.x,
        light.y,
        light.intensity ?? WALL_LIGHT,
        viewport,
      )
    }

    const visible = new Set()
    for (const [cellKey, level] of lightLevels) {
      if (level <= 0) continue
      visible.add(cellKey)
      world.discoveredTiles.add(cellKey)
    }

    world.lightLevels = lightLevels
    world.visibleTiles = visible
    world.visionSourceSignature = frameSignature
    world.visionRevision++
  }
}
