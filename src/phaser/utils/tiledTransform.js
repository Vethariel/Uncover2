const FLIP_H = 0x80000000
const FLIP_V = 0x40000000
const FLIP_D = 0x20000000

export function parseTiledGid(rawGid, tilesetCols) {
  if (rawGid <= 0) return null

  const gid = rawGid & 0x1fffffff
  const idx = gid - 1
  const col = idx % tilesetCols
  const row = Math.floor(idx / tilesetCols)

  return {
    frame: row * tilesetCols + col,
    flipH: (rawGid & FLIP_H) !== 0,
    flipV: (rawGid & FLIP_V) !== 0,
    flipD: (rawGid & FLIP_D) !== 0,
  }
}

// Replica la lógica de transformación del renderSystem original (p5).
export function applyTiledTileTransform(sprite, { flipH, flipV, flipD }) {
  sprite.setAngle(0)
  sprite.setFlip(false, false)

  if (flipD && flipH) {
    sprite.setAngle(90)
  } else if (flipH && flipV) {
    sprite.setAngle(180)
  } else if (flipD && flipV) {
    sprite.setAngle(-90)
  } else if (flipD) {
    sprite.setAngle(90)
    sprite.setFlip(false, true)
  } else if (flipH) {
    sprite.setFlip(true, false)
  } else if (flipV) {
    sprite.setFlip(false, true)
  }
}

export function placeTiledTile(sprite, px, py, tileSize) {
  sprite.setOrigin(0.5, 0.5)
  sprite.setPosition(px + tileSize / 2, py + tileSize / 2)
  sprite.setDisplaySize(tileSize, tileSize)
}
