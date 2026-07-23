import {
  ANVIL_FRAME_COUNT,
  ANVIL_FRAME_H,
  ANVIL_FRAME_W,
} from '../../config/workshopProps.js'

/** Yunque del taller: frame 0 idle; frames 0–6 animación al forjar. */

export const ANVIL_TEXTURE = 'anvil'
export const ANVIL_RUN_ANIM = 'anvil-run'

const ANVIL_RUN_FRAME_RATE = 10

export function preloadAnvil(loader) {
  loader.spritesheet(ANVIL_TEXTURE, 'assets/sprites/anvil.png', {
    frameWidth: ANVIL_FRAME_W,
    frameHeight: ANVIL_FRAME_H,
  })
}

export function ensureAnvilAnims(scene) {
  if (scene.anims.exists(ANVIL_RUN_ANIM)) return
  scene.anims.create({
    key: ANVIL_RUN_ANIM,
    frames: scene.anims.generateFrameNumbers(ANVIL_TEXTURE, {
      start: 0,
      end: ANVIL_FRAME_COUNT - 1,
    }),
    frameRate: ANVIL_RUN_FRAME_RATE,
    repeat: -1,
  })
}

/** Sprite a tamaño nativo; `origin` = esquina superior izquierda en px. */
export function createAnvilSprite(scene, origin) {
  ensureAnvilAnims(scene)
  return scene.add.sprite(origin.x, origin.y, ANVIL_TEXTURE, 0)
    .setOrigin(0, 0)
    .setDepth(origin.y + ANVIL_FRAME_H)
}

/** Idle = frame 0; animación mientras hay job de forja en curso. */
export function syncAnvilSprite(sprite, anvilJob) {
  if (!sprite) return
  const running = Boolean(anvilJob)
  if (running) {
    if (sprite.anims.currentAnim?.key !== ANVIL_RUN_ANIM) {
      sprite.play(ANVIL_RUN_ANIM)
    }
    return
  }
  if (sprite.anims.isPlaying) sprite.anims.stop()
  sprite.setTexture(ANVIL_TEXTURE, 0)
}
