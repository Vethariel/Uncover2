import { TILE_DESTRUCTIBLE, HUD_HEIGHT } from '../../config/constants.js'
import { parseTiledGid, applyTiledTileTransform, placeTiledTile } from '../utils/tiledTransform.js'

export class TilemapView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.container = scene.add.container(0, HUD_HEIGHT)
    this.bgImages = []
    this.destructibleSprites = new Map()
    this.build()
  }

  build() {
    const { grid, tileSize, levelVisualConfig } = this.world
    if (!levelVisualConfig) return

    const sheet = levelVisualConfig.tilesetKey
    const cfg = levelVisualConfig

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const visual = grid.getVisual(x, y)
        if (!visual) continue

        const px = x * tileSize
        const py = y * tileSize

        for (const gid of visual.layers) {
          if (gid === 0) continue
          const img = this._createTileImage(sheet, gid, cfg, px, py)
          if (img) this.bgImages.push(img)
        }
      }
    }

    this.container.add(this.bgImages)

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const visual = grid.getVisual(x, y)
        if (!visual) continue

        if (grid.get(x, y) === TILE_DESTRUCTIBLE && visual.destructibleGid > 0) {
          const px = x * tileSize
          const py = y * tileSize
          const sprite = this._createTileImage(sheet, visual.destructibleGid, cfg, px, py)
          if (sprite) {
            this.destructibleSprites.set(`${x},${y}`, { sprite, gid: visual.destructibleGid })
            this.container.add(sprite)
          }
        }
      }
    }
  }

  update() {
    const { grid, levelVisualConfig } = this.world
    if (!levelVisualConfig) return

    this.world.tileAnimTimer += this.scene.game.loop.delta

    for (const [key, entry] of this.destructibleSprites) {
      const [x, y] = key.split(',').map(Number)
      const tile = grid.get(x, y)

      if (tile === TILE_DESTRUCTIBLE) {
        const anim = levelVisualConfig.tileAnims[entry.gid]
        if (anim) {
          const frame = Math.floor(this.world.tileAnimTimer / anim.duration) % anim.frames.length
          this._setTileFrame(entry.sprite, anim.frames[frame], levelVisualConfig)
        }
        entry.sprite.setVisible(true)
      } else {
        entry.sprite.setVisible(false)
      }
    }
  }

  destroy() {
    this.container.destroy(true)
    this.bgImages = []
    this.destructibleSprites.clear()
  }

  _createTileImage(sheet, rawGid, cfg, px, py) {
    const parsed = parseTiledGid(rawGid, cfg.tilesetCols)
    if (!parsed) return null

    const img = this.scene.add.image(0, 0, sheet, parsed.frame)
    placeTiledTile(img, px, py, cfg.tileSize)
    applyTiledTileTransform(img, parsed)
    return img
  }

  _setTileFrame(sprite, rawGid, cfg) {
    const parsed = parseTiledGid(rawGid, cfg.tilesetCols)
    if (!parsed) return
    sprite.setFrame(parsed.frame)
    applyTiledTileTransform(sprite, parsed)
  }
}
