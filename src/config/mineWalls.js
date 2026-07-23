import { PLAYER_VISION_RADIUS, TILE_WALL } from './constants.js'
import {
  displayedLightWithVisionEdge,
  wallFaceWeight,
} from './visionFog.js'

/** Tileset mina: 4×5 frames de 32×32. Solo esquinas externas (sin internas). */
export const MINE_WALLS_TEXTURE = 'mineWalls'
export const MINE_WALL_FRAME_W = 32
export const MINE_WALL_FRAME_H = 32
export const MINE_WALLS_COLS = 4

/** Vecinos ortogonales: bit N=1 E=2 S=4 W=8. */
export const WALL_N = 1
export const WALL_E = 2
export const WALL_S = 4
export const WALL_W = 8

/** Cuartos de un tile (visión / niebla). */
export const Q_NW = 0
export const Q_NE = 1
export const Q_SW = 2
export const Q_SE = 3

/** Índices en el sheet (col + row * 4). */
export const MINE_WALL_FRAME = Object.freeze({
  ul: 0,
  u1: 1,
  u2: 2,
  ur: 3,
  l1: 4,
  isolated: 5,
  ud: 6,
  r1: 7,
  l2: 8,
  // 9 = vacío
  lr: 10,
  r2: 11,
  dl: 12,
  d1: 13,
  d2: 14,
  dr: 15,
  endD: 16,
  endU: 17,
  endL: 18,
  endR: 19,
})

/**
 * Elige frame según vecinos muro.
 * Esquinas = externas (redondeo hacia el hueco).
 * Extremos 1-dir = tapas; 2-dir opuestas = continuo UD/LR;
 * 3-dir = borde continuo U/D/L/R (variante 1/2 por (x+y)%2).
 * 4-dir (interior) → LR (no hay tile de relleno interno).
 */
export function mineWallFrameIndex(mask, x = 0, y = 0) {
  const alt = (x + y) & 1
  const F = MINE_WALL_FRAME
  const { N, E, S, W } = { N: WALL_N, E: WALL_E, S: WALL_S, W: WALL_W }

  switch (mask) {
    case 0:
      return F.isolated
    case N:
      return F.endD
    case S:
      return F.endU
    case E:
      return F.endL
    case W:
      return F.endR
    case N | S:
      return F.ud
    case E | W:
      return F.lr
    case E | S:
      return F.ul
    case W | S:
      return F.ur
    case E | N:
      return F.dl
    case W | N:
      return F.dr
    case E | W | S:
      return alt ? F.u1 : F.u2
    case E | W | N:
      return alt ? F.d1 : F.d2
    case N | S | E:
      return alt ? F.l1 : F.l2
    case N | S | W:
      return alt ? F.r1 : F.r2
    case N | E | S | W:
      return F.lr
    default:
      return F.isolated
  }
}

/**
 * Forma de oclusión visual (eje de la cresta del muro).
 * @returns {'ud'|'lr'|'ul'|'ur'|'dl'|'dr'|'isolated'}
 */
export function wallVisionShape(mask) {
  const { N, E, S, W } = { N: WALL_N, E: WALL_E, S: WALL_S, W: WALL_W }
  switch (mask) {
    case N | S:
    case N:
    case S:
    case N | S | E:
    case N | S | W:
      return 'ud'
    case E | W:
    case E:
    case W:
    case E | W | S:
    case E | W | N:
    case N | E | S | W:
      return 'lr'
    case E | S:
      return 'ul'
    case W | S:
      return 'ur'
    case E | N:
      return 'dl'
    case W | N:
      return 'dr'
    case 0:
    default:
      return 'isolated'
  }
}

/**
 * Cuartos ocultos del muro vistos desde (dx, dy) relativos al centro del tile.
 * Conservado para tests / referencia; la presentación usa `wallQuarterLights`.
 */
export function wallOccludedQuarters(mask, dx, dy) {
  const shape = wallVisionShape(mask)

  if (shape === 'ud') {
    return dx <= 0 ? [Q_NE, Q_SE] : [Q_NW, Q_SW]
  }
  if (shape === 'lr') {
    return dy <= 0 ? [Q_SW, Q_SE] : [Q_NW, Q_NE]
  }
  if (shape === 'ul') {
    const q = new Set([Q_SE])
    if (dx > 0) {
      q.add(Q_NW)
      q.add(Q_SW)
    }
    if (dy > 0) {
      q.add(Q_NW)
      q.add(Q_NE)
    }
    return [...q]
  }
  if (shape === 'ur') {
    const q = new Set([Q_SW])
    if (dx < 0) {
      q.add(Q_NE)
      q.add(Q_SE)
    }
    if (dy > 0) {
      q.add(Q_NW)
      q.add(Q_NE)
    }
    return [...q]
  }
  if (shape === 'dl') {
    const q = new Set([Q_NE])
    if (dx > 0) {
      q.add(Q_NW)
      q.add(Q_SW)
    }
    if (dy < 0) {
      q.add(Q_SW)
      q.add(Q_SE)
    }
    return [...q]
  }
  if (shape === 'dr') {
    const q = new Set([Q_NW])
    if (dx < 0) {
      q.add(Q_NE)
      q.add(Q_SE)
    }
    if (dy < 0) {
      q.add(Q_SW)
      q.add(Q_SE)
    }
    return [...q]
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx <= 0 ? [Q_NE, Q_SE] : [Q_NW, Q_SW]
  }
  return dy <= 0 ? [Q_SW, Q_SE] : [Q_NW, Q_NE]
}

