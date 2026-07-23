/** Atlas de iconos de craft/taller — frames 32×32 en grilla 9×N. */

export const ICONS_ATLAS_KEY = 'iconsAtlas'
export const ICONS_ATLAS_PATH = 'assets/ui/icons_atlas.png'
export const ICONS_ATLAS_CELL = 32
export const ICONS_ATLAS_COLS = 9
export const ICONS_ATLAS_WIDTH = 288
export const ICONS_ATLAS_HEIGHT = 128

/**
 * @typedef {{ x: number, y: number, w: number, h: number }} IconAtlasRegion
 */

/** @type {Record<string, IconAtlasRegion>} */
export const ICONS_ATLAS_REGIONS = {
  bronze_crude: { x: 0, y: 0, w: 32, h: 32 },
  iron_crude: { x: 32, y: 0, w: 32, h: 32 },
  crystal_crude: { x: 64, y: 0, w: 32, h: 32 },
  bronze_refined: { x: 96, y: 0, w: 32, h: 32 },
  iron_refined: { x: 128, y: 0, w: 32, h: 32 },
  crystal_refined: { x: 160, y: 0, w: 32, h: 32 },
  fragment_generic: { x: 192, y: 0, w: 32, h: 32 },
  fragment_specialized: { x: 224, y: 0, w: 32, h: 32 },
  schematic_scroll: { x: 256, y: 0, w: 32, h: 32 },

  seal_maxBombs_1: { x: 0, y: 32, w: 32, h: 32 },
  seal_maxBombs_2: { x: 32, y: 32, w: 32, h: 32 },
  seal_maxBombs_3: { x: 64, y: 32, w: 32, h: 32 },
  seal_bombRange_1: { x: 96, y: 32, w: 32, h: 32 },
  seal_bombRange_2: { x: 128, y: 32, w: 32, h: 32 },
  seal_bombRange_3: { x: 160, y: 32, w: 32, h: 32 },
  seal_pickSpeed_1: { x: 192, y: 32, w: 32, h: 32 },
  seal_pickSpeed_2: { x: 224, y: 32, w: 32, h: 32 },
  seal_pickSpeed_3: { x: 256, y: 32, w: 32, h: 32 },

  seal_fortune_1: { x: 0, y: 64, w: 32, h: 32 },
  seal_fortune_2: { x: 32, y: 64, w: 32, h: 32 },
  seal_fortune_3: { x: 64, y: 64, w: 32, h: 32 },
  seal_moveSpeed_1: { x: 96, y: 64, w: 32, h: 32 },
  seal_moveSpeed_2: { x: 128, y: 64, w: 32, h: 32 },
  seal_moveSpeed_3: { x: 160, y: 64, w: 32, h: 32 },
  seal_maxLives_1: { x: 192, y: 64, w: 32, h: 32 },
  seal_maxLives_2: { x: 224, y: 64, w: 32, h: 32 },
  seal_maxLives_3: { x: 256, y: 64, w: 32, h: 32 },

  crystal_alloy: { x: 0, y: 96, w: 32, h: 32 },
}

/** Frame de sello por mejora + rango (1–3). */
export function sealIconFrame(upgradeId, rank) {
  return `seal_${upgradeId}_${rank}`
}
