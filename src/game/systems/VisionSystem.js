import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  PLAYER_VISION_RADIUS,
  TILE_DESTRUCTIBLE,
  TILE_EMPTY,
  TILE_WALL,
  VIEW_TILES_X,
  VIEW_TILES_Y,
} from '../../config/constants.js'
import {
  torchAnimFrame,
  torchLightIntensity,
} from '../../config/torch.js'

export const HELMET_LIGHT = 7
export const BOMB_LIGHT = 2
export const ENEMY_LIGHT = 2
export const ENRAGED_SPIRIT_LIGHT = 5
export const EXPLOSION_LIGHT = 5
export const WALL_LIGHT = 10
export const DOOR_LIGHT = 10
export const MAX_LIGHT = 10
export const FLASHLIGHT_CONE_DEGREES = 180

// cos(90°) en float no es exactamente 0; forzar 0 para semicírculo.
const FLASHLIGHT_HALF_ANGLE_COS = FLASHLIGHT_CONE_DEGREES >= 180
  ? 0
  : Math.cos((FLASHLIGHT_CONE_DEGREES / 2) * Math.PI / 180)

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

function facingVector(facing) {
  switch (facing) {
    case DIR_UP: return { x: 0, y: -1 }
    case DIR_DOWN: return { x: 0, y: 1 }
    case DIR_LEFT: return { x: -1, y: 0 }
    case DIR_RIGHT: return { x: 1, y: 0 }
    default: return { x: 0, y: 1 }
  }
}

function isInsideFlashlightCone(facing, dx, dy) {
  if (dx === 0 && dy === 0) return true
  const forward = facingVector(facing)
  const distance = Math.hypot(dx, dy)
  const normalizedDot = (dx * forward.x + dy * forward.y) / distance
  return normalizedDot >= FLASHLIGHT_HALF_ANGLE_COS
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
    const previousX = x
    const previousY = y
    if (doubledError > -dy) {
      error -= dy
      x += stepX
    }
    if (doubledError < dx) {
      error += dx
      y += stepY
    }

    // Un paso diagonal no puede colarse entre dos esquinas opacas.
    if (
      x !== previousX
      && y !== previousY
      && isOpaque(grid.get(x, previousY))
      && isOpaque(grid.get(previousX, y))
    ) {
      return false
    }

    if (x === targetX && y === targetY) return true
    if (isOpaque(grid.get(x, y))) return false
  }

  return true
}