/**
 * Offsets del/los tiles de pasillo frente a la cara iluminada (hacia el viewer).
 * Conservado para tests; preferir `wallQuarterLights`.
 */
export function wallFrontLightOffsets(mask, dx, dy) {
  const shape = wallVisionShape(mask)

  if (shape === 'ud') {
    return [{ ox: dx <= 0 ? -1 : 1, oy: 0 }]
  }
  if (shape === 'lr') {
    return [{ ox: 0, oy: dy <= 0 ? -1 : 1 }]
  }
  if (shape === 'ul') {
    const out = []
    if (dx <= 0) out.push({ ox: -1, oy: 0 })
    if (dy <= 0) out.push({ ox: 0, oy: -1 })
    return out.length ? out : [{ ox: -1, oy: 0 }, { ox: 0, oy: -1 }]
  }
  if (shape === 'ur') {
    const out = []
    if (dx >= 0) out.push({ ox: 1, oy: 0 })
    if (dy <= 0) out.push({ ox: 0, oy: -1 })
    return out.length ? out : [{ ox: 1, oy: 0 }, { ox: 0, oy: -1 }]
  }
  if (shape === 'dl') {
    const out = []
    if (dx <= 0) out.push({ ox: -1, oy: 0 })
    if (dy >= 0) out.push({ ox: 0, oy: 1 })
    return out.length ? out : [{ ox: -1, oy: 0 }, { ox: 0, oy: 1 }]
  }
  if (shape === 'dr') {
    const out = []
    if (dx >= 0) out.push({ ox: 1, oy: 0 })
    if (dy >= 0) out.push({ ox: 0, oy: 1 })
    return out.length ? out : [{ ox: 1, oy: 0 }, { ox: 0, oy: 1 }]
  }

  if (Math.abs(dx) >= Math.abs(dy)) {
    return [{ ox: dx <= 0 ? -1 : 1, oy: 0 }]
  }
  return [{ ox: 0, oy: dy <= 0 ? -1 : 1 }]
}

/**
 * Luz de cara única (legacy). Preferir `wallQuarterLights`.
 */
export function wallLitFaceLight(
  levels,
  wallX,
  wallY,
  mask,
  dx,
  dy,
  canUseFront = null,
  vision = null,
) {
  let best = null
  for (const { ox, oy } of wallFrontLightOffsets(mask, dx, dy)) {
    const fx = wallX + ox
    const fy = wallY + oy
    if (canUseFront && !canUseFront(fx, fy)) continue
    let v = levels?.get(`${fx},${fy}`)
    if (v == null) continue
    if (vision) {
      const dist = Math.hypot(fx + 0.5 - vision.x, fy + 0.5 - vision.y)
      v = displayedLightWithVisionEdge(v, dist)
    }
    best = best == null ? v : Math.max(best, v)
  }
  if (best != null) return best
  if (canUseFront) return 0
  return levels?.get(`${wallX},${wallY}`) ?? 0
}

/**
 * ¿El vecino al frente puede aportar luz a la cara del muro?
 * Acepta piso iluminado (levels/visible) o ya descubierto — no exige
 * visibleTiles a rajatabla (penumbra / transición).
 */
export function isWallFrontFloorInVision(fx, fy, {
  grid,
  visibleTiles,
  discoveredTiles,
  levels,
  visionX,
  visionY,
  visionRadius = PLAYER_VISION_RADIUS,
}) {
  if (!grid || isMineWallTile(grid.get(fx, fy))) return false
  if (Math.hypot(fx + 0.5 - visionX, fy + 0.5 - visionY) > visionRadius) return false
  const key = `${fx},${fy}`
  if ((levels?.get(key) ?? 0) > 0.01) return true
  if (visibleTiles?.has(key)) return true
  if (discoveredTiles?.has(key)) return true
  return false
}

