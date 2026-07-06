/** Deriva tileX/tileY desde el centro de la hitbox (size). Única fuente de verdad. */
export function syncTileFromPosition(entity, tileSize) {
  entity.tileX = Math.floor((entity.posX + entity.size / 2) / tileSize)
  entity.tileY = Math.floor((entity.posY + entity.size / 2) / tileSize)
}

/** Posición continua centrada en un tile (spawn). */
export function positionFromTile(tileX, tileY, tileSize, entitySize) {
  return {
    posX: tileX * tileSize + (tileSize - entitySize) / 2,
    posY: tileY * tileSize + (tileSize - entitySize) / 2,
    tileX,
    tileY,
  }
}
