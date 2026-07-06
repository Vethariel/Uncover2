import { GridQuery } from '../../GridQuery.js'

/** @deprecated Prefer GridQuery — re-exporta para compatibilidad con IA. */
export function isDangerous(world, tileX, tileY) {
  return GridQuery.for(world).isDangerous(tileX, tileY)
}

export function isSafe(world, tileX, tileY) {
  return GridQuery.for(world).isSafe(tileX, tileY)
}

export function isWalkable(world, tileX, tileY) {
  return GridQuery.for(world).isWalkable(tileX, tileY)
}
