/**
 * Horno del taller: entidad sólida.
 * El sprite puede ser más grande; el body de bloqueo / interacción es un
 * bloque centrado en (tileX, tileY) — por defecto 3×3.
 */
export class Furnace {
  constructor({
    tileX,
    tileY,
    originX,
    originY,
    width,
    height,
    bodySize = 3,
    id = 'furnace',
    label = 'HORNO',
  }) {
    this.id = id
    this.label = label
    this.kind = 'furnace'
    this.type = 'furnace'
    this.solid = true
    this.alive = true
    this.bodySize = bodySize
    this.tileX = tileX
    this.tileY = tileY
    this.tile = { x: tileX, y: tileY }
    this.tiles = blockTiles(tileX, tileY, bodySize)
    this.origin = { x: originX, y: originY }
    this.size = { w: width, h: height }
  }
}

function blockTiles(centerX, centerY, size) {
  const half = Math.floor(size / 2)
  const tiles = []
  for (let dy = -half; dy <= half; dy++) {
    for (let dx = -half; dx <= half; dx++) {
      tiles.push({ x: centerX + dx, y: centerY + dy })
    }
  }
  return tiles
}
