import { TILE_WALL } from './constants.js'

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
    // Esquinas externas: vecinos hacia el interior del bloque.
    case E | S:
      return F.ul
    case W | S:
      return F.ur
    case E | N:
      return F.dl
    case W | N:
      return F.dr
    // Bordes: el lado que falta es el hueco / cara libre.
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

export function isMineWallTile(tile) {
  return tile === TILE_WALL
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
