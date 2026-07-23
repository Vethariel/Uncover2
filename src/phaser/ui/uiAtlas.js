import {
  UI_ATLAS_KEY,
  UI_ATLAS_PATH,
  UI_ATLAS_REGIONS,
  uiRegionSliceInsets,
} from '../../config/uiAtlas.js'

export {
  UI_ATLAS_KEY,
  UI_ATLAS_PATH,
  UI_ATLAS_REGIONS,
  uiSliceInsets,
  uiRegionSliceInsets,
} from '../../config/uiAtlas.js'

/** Precarga la textura del atlas (frames se registran en create). */
export function preloadUiAtlas(loader) {
  loader.image(UI_ATLAS_KEY, UI_ATLAS_PATH)
}

/**
 * Registra cada región como frame de la textura `uiAtlas`.
 * @param {Phaser.Scene} scene
 */
export function registerUiAtlasFrames(scene) {
  const texture = scene.textures.get(UI_ATLAS_KEY)
  if (!texture || texture.key === '__MISSING') {
    console.warn('[uiAtlas] texture missing:', UI_ATLAS_KEY)
    return
  }

  for (const [frameName, region] of Object.entries(UI_ATLAS_REGIONS)) {
    if (texture.has(frameName)) continue
    texture.add(frameName, 0, region.x, region.y, region.w, region.h)
  }
}

/**
 * NineSlice con centro de 2 px (según región). Origin 0,0 por defecto.
 * @param {Phaser.Scene} scene
 * @param {string} regionId
 * @param {number} x
 * @param {number} y
 * @param {number} width  tamaño de display
 * @param {number} height
 * @returns {Phaser.GameObjects.NineSlice | Phaser.GameObjects.Image}
 */
export function createUiNineSlice(scene, regionId, x, y, width, height) {
  const region = UI_ATLAS_REGIONS[regionId]
  if (!region) throw new Error(`[uiAtlas] unknown region: ${regionId}`)

  const insets = uiRegionSliceInsets(regionId)
  if (!insets) {
    return scene.add.image(x, y, UI_ATLAS_KEY, regionId)
      .setOrigin(0, 0)
      .setDisplaySize(width, height)
  }

  return scene.add.nineslice(
    x,
    y,
    UI_ATLAS_KEY,
    regionId,
    width,
    height,
    insets.left,
    insets.right,
    insets.top,
    insets.bottom,
  ).setOrigin(0, 0)
}

/**
 * Icono / pieza no-slice a tamaño nativo (o displaySize opcional).
 * @param {Phaser.Scene} scene
 * @param {string} regionId
 * @param {number} x
 * @param {number} y
 * @param {{ displayWidth?: number, displayHeight?: number, originX?: number, originY?: number }} [opts]
 */
export function createUiImage(scene, regionId, x, y, opts = {}) {
  const region = UI_ATLAS_REGIONS[regionId]
  if (!region) throw new Error(`[uiAtlas] unknown region: ${regionId}`)

  const image = scene.add.image(x, y, UI_ATLAS_KEY, regionId)
    .setOrigin(opts.originX ?? 0.5, opts.originY ?? 0.5)

  if (opts.displayWidth != null && opts.displayHeight != null) {
    image.setDisplaySize(opts.displayWidth, opts.displayHeight)
  }
  return image
}
