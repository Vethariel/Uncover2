/** Fade-to-black entre escenas / niveles. */
export const BLACKOUT_FADE_MS = 500
export const BLACKOUT_HOLD_MS = 1000
export const BLACKOUT_DEPTH = 20000
export const BLACKOUT_DATA_KEY = 'blackoutFadeIn'

/**
 * Oscurece → mantiene negro → ejecuta onBlack → (opcional) revela.
 *
 * - sameScene: true cuando no hay scene.start (p. ej. N1→N2). Tras onBlack
 *   se crea un cover nuevo a alpha 1 y se desvanece.
 * - Cross-scene: en onBlack hacer scene.start(..., { [BLACKOUT_DATA_KEY]: true })
 *   y llamar maybeFadeInFromBlackout en create() de la escena destino.
 *
 * @returns {boolean} false si ya hay un blackout en curso
 */
export function runBlackout(scene, { onBlack, onReveal, sameScene = false } = {}) {
  if (scene._blackoutRunning) return false
  scene._blackoutRunning = true

  const cover = createCover(scene, 0)

  scene.tweens.add({
    targets: cover,
    alpha: 1,
    duration: BLACKOUT_FADE_MS,
    ease: 'Linear',
    onComplete: () => {
      scene.time.delayedCall(BLACKOUT_HOLD_MS, () => {
        onBlack?.()

        if (!sameScene) {
          // La escena actual se apaga; no hace falta limpiar el flag.
          return
        }

        // onBlack pudo destruir el cover (cleanup de nivel).
        if (cover.active) cover.destroy()

        const reveal = createCover(scene, 1)
        scene._blackoutRunning = false
        scene.tweens.add({
          targets: reveal,
          alpha: 0,
          duration: BLACKOUT_FADE_MS,
          ease: 'Linear',
          onComplete: () => {
            if (reveal.active) reveal.destroy()
            onReveal?.()
          },
        })
      })
    },
  })

  return true
}

/**
 * Lee y consume el flag de fade-in (Phaser retiene data entre start() sin args).
 */
export function takeBlackoutFadeIn(data) {
  if (!data?.[BLACKOUT_DATA_KEY]) return false
  data[BLACKOUT_DATA_KEY] = false
  return true
}

/**
 * Parte en negro y revela. Llamar al final de create() si takeBlackoutFadeIn fue true.
 */
export function maybeFadeInFromBlackout(scene, onComplete) {
  const cover = createCover(scene, 1)
  scene.tweens.add({
    targets: cover,
    alpha: 0,
    duration: BLACKOUT_FADE_MS,
    ease: 'Linear',
    onComplete: () => {
      if (cover.active) cover.destroy()
      onComplete?.()
    },
  })
  return true
}

function createCover(scene, alpha) {
  return scene.add.rectangle(
    0,
    0,
    scene.scale.width,
    scene.scale.height,
    0x000000,
    1,
  )
    .setOrigin(0, 0)
    .setScrollFactor(0)
    .setDepth(BLACKOUT_DEPTH)
    .setAlpha(alpha)
}