function propagateSource(
  world,
  levels,
  startX,
  startY,
  strength,
  viewport,
  targetFilter = null,
) {
  const { grid, player } = world
  if (!grid.inBounds(startX, startY)) return
  if (!shouldStartSource(player, startX, startY, strength, viewport)) return

  const radius = strength - 1
  const minX = Math.max(viewport.minX, Math.floor(startX - radius))
  const maxX = Math.min(viewport.maxX, Math.ceil(startX + radius))
  const minY = Math.max(viewport.minY, Math.floor(startY - radius))
  const maxY = Math.min(viewport.maxY, Math.ceil(startY + radius))

  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (!grid.inBounds(x, y)) continue

      const sourceDistance = Math.round(Math.hypot(x - startX, y - startY))
      const intensity = strength - sourceDistance
      if (intensity <= 0) continue
      if (targetFilter && !targetFilter(x - startX, y - startY)) continue

      const playerDistance = Math.hypot(x - player.tileX, y - player.tileY)
      if (playerDistance > PLAYER_VISION_RADIUS) continue
      if (!hasLineOfSight(grid, player.tileX, player.tileY, x, y)) continue
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

function applyEmptyTileLight(world, levels, intensity, viewport) {
  if (intensity <= 0) return
  const { grid, player } = world

  for (let y = viewport.minY; y <= viewport.maxY; y++) {
    for (let x = viewport.minX; x <= viewport.maxX; x++) {
      if (grid.get(x, y) !== TILE_EMPTY) continue
      if (Math.hypot(x - player.tileX, y - player.tileY) > PLAYER_VISION_RADIUS) continue
      if (!hasLineOfSight(grid, player.tileX, player.tileY, x, y)) continue
      addLight(levels, x, y, intensity)
    }
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
  const npcs = (world.npcs ?? [])
    .filter((npc) => (npc.lightEmission ?? 0) > 0)
    .map((npc) => (
      `${npc.tile.x},${npc.tile.y}:${npc.lightEmission}:${npc.facing ?? ''}`
    ))
    .sort()
    .join(';')
  return `${bombs}|${enemies}|${explosions}|${npcs}`
}

function collectTorchSignature(world, player) {
  const t = world.torchTime ?? 0
  const parts = []
  for (const light of world.wallLightSpawns ?? []) {
    const dist = Math.hypot(light.x - player.tileX, light.y - player.tileY)
    if (dist > PLAYER_VISION_RADIUS + WALL_LIGHT - 1) continue
    const frame = torchAnimFrame(t, light.phaseOffset ?? 0)
    const base = light.baseIntensity ?? WALL_LIGHT
    // Intensidad entera: rebuild solo cuando cambia el brillo perceptible.
    parts.push(`${light.x},${light.y}:${Math.round(torchLightIntensity(frame, base))}`)
  }
  return parts.sort().join(';')
}

function syncTorchLightState(world) {
  const t = world.torchTime ?? 0
  for (const light of world.wallLightSpawns ?? []) {
    const frame = torchAnimFrame(t, light.phaseOffset ?? 0)
    const base = light.baseIntensity ?? WALL_LIGHT
    light.animFrame = frame
    light.intensity = torchLightIntensity(frame, base)
  }
}

export class VisionSystem {
  update(world, dt = 0) {
    const { grid, player } = world
    if (!grid || !player) return

    world.torchTime = (world.torchTime ?? 0) + Math.max(0, dt)
    syncTorchLightState(world)

    const viewport = buildVisionViewport(player, grid)
    world.visionViewport = viewport

    const helmet = player.lightEmission ?? HELMET_LIGHT
    const emptyTileLight = world.levelVisualConfig?.emptyTileLight ?? 0
    const sourceSignature = collectSourceSignature(world)
    const torchSignature = collectTorchSignature(world, player)
    const frameSignature = `${player.tileX},${player.tileY}:${player.facing}|${helmet}|${emptyTileLight}|${grid.revision ?? 0}|${sourceSignature}|${torchSignature}`
    if (frameSignature === world.visionSourceSignature) return

    const lightLevels = new Map()

    propagateSource(
      world,
      lightLevels,
      player.tileX,
      player.tileY,
      helmet,
      viewport,
      (dx, dy) => isInsideFlashlightCone(player.facing, dx, dy),
    )

    for (const npc of world.npcs ?? []) {
      const strength = npc.lightEmission ?? 0
      if (strength <= 0 || !npc.tile) continue
      const facing = npc.facing
      const cone = facing != null
        ? (dx, dy) => isInsideFlashlightCone(facing, dx, dy)
        : null
      propagateSource(
        world,
        lightLevels,
        npc.tile.x,
        npc.tile.y,
        strength,
        viewport,
        cone,
      )
    }

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

    for (const door of [world.entryDoor, world.exitDoor]) {
      const center = door?.trigger ?? door?.center
      if (!center) continue
      propagateSource(
        world,
        lightLevels,
        center.x,
        center.y,
        DOOR_LIGHT,
        viewport,
      )
    }

    applyEmptyTileLight(world, lightLevels, emptyTileLight, viewport)

    const visible = new Set()
    for (const [cellKey, level] of lightLevels) {
      if (level <= 0) continue
      visible.add(cellKey)
      world.discoveredTiles.add(cellKey)
    }

    // Descubrir muros ortogonales junto a cualquier tile iluminado (caras visibles).
    for (const cellKey of [...visible]) {
      const [xs, ys] = cellKey.split(',')
      const x = Number(xs)
      const y = Number(ys)
      for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) {
        const wx = x + dx
        const wy = y + dy
        if (!grid.inBounds(wx, wy)) continue
        if (!isOpaque(grid.get(wx, wy))) continue
        world.discoveredTiles.add(tileKey(wx, wy))
      }
    }

    world.lightLevels = lightLevels
    world.visibleTiles = visible
    world.visionRevision = (world.visionRevision ?? 0) + 1
    world.visionSourceSignature = frameSignature
  }
}
