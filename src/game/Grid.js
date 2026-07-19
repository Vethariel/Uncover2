export class Grid {
  constructor(cols, rows) {
    this.cols = cols
    this.rows = rows
    this.tiles = Array.from({ length: rows }, () => new Array(cols).fill(0))
    // Incrementa con cada cambio de tile: permite invalidar cachés (p.ej. visión).
    this.revision = 0
  }

  inBounds(x, y) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows
  }

  get(x, y) {
    if (!this.inBounds(x, y)) return null
    return this.tiles[y][x]
  }

  set(x, y, value) {
    if (!this.inBounds(x, y)) return
    if (this.tiles[y][x] !== value) this.revision++
    this.tiles[y][x] = value
  }
}