/**
 * ¿Hay que pintar el sprite del muro?
 * Descubierto, o vecino de pasillo ya explorado/iluminado (borde de visión).
 */
export function wallIsRevealed(world, wallX, wallY) {
  const key = `${wallX},${wallY}`
  if (world.discoveredTiles?.has(key)) return true
  const levels = world.displayedLightLevels ?? world.lightLevels
  for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
    const nk = `${wallX + ox},${wallY + oy}`
    if (world.discoveredTiles?.has(nk)) return true
    if ((levels?.get(nk) ?? 0) > 0.01) return true
  }
  return false
}

function emptyQuarterLights() {
  return { [Q_NW]: 0, [Q_NE]: 0, [Q_SW]: 0, [Q_SE]: 0 }
}

/**
 * Luces continuas por cuarto según forma del muro y posición del viewer.
 *
 * Pesos suaves (wallFaceWeight): wL/wR/wU/wD según dx/dy.
 * - UD: oeste ← lightW*wL; este ← lightE*wR
 * - LR: norte/sur análogo
 * - UL (abierta NO): NW=max(W,N); NE=N; SW=W; SE≈0
 * - UR/DL/DR simétricos
 *
 * `sampleFrontLight(ox, oy)` → luz renderizada del vecino, o 0 si no usable.
 * `wallSelfLight` → fallback si ningún piso aporta (descubrimiento en borde).
 *
 * @returns {{ [q: number]: number }}
 */
export function wallQuarterLights(mask, dx, dy, sampleFrontLight, wallSelfLight = 0) {
  const shape = wallVisionShape(mask)
  const wL = wallFaceWeight(-dx)
  const wR = wallFaceWeight(dx)
  const wU = wallFaceWeight(-dy)
  const wD = wallFaceWeight(dy)

  const lightW = sampleFrontLight(-1, 0) ?? 0
  const lightE = sampleFrontLight(1, 0) ?? 0
  const lightN = sampleFrontLight(0, -1) ?? 0
  const lightS = sampleFrontLight(0, 1) ?? 0

  let lights = emptyQuarterLights()

  if (shape === 'ud') {
    lights[Q_NW] = lightW * wL
    lights[Q_SW] = lightW * wL
    lights[Q_NE] = lightE * wR
    lights[Q_SE] = lightE * wR
  } else if (shape === 'lr') {
    lights[Q_NW] = lightN * wU
    lights[Q_NE] = lightN * wU
    lights[Q_SW] = lightS * wD
    lights[Q_SE] = lightS * wD
  } else if (shape === 'ul') {
    // Abierta a NO; SE interior.
    lights[Q_NW] = Math.max(lightW * wL, lightN * wU)
    lights[Q_NE] = lightN * wU
    lights[Q_SW] = lightW * wL
    lights[Q_SE] = 0
  } else if (shape === 'ur') {
    lights[Q_NE] = Math.max(lightE * wR, lightN * wU)
    lights[Q_NW] = lightN * wU
    lights[Q_SE] = lightE * wR
    lights[Q_SW] = 0
  } else if (shape === 'dl') {
    lights[Q_SW] = Math.max(lightW * wL, lightS * wD)
    lights[Q_SE] = lightS * wD
    lights[Q_NW] = lightW * wL
    lights[Q_NE] = 0
  } else if (shape === 'dr') {
    lights[Q_SE] = Math.max(lightE * wR, lightS * wD)
    lights[Q_SW] = lightS * wD
    lights[Q_NE] = lightE * wR
    lights[Q_NW] = 0
  } else if (Math.abs(dx) >= Math.abs(dy)) {
    lights[Q_NW] = lightW * wL
    lights[Q_SW] = lightW * wL
    lights[Q_NE] = lightE * wR
    lights[Q_SE] = lightE * wR
  } else {
    lights[Q_NW] = lightN * wU
    lights[Q_NE] = lightN * wU
    lights[Q_SW] = lightS * wD
    lights[Q_SE] = lightS * wD
  }

  const maxFace = Math.max(lights[Q_NW], lights[Q_NE], lights[Q_SW], lights[Q_SE])
  if (maxFace <= 0.01 && wallSelfLight > 0.01) {
    // Descubrimiento en borde: reparte la luz propia del muro en caras abiertas.
    lights = applyWallSelfFallback(shape, wL, wR, wU, wD, wallSelfLight)
  }

  return lights
}

