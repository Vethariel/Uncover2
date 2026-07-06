import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from '../config/constants.js'

/** Escala entera vía Phaser Scale (sin CSS manual en el canvas). */
export function setupIntegerScale(game) {
  let lastZoom = 0

  const apply = () => {
    const zoom = Math.max(
      1,
      Math.floor(Math.min(window.innerWidth / INTERNAL_WIDTH, window.innerHeight / INTERNAL_HEIGHT)),
    )
    // setZoom dispara RESIZE; no reentrar si el zoom no cambió.
    if (zoom === lastZoom) return
    lastZoom = zoom
    game.scale.setZoom(zoom)
  }

  apply()
  window.addEventListener('resize', apply)
  game.events.once('destroy', () => {
    window.removeEventListener('resize', apply)
  })
}
