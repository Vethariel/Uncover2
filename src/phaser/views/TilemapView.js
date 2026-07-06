import { BG_LAYER_NAMES, HUD_HEIGHT, TILE_DESTRUCTIBLE } from '../../config/constants.js'

const RENDER_LAYERS = [...BG_LAYER_NAMES, 'Destructible']

export class TilemapView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.map = null
    this.destructibleLayer = null
    this.build()
  }

  build() {
    const cfg = this.world.levelVisualConfig
    if (!cfg) return

    const mapKey = `map_${cfg.tilesetKey}`
    this.map = this.scene.make.tilemap({ key: mapKey })

    const tileset = this.map.addTilesetImage(cfg.tilesetName, cfg.tilesetKey)
    if (!tileset) {
      throw new Error(`TilemapView: tileset "${cfg.tilesetName}" no encontrado para ${mapKey}`)
    }

    for (const name of RENDER_LAYERS) {
      if (this.map.getLayerIndex(name) === -1) continue

      const layer = this.map.createLayer(name, tileset, 0, HUD_HEIGHT)
      if (!layer) continue

      layer.setDepth(0)

      if (name === 'Destructible') {
        this.destructibleLayer = layer
      }
    }
  }

  update() {
    if (!this.destructibleLayer) return

    const { grid } = this.world
    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        if (grid.get(x, y) === TILE_DESTRUCTIBLE) continue
        if (this.destructibleLayer.getTileAt(x, y)) {
          this.destructibleLayer.removeTileAt(x, y)
        }
      }
    }
  }

  destroy() {
    this.map?.destroy()
    this.map = null
    this.destructibleLayer = null
  }
}
