import {
  ICONS_ATLAS_KEY,
  ICONS_ATLAS_PATH,
  ICONS_ATLAS_REGIONS,
  sealIconFrame,
} from '../../config/iconsAtlas.js'

export {
  ICONS_ATLAS_KEY,
  ICONS_ATLAS_PATH,
  ICONS_ATLAS_REGIONS,
  sealIconFrame,
} from '../../config/iconsAtlas.js'

export function preloadIconsAtlas(loader) {
  loader.image(ICONS_ATLAS_KEY, ICONS_ATLAS_PATH)
}

export function registerIconsAtlasFrames(scene) {
  const texture = scene.textures.get(ICONS_ATLAS_KEY)
  if (!texture || texture.key === '__MISSING') {
    console.warn('[iconsAtlas] texture missing:', ICONS_ATLAS_KEY)
    return
  }
  for (const [frameName, region] of Object.entries(ICONS_ATLAS_REGIONS)) {
    if (texture.has(frameName)) continue
    texture.add(frameName, 0, region.x, region.y, region.w, region.h)
  }
}

/**
 * Icono del atlas de craft. Origin centro por defecto.
 * @param {Phaser.Scene} scene
 * @param {string} frameId
 * @param {number} x
 * @param {number} y
 * @param {{ displayWidth?: number, displayHeight?: number, originX?: number, originY?: number }} [opts]
 */
export function createIconImage(scene, frameId, x, y, opts = {}) {
  if (!ICONS_ATLAS_REGIONS[frameId]) {
    throw new Error(`[iconsAtlas] unknown frame: ${frameId}`)
  }
  const image = scene.add.image(x, y, ICONS_ATLAS_KEY, frameId)
    .setOrigin(opts.originX ?? 0.5, opts.originY ?? 0.5)
  if (opts.displayWidth != null && opts.displayHeight != null) {
    image.setDisplaySize(opts.displayWidth, opts.displayHeight)
  }
  return image
}

export function crudeIconFrame(material) {
  return `${material}_crude`
}

export function refinedIconFrame(material) {
  return `${material}_refined`
}
