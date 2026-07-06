import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from '../config/constants.js'

export function setupIntegerScale(game) {
  const apply = () => {
    const scale = Math.max(
      1,
      Math.floor(Math.min(window.innerWidth / INTERNAL_WIDTH, window.innerHeight / INTERNAL_HEIGHT)),
    )

    const displayW = INTERNAL_WIDTH * scale
    const displayH = INTERNAL_HEIGHT * scale
    const canvas = game.canvas

    canvas.style.width = `${displayW}px`
    canvas.style.height = `${displayH}px`
    canvas.style.left = `${Math.floor((window.innerWidth - displayW) / 2)}px`
    canvas.style.top = `${Math.floor((window.innerHeight - displayH) / 2)}px`
  }

  apply()
  window.addEventListener('resize', apply)
  game.events.once('destroy', () => window.removeEventListener('resize', apply))
}
