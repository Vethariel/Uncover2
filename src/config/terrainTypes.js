import { TILE_EMPTY, TILE_WALL } from './constants.js'

export const TERRAIN_REGION = Object.freeze({
  outside: 'outside',
  corridor: 'corridor',
  entry: 'entry',
  exit: 'exit',
  vein: 'vein',
  den: 'den',
  mixed: 'mixed',
  relic: 'relic',
  agora: 'agora',
})

const REGION_VALUES = Object.values(TERRAIN_REGION)

export const TERRAIN_TILES = Object.freeze(Object.fromEntries(
  REGION_VALUES.map((region) => [
    region,
    Object.freeze({
      empty: `${region}:empty`,
      wall: `${region}:wall`,
    }),
  ]),
))

export function terrainTileFor(region, logicalTile) {
  const tiles = TERRAIN_TILES[region] ?? TERRAIN_TILES.outside
  return logicalTile === TILE_WALL ? tiles.wall : tiles.empty
}

export function isTerrainEmpty(tile) {
  return tile.endsWith(':empty')
}

export function isTerrainWall(tile) {
  return tile.endsWith(':wall')
}

export function logicalTileForTerrain(tile) {
  return isTerrainWall(tile) ? TILE_WALL : TILE_EMPTY
}
