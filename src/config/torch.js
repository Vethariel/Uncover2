/** Antorcha de suelo: 9 frames de 32×32 en fila. */

export const TORCH_TEXTURE = 'torch'
export const TORCH_FRAME_W = 32
export const TORCH_FRAME_H = 32
export const TORCH_FRAME_COUNT = 9
export const TORCH_FLICKER_ANIM = 'torch-flicker'
export const TORCH_FLICKER_FRAME_RATE = 10
/** Intensidad mínima relativa al pico (frame 4). */
export const TORCH_FLICKER_MIN_FACTOR = 0.55

export function preloadTorch(loader) {
  loader.spritesheet(TORCH_TEXTURE, 'assets/sprites/torch.png', {
    frameWidth: TORCH_FRAME_W,
    frameHeight: TORCH_FRAME_H,
  })
}

export function ensureTorchAnims(scene) {
  if (scene.anims.exists(TORCH_FLICKER_ANIM)) return
  scene.anims.create({
    key: TORCH_FLICKER_ANIM,
    frames: scene.anims.generateFrameNumbers(TORCH_TEXTURE, {
      start: 0,
      end: TORCH_FRAME_COUNT - 1,
    }),
    frameRate: TORCH_FLICKER_FRAME_RATE,
    repeat: -1,
  })
}

/**
 * Frame actual (0..8) según tiempo de juego y desfase por antorcha.
 * @param {number} timeSec
 * @param {number} [phaseOffset] 0..1
 */
export function torchAnimFrame(timeSec, phaseOffset = 0) {
  const framesElapsed = timeSec * TORCH_FLICKER_FRAME_RATE
    + phaseOffset * TORCH_FRAME_COUNT
  let frame = Math.floor(framesElapsed) % TORCH_FRAME_COUNT
  if (frame < 0) frame += TORCH_FRAME_COUNT
  return frame
}

/**
 * Onda 0..1 con pico en frame 4 (sinusoide sobre el ciclo de 9 frames).
 * @param {number} frame
 */
export function torchFlickerFactor(frame) {
  return 0.5 + 0.5 * Math.cos(
    ((frame - 4) / TORCH_FRAME_COUNT) * Math.PI * 2,
  )
}

/**
 * Intensidad de luz de antorcha; pico = baseStrength en frame 4.
 * @param {number} frame
 * @param {number} baseStrength
 */
export function torchLightIntensity(frame, baseStrength) {
  const wave = torchFlickerFactor(frame)
  return baseStrength * (
    TORCH_FLICKER_MIN_FACTOR + (1 - TORCH_FLICKER_MIN_FACTOR) * wave
  )
}
