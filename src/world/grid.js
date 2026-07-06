export class Grid {

  constructor(cols, rows) {

    this.cols = cols
    this.rows = rows

    this.tiles = Array.from({ length: rows }, () =>
      new Array(cols).fill(0)
    )

    this.visual = Array.from({ length: rows }, () =>
      new Array(cols).fill(null)
    )

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
    this.tiles[y][x] = value

  }


  getVisual(x, y) {
    if (!this.inBounds(x, y)) return null
    return this.visual[y][x]
  }

  setVisual(x, y, layers) {
    if (!this.inBounds(x, y)) return
    this.visual[y][x] = layers
  }

}