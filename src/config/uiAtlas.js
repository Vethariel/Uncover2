/** Atlas UI compacto 112×288 — celda 16px. 9-slice: solo 2 px centrales se estiran. */

export const UI_ATLAS_KEY = 'uiAtlas'
export const UI_ATLAS_PATH = 'assets/ui/ui_atlas.png'
export const UI_ATLAS_CELL = 16
export const UI_ATLAS_WIDTH = 112
export const UI_ATLAS_HEIGHT = 288
/** Ancho/alto del tramo estirable en 9-slice (centro). */
export const UI_SLICE_CENTER = 2

/**
 * @typedef {{ x: number, y: number, w: number, h: number, nineSlice?: boolean }} UiAtlasRegion
 */

/** @type {Record<string, UiAtlasRegion>} */
export const UI_ATLAS_REGIONS = {
  // Columna 1 (3 celdas)
  tutorial_frame: { x: 0, y: 0, w: 48, h: 48, nineSlice: true },
  workshop_texture: { x: 0, y: 48, w: 48, h: 48 },
  hud_frame: { x: 0, y: 96, w: 48, h: 48, nineSlice: true },
  dialogue_frame: { x: 0, y: 144, w: 48, h: 48, nineSlice: true },
  button: { x: 0, y: 192, w: 48, h: 32, nineSlice: true },
  hud_background: { x: 0, y: 224, w: 48, h: 48 },

  // Columna 2 — bordes H del tutorial + iconos
  tutorial_edge_top: { x: 48, y: 0, w: 32, h: 16 },
  tutorial_edge_bottom: { x: 48, y: 16, w: 32, h: 16 },
  heart_icon: { x: 48, y: 32, w: 32, h: 32 },
  iron_icon: { x: 48, y: 64, w: 32, h: 32 },
  bronze_icon: { x: 48, y: 96, w: 32, h: 32 },
  crystal_icon: { x: 48, y: 128, w: 32, h: 32 },
  fragment_icon: { x: 48, y: 160, w: 32, h: 32 },

  // Columna 3 — placeholders + estaciones + scrollbar
  item_placeholder: { x: 80, y: 0, w: 32, h: 32, nineSlice: true },
  rare_placeholder: { x: 80, y: 32, w: 32, h: 32, nineSlice: true },
  legendary_placeholder: { x: 80, y: 64, w: 32, h: 32, nineSlice: true },
  anvil_icon: { x: 80, y: 96, w: 32, h: 32 },
  forge_icon: { x: 80, y: 128, w: 32, h: 32 },
  scrollbar_track: { x: 80, y: 160, w: 16, h: 32, nineSlice: true },
  scrollbar_thumb: { x: 96, y: 160, w: 16, h: 32, nineSlice: true },

  // Marcos anchos (cols 2+3)
  portrait_frame: { x: 48, y: 192, w: 64, h: 48, nineSlice: true },
  workshop_frame: { x: 48, y: 240, w: 64, h: 48, nineSlice: true },
}

/**
 * Insets Phaser NineSlice: bordes fijos, centro de `center` px estirable.
 * @param {number} width
 * @param {number} height
 * @param {number} [center=UI_SLICE_CENTER]
 */
export function uiSliceInsets(width, height, center = UI_SLICE_CENTER) {
  const c = Math.max(1, Math.min(center, width, height))
  const left = Math.floor((width - c) / 2)
  const right = width - c - left
  const top = Math.floor((height - c) / 2)
  const bottom = height - c - top
  return { left, right, top, bottom, center: c }
}

/**
 * @param {string} regionId
 * @returns {{ left: number, right: number, top: number, bottom: number, center: number } | null}
 */
export function uiRegionSliceInsets(regionId) {
  const region = UI_ATLAS_REGIONS[regionId]
  if (!region?.nineSlice) return null
  return uiSliceInsets(region.w, region.h)
}
