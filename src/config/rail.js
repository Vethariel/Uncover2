/** Riel de pasillo: tile 32×32 (orientación vertical nativa). */

export const RAIL_TEXTURE = 'rail'
export const RAIL_FRAME_W = 32
export const RAIL_FRAME_H = 32

export function preloadRail(loader) {
  loader.image(RAIL_TEXTURE, 'assets/sprites/rail.png')
}

/** Rotación (rad) desde el asset vertical. */
export function railRotation(orientation) {
  return orientation === 'horizontal' ? Math.PI / 2 : 0
}
