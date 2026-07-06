import { Grid } from "./grid.js"
import { TILE_EMPTY, TILE_WALL, TILE_DESTRUCTIBLE, TILE_PASS } from "../config/constants.js"
import { TMJ_EMPTY, TMJ_WALL, TMJ_DESTRUCTIBLE, TMJ_PASS, BG_LAYER_NAMES } from "../config/constants.js"
import { PowerUpPool } from "./powerUpPool.js"

export class LevelLoader {

  static loadLegacy(world, map) {

    const rows = map.length
    const cols = map[0].length
    const grid = new Grid(cols, rows)

    for (let y = 0; y < rows; y++) {

      for (let x = 0; x < cols; x++) {

        const char = map[y][x]

        switch (char) {
          case "#": grid.set(x, y, TILE_WALL); break
          case "+": grid.set(x, y, TILE_DESTRUCTIBLE); break
          case "P":
            grid.set(x, y, TILE_EMPTY)
            world.playerSpawn = { x, y }
            break
          case "E":
            grid.set(x, y, TILE_EMPTY)
            world.enemySpawns.push({ x, y })
            break
          case "X":
            grid.set(x, y, TILE_EMPTY)
            world.portalSpawn = { x, y }
            break
          default:
            grid.set(x, y, TILE_EMPTY)
        }

      }

    }

    world.grid = grid
    world.levelVisualConfig = null
    PowerUpPool.generate(world)

  }

  static loadTMJ(world, tmj, tsj, tilesetKey) {

    const tileSize = tmj.tilewidth    // 16
    const cols = tmj.width        // 17
    const rows = tmj.height       // 13
    const grid = new Grid(cols, rows)

    // 1. Indexa las capas de fondo por nombre para lookup O(1)
    const bgData = {}
    for (const name of BG_LAYER_NAMES) {
      const layer = tmj.layers.find(l => l.name === name && l.type === "tilelayer")
      if (layer) bgData[name] = layer.data
    }

    // 2. Capa lógica "GridMap" → llena grid.tiles y grid.visual en un solo loop
    const gridLayer = tmj.layers.find(l => l.name === "GridMap" && l.type === "tilelayer")
    if (!gridLayer) throw new Error("LevelLoader.loadTMJ: falta la capa 'GridMap'")

    const destructibleLayer = tmj.layers.find(l => l.name === "Destructible" && l.type === "tilelayer")

    for (let i = 0; i < gridLayer.data.length; i++) {
      const x = i % cols
      const y = Math.floor(i / cols)
      const tid = gridLayer.data[i]

      // Lógica
      switch (tid) {
        case TMJ_WALL: grid.set(x, y, TILE_WALL); break
        case TMJ_DESTRUCTIBLE: grid.set(x, y, TILE_DESTRUCTIBLE); break
        case TMJ_PASS: grid.set(x, y, TILE_PASS); break
        default: grid.set(x, y, TILE_EMPTY)
      }

      // Visual: GID de cada capa de fondo para esta celda.
      const layers = BG_LAYER_NAMES.map(name => {
        const data = bgData[name]
        return data ? data[i] : 0
      })

      const destructibleGid = destructibleLayer
        ? (destructibleLayer.data[i] & 0x1FFFFFFF)
        : 0

      grid.setVisual(x, y, { layers, destructibleGid })
    }

    world.grid = grid

    // 3. Object Layer → spawns
    const objLayer = tmj.layers.find(l => l.type === "objectgroup")
    if (!objLayer) throw new Error("LevelLoader.loadTMJ: falta el Object Layer")

    for (const obj of objLayer.objects) {
      // Los puntos en Tiled reportan y en el borde inferior del tile.
      // Restamos 1 px antes de dividir para caer en la celda correcta.
      const tx = Math.floor(obj.x / tileSize)
      const ty = Math.floor((obj.y) / tileSize)

      switch (obj.name) {
        case "playerSpawn":
          world.playerSpawn = { x: tx, y: ty }
          break
        case "enemySpawn":
          world.enemySpawns.push({ x: tx, y: ty, kind: obj.type })
          break
        case "portalSpawn":
          world.portalSpawn = { x: tx, y: ty }
          break
      }
    }

    // 4. Configuración visual del nivel leída de las custom properties del mapa.
    // En Tiled: Map → Map Properties → "+" para añadir cada una:
    //
    //   tileset      (string)  clave del asset en AssetManager, ej. "tileset_cave"
    //   tilesetCols  (int)     columnas del spritesheet, ej. 12
    //   deathFrames  (int)     frames de la animación de destrucción, ej. 4
    //   deathFirstGid (int)    GID del primer frame de esa animación en el tileset
    world.levelVisualConfig = this._parseVisualConfig(tsj, tilesetKey)

    PowerUpPool.generate(world)

  }

  static _parseVisualConfig(tsj, tilesetKey) {

    const firstGid = 1

    // Mapa de gid → { frames: [gid,...], duration: ms }
    // para cualquier tile que tenga animación definida en el TSJ
    const tileAnims = {}
    for (const tile of (tsj.tiles ?? [])) {
      if (!tile.animation?.length) continue
      const gid = firstGid + tile.id
      tileAnims[gid] = {
        frames: tile.animation.map(f => firstGid + f.tileid),
        duration: tile.animation[0].duration
      }
    }

    return {
      tilesetKey,  // o la clave que uses
      tilesetCols: tsj.columns,              // 12
      tileSize: tsj.tilewidth,            // 16
      margin: tsj.margin ?? 0,
      spacing: tsj.spacing ?? 0,
      tileAnims,
      bgMusic: tsj.bgMusic
    }
  }

}