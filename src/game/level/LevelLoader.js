import { Grid } from '../Grid.js'
import {
  TILE_EMPTY,
  TILE_WALL,
  TILE_DESTRUCTIBLE,
  TILE_PASS,
  TMJ_WALL,
  TMJ_DESTRUCTIBLE,
  TMJ_PASS,
  BG_LAYER_NAMES,
} from '../../config/constants.js'
import { PowerUpPool } from './PowerUpPool.js'

export class LevelLoader {
  static loadTMJ(world, tmj, tsj, tilesetKey) {
    const tileSize = tmj.tilewidth
    const cols = tmj.width
    const rows = tmj.height
    const grid = new Grid(cols, rows)

    const bgData = {}
    for (const name of BG_LAYER_NAMES) {
      const layer = tmj.layers.find((l) => l.name === name && l.type === 'tilelayer')
      if (layer) bgData[name] = layer.data
    }

    const gridLayer = tmj.layers.find((l) => l.name === 'GridMap' && l.type === 'tilelayer')
    if (!gridLayer) throw new Error("LevelLoader.loadTMJ: falta la capa 'GridMap'")

    const destructibleLayer = tmj.layers.find((l) => l.name === 'Destructible' && l.type === 'tilelayer')

    for (let i = 0; i < gridLayer.data.length; i++) {
      const x = i % cols
      const y = Math.floor(i / cols)
      const tid = gridLayer.data[i]

      switch (tid) {
        case TMJ_WALL:
          grid.set(x, y, TILE_WALL)
          break
        case TMJ_DESTRUCTIBLE:
          grid.set(x, y, TILE_DESTRUCTIBLE)
          break
        case TMJ_PASS:
          grid.set(x, y, TILE_PASS)
          break
        default:
          grid.set(x, y, TILE_EMPTY)
      }

      const layers = BG_LAYER_NAMES.map((name) => {
        const data = bgData[name]
        return data ? data[i] : 0
      })

      const destructibleGid = destructibleLayer ? destructibleLayer.data[i] & 0x1fffffff : 0

      grid.setVisual(x, y, { layers, destructibleGid })
    }

    world.grid = grid

    const objLayer = tmj.layers.find((l) => l.type === 'objectgroup')
    if (!objLayer) throw new Error('LevelLoader.loadTMJ: falta el Object Layer')

    for (const obj of objLayer.objects) {
      const tx = Math.floor(obj.x / tileSize)
      const ty = Math.floor(obj.y / tileSize)

      switch (obj.name) {
        case 'playerSpawn':
          world.playerSpawn = { x: tx, y: ty }
          break
        case 'enemySpawn':
          world.enemySpawns.push({ x: tx, y: ty, kind: obj.type })
          break
        case 'portalSpawn':
          world.portalSpawn = { x: tx, y: ty }
          break
      }
    }

    world.levelVisualConfig = this._parseVisualConfig(tsj, tilesetKey)
    PowerUpPool.generate(world)
  }

  static _parseVisualConfig(tsj, tilesetKey) {
    const firstGid = 1
    const tileAnims = {}

    for (const tile of tsj.tiles ?? []) {
      if (!tile.animation?.length) continue
      const gid = firstGid + tile.id
      tileAnims[gid] = {
        frames: tile.animation.map((f) => firstGid + f.tileid),
        duration: tile.animation[0].duration,
      }
    }

    return {
      tilesetKey,
      tilesetCols: tsj.columns,
      tileSize: tsj.tilewidth,
      margin: tsj.margin ?? 0,
      spacing: tsj.spacing ?? 0,
      tileAnims,
      bgMusic: tsj.bgMusic,
    }
  }
}
