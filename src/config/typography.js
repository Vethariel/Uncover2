/** Tipografía dual Uncover — natural, tono nórdico de oficio (no pixel). */

/** Display: germánica / tallada (títulos, botones). */
export const FONT_DISPLAY = 'Germania One'
/** Body: serif islandesa, legible en diálogo y HUD. */
export const FONT_BODY = 'Yrsa'

export const FONT_WEIGHT_DISPLAY = '400'
export const FONT_WEIGHT_BODY = '400'

/** Tamaños pensados para 640×360 con tipografía vectorial. */
export const FONT_SIZE_DISPLAY_LG = 18
export const FONT_SIZE_DISPLAY = 15
export const FONT_SIZE_BODY = 13
export const FONT_SIZE_HUD = 11
export const FONT_SIZE_HINT = 10

export const COLOR_TITLE = '#ffc857'
export const COLOR_BODY = '#f0f2f4'
export const COLOR_MUTED = '#9aa3ad'
export const COLOR_HUD = '#c8d0d8'

/**
 * @param {Record<string, unknown>} [overrides]
 * @returns {Phaser.Types.GameObjects.Text.TextStyle}
 */
export function textStyleDisplay(overrides = {}) {
  return {
    fontFamily: FONT_DISPLAY,
    fontStyle: FONT_WEIGHT_DISPLAY,
    fontSize: `${FONT_SIZE_DISPLAY}px`,
    color: COLOR_TITLE,
    ...overrides,
  }
}

/**
 * @param {Record<string, unknown>} [overrides]
 * @returns {Phaser.Types.GameObjects.Text.TextStyle}
 */
export function textStyleBody(overrides = {}) {
  return {
    fontFamily: FONT_BODY,
    fontStyle: FONT_WEIGHT_BODY,
    fontSize: `${FONT_SIZE_BODY}px`,
    color: COLOR_BODY,
    ...overrides,
  }
}

/**
 * Espera a que las caras tipográficas estén listas para medir en canvas.
 * @returns {Promise<void>}
 */
export async function waitForGameFonts() {
  if (typeof document === 'undefined' || !document.fonts) return
  await Promise.all([
    document.fonts.load(`${FONT_WEIGHT_DISPLAY} ${FONT_SIZE_DISPLAY_LG}px "${FONT_DISPLAY}"`),
    document.fonts.load(`${FONT_WEIGHT_BODY} ${FONT_SIZE_BODY}px "${FONT_BODY}"`),
  ])
  await document.fonts.ready
}
