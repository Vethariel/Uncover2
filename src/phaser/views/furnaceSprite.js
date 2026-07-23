import {
  FURNACE_FRAME_H,
  FURNACE_FRAME_W,
} from '../../config/workshopProps.js'

/** Horno del taller: frame 0 idle; frames 0–7 animación al fundir. */

export const FURNACE_TEXTURE = 'furnace'
export const FURNACE_RUN_ANIM = 'furnace-run'

/** Cadencia suave del fuego en bucle. */
const FURNACE_RUN_FRAME_RATE = 8

export function preloadFurnace(loader) {
  loader.spritesheet(FURNACE_TEXTURE, 'assets/sprites/furnace.png', {
    frameWidth: FURNACE_FRAME_W,
    frameHeight: FURNACE_FRAME_H,
  })
}

export function ensureFurnaceAnims(scene) {
  if (scene.anims.exists(FURNACE_RUN_ANIM)) return
  scene.anims.create({
    key: FURNACE_RUN_ANIM,
    frames: scene.anims.generateFrameNumbers(FURNACE_TEXTURE, {
      start: 0,
      end: 7,
    }),
    frameRate: FURNACE_RUN_FRAME_RATE,
    repeat: -1,
  })
}

/** Sprite a tamaño nativo; `origin` = esquina superior izquierda en px. */
export function createFurnaceSprite(scene, origin) {
  ensureFurnaceAnims(scene)
  return scene.add.sprite(origin.x, origin.y, FURNACE_TEXTURE, 0)
    .setOrigin(0, 0)
    .setDepth(origin.y + FURNACE_FRAME_H)
}

/** Idle = frame 0; animación mientras hay job de fundición en curso. */
export function syncFurnaceSprite(sprite, furnaceJob) {
  if (!sprite) return
  const running = Boolean(furnaceJob && !furnaceJob.ready)
  if (running) {
    if (sprite.anims.currentAnim?.key !== FURNACE_RUN_ANIM) {
      sprite.play(FURNACE_RUN_ANIM)
    }
    return
  }
  if (sprite.anims.isPlaying) sprite.anims.stop()
  sprite.setTexture(FURNACE_TEXTURE, 0)
}