function applyWallSelfFallback(shape, wL, wR, wU, wD, self) {
  const lights = emptyQuarterLights()
  if (shape === 'ud') {
    lights[Q_NW] = self * wL
    lights[Q_SW] = self * wL
    lights[Q_NE] = self * wR
    lights[Q_SE] = self * wR
    return lights
  }
  if (shape === 'lr') {
    lights[Q_NW] = self * wU
    lights[Q_NE] = self * wU
    lights[Q_SW] = self * wD
    lights[Q_SE] = self * wD
    return lights
  }
  if (shape === 'ul') {
    lights[Q_NW] = self * Math.max(wL, wU)
    lights[Q_NE] = self * wU
    lights[Q_SW] = self * wL
    return lights
  }
  if (shape === 'ur') {
    lights[Q_NE] = self * Math.max(wR, wU)
    lights[Q_NW] = self * wU
    lights[Q_SE] = self * wR
    return lights
  }
  if (shape === 'dl') {
    lights[Q_SW] = self * Math.max(wL, wD)
    lights[Q_SE] = self * wD
    lights[Q_NW] = self * wL
    return lights
  }
  if (shape === 'dr') {
    lights[Q_SE] = self * Math.max(wR, wD)
    lights[Q_SW] = self * wD
    lights[Q_NE] = self * wR
    return lights
  }
  // isolated
  if (wL + wR >= wU + wD) {
    lights[Q_NW] = self * wL
    lights[Q_SW] = self * wL
    lights[Q_NE] = self * wR
    lights[Q_SE] = self * wR
  } else {
    lights[Q_NW] = self * wU
    lights[Q_NE] = self * wU
    lights[Q_SW] = self * wD
    lights[Q_SE] = self * wD
  }
  return lights
}

/**
 * Construye sampleFrontLight + wallSelfLight a partir del mundo de presentación.
 */
export function makeWallLightSampler({
  levels,
  grid,
  wallX,
  wallY,
  visibleTiles,
  discoveredTiles,
  visionX,
  visionY,
}) {
  const sampleFrontLight = (ox, oy) => {
    const fx = wallX + ox
    const fy = wallY + oy
    if (!isWallFrontFloorInVision(fx, fy, {
      grid,
      visibleTiles,
      discoveredTiles,
      levels,
      visionX,
      visionY,
    })) return 0
    const raw = levels?.get(`${fx},${fy}`) ?? 0
    if (raw <= 0) return 0
    const dist = Math.hypot(fx + 0.5 - visionX, fy + 0.5 - visionY)
    return displayedLightWithVisionEdge(raw, dist)
  }

  let wallSelfLight = 0
  const wallKey = `${wallX},${wallY}`
  const rawWall = levels?.get(wallKey) ?? 0
  const wallKnown = discoveredTiles?.has(wallKey)
    || visibleTiles?.has(wallKey)
    || rawWall > 0.01
  if (wallKnown && rawWall > 0) {
    const dist = Math.hypot(wallX + 0.5 - visionX, wallY + 0.5 - visionY)
    wallSelfLight = displayedLightWithVisionEdge(rawWall, dist)
  }

  return { sampleFrontLight, wallSelfLight }
}

/** Rect local (0..1) de un cuarto dentro del tile. */
export function quarterLocalRect(quarter) {
  const left = quarter === Q_NE || quarter === Q_SE
  const bottom = quarter === Q_SW || quarter === Q_SE
  return {
    u: left ? 0.5 : 0,
    v: bottom ? 0.5 : 0,
    w: 0.5,
    h: 0.5,
  }
}

export function isMineWallTile(tile) {
  return tile === TILE_WALL
}

/**
 * Centro de un bloque 3×3 de muro (8 vecinos muro u fuera de mapa).
 * Se pinta el tile entero en negro (sin cara parcial).
 */
export function isWallFullyEnclosed3x3(grid, x, y) {
  for (let oy = -1; oy <= 1; oy++) {
    for (let ox = -1; ox <= 1; ox++) {
      if (ox === 0 && oy === 0) continue
      if (!isWallAt(grid, x + ox, y + oy)) return false
    }
  }
  return true
}

/** Fuera de mapa cuenta como muro (borde del nivel). */
export function mineWallNeighborMask(grid, x, y) {
  let mask = 0
  if (isWallAt(grid, x, y - 1)) mask |= WALL_N
  if (isWallAt(grid, x + 1, y)) mask |= WALL_E
  if (isWallAt(grid, x, y + 1)) mask |= WALL_S
  if (isWallAt(grid, x - 1, y)) mask |= WALL_W
  return mask
}

function isWallAt(grid, x, y) {
  if (!grid.inBounds(x, y)) return true
  return isMineWallTile(grid.get(x, y))
}

export function preloadMineWalls(loader) {
  loader.spritesheet(MINE_WALLS_TEXTURE, 'assets/tilemaps/mine_walls.png', {
    frameWidth: MINE_WALL_FRAME_W,
    frameHeight: MINE_WALL_FRAME_H,
  })
}
