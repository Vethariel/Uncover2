import Phaser from 'phaser'
import { LEVELS } from '../../config/levels.js'
import { embedTileset } from './embedTileset.js'

/** Registra mapas Tiled en la caché de Phaser con tilesets embebidos. */
export function registerTilemaps(cache) {
  for (const level of LEVELS) {
    const key = level.data
    const tmj = cache.json.get(`tmj_${key}`)
    const tsj = cache.json.get(`tsj_${key}`)

    if (!tmj || !tsj) {
      throw new Error(`registerTilemaps: faltan tmj/tsj para "${key}"`)
    }

    cache.tilemap.add(`map_${key}`, {
      format: Phaser.Tilemaps.Formats.TILED_JSON,
      data: embedTileset(tmj, tsj, key),
    })
  }
}
