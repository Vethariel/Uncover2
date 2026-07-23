/** Luz emitida por el portal central de una puerta. */
export const DOOR_LIGHT = 10

export const ENTRY_GLOW = 0x7ec8c4
/** Ámbar del portal de salida / fragmentos. */
export const AMBER_GLOW = 0xffc857
const EXIT_GLOW = AMBER_GLOW

/**
 * Claves de tiles de marco (muros de la puerta) → negro pleno.
 * @param {{ entryDoor?: object, exitDoor?: object }} world
 */
export function collectDoorWallKeys(world) {
  const keys = new Set()
  for (const door of [world?.entryDoor, world?.exitDoor]) {
    if (!door) continue
    for (const tile of [...(door.sideTiles ?? []), ...(door.backingTiles ?? [])]) {
      keys.add(`${tile.x},${tile.y}`)
    }
    const center = door.trigger ?? door.center
    for (const tile of door.tiles ?? []) {
      if (center && tile.x === center.x && tile.y === center.y) continue
      keys.add(`${tile.x},${tile.y}`)
    }
  }
  return keys
}

/**
 * Círculo con degradado (anillos concéntricos) en el centro del tile.
 */
export function drawDoorLightCircle(graphics, tileX, tileY, tileSize, glowColor) {
  const cx = tileX * tileSize + tileSize / 2
  const cy = tileY * tileSize + tileSize / 2
  const radius = tileSize * 0.48
  const rings = [
    { r: 1.0, a: 0.12 },
    { r: 0.82, a: 0.22 },
    { r: 0.64, a: 0.35 },
    { r: 0.46, a: 0.5 },
    { r: 0.3, a: 0.68 },
    { r: 0.16, a: 0.88 },
    { r: 0.07, a: 1 },
  ]
  for (const ring of rings) {
    graphics.fillStyle(glowColor, ring.a)
    graphics.fillCircle(cx, cy, radius * ring.r)
  }
}

/**
 * Marco negro + portal circular en el centro.
 * @param {'entry'|'exit'|string} [kind]
 */
export function drawDoorPortal(graphics, door, tileSize, kind = 'exit') {
  if (!door) return
  const center = door.trigger ?? door.center
  if (!center) return

  const glow = kind === 'entry' || door.kind === 'entry'
    ? ENTRY_GLOW
    : EXIT_GLOW

  const frameTiles = [
    ...(door.sideTiles ?? []),
    ...(door.backingTiles ?? []),
  ]
  if (frameTiles.length === 0 && door.tiles) {
    for (const tile of door.tiles) {
      if (tile.x === center.x && tile.y === center.y) continue
      frameTiles.push(tile)
    }
  }

  for (const tile of frameTiles) {
    graphics.fillStyle(0x000000, 1)
    graphics.fillRect(
      tile.x * tileSize,
      tile.y * tileSize,
      tileSize,
      tileSize,
    )
  }

  drawDoorLightCircle(graphics, center.x, center.y, tileSize, glow)
}
