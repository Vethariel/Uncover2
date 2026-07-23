import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
} from '../../config/constants.js'
import {
  ENEMY_TYPES,
  SPIRIT_DEATH_ANIMATION_DURATION,
} from '../../config/enemyTypes.js'

/** Espíritu — float (idle+walk) y death; DLRU, 7×4 @ 64px. */

export const SPIRIT_FLOAT_TEXTURE = 'spiritFloat'
export const SPIRIT_DEATH_TEXTURE = 'spiritDeath'

const SPIRIT_FLOAT_FRAME_RATE = 6
const SPIRIT_BASE_SPEED = ENEMY_TYPES.spirit.speed

const ROW = {
  [DIR_DOWN]: { start: 0, end: 6 },
  [DIR_LEFT]: { start: 7, end: 13 },
  [DIR_RIGHT]: { start: 14, end: 20 },
  [DIR_UP]: { start: 21, end: 27 },
}

export const SPIRIT_FLOAT_ANIMATIONS = {
  [DIR_DOWN]: { key: 'spirit-float-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'spirit-float-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'spirit-float-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'spirit-float-up', ...ROW[DIR_UP] },
}

export const SPIRIT_DEATH_ANIMATIONS = {
  [DIR_DOWN]: { key: 'spirit-death-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'spirit-death-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'spirit-death-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'spirit-death-up', ...ROW[DIR_UP] },
}

export function ensureSpiritAnims(scene) {
  for (const animation of Object.values(SPIRIT_FLOAT_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(SPIRIT_FLOAT_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      frameRate: SPIRIT_FLOAT_FRAME_RATE,
      repeat: -1,
    })
  }

  for (const animation of Object.values(SPIRIT_DEATH_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(SPIRIT_DEATH_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      duration: SPIRIT_DEATH_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
  }
}

export function createSpiritSprite(scene, depth = 955) {
  ensureSpiritAnims(scene)
  return scene.add.sprite(0, 0, SPIRIT_FLOAT_TEXTURE, 0)
    .setOrigin(0.5, 1)
    .setDepth(depth)
}

/**
 * Misma animación flotando en idle y walk; al moverse solo acelera un poco.
 * @param {{ moved?: boolean }} [locomotion]
 */
export function syncSpiritSprite(sprite, enemy, locomotion = {}) {
  if (!sprite || !enemy) return
  const feetX = enemy.posX + enemy.size / 2
  const feetY = enemy.posY + enemy.size
  sprite.setPosition(feetX, feetY)

  const facing = enemy.facing ?? DIR_DOWN

  if (!enemy.alive) {
    const death = SPIRIT_DEATH_ANIMATIONS[facing] ?? SPIRIT_DEATH_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = 1
    if (sprite.anims.currentAnim?.key !== death.key) {
      sprite.play(death.key, false)
    }
    return
  }

  const float = SPIRIT_FLOAT_ANIMATIONS[facing] ?? SPIRIT_FLOAT_ANIMATIONS[DIR_DOWN]
  const speed = enemy.speed ?? SPIRIT_BASE_SPEED
  // Pasivo ~1×; agresivo/más rápido flota un poco más vivo.
  sprite.anims.timeScale = Math.max(0.85, speed / SPIRIT_BASE_SPEED)
  if (locomotion.moved) {
    sprite.anims.timeScale *= 1.15
  }

  if (sprite.anims.currentAnim?.key !== float.key) {
    const local = sprite.anims.currentAnim
      ? (sprite.anims.currentFrame?.index ?? 0) % 7
      : Math.floor(Math.random() * 7)
    sprite.play({ key: float.key, startFrame: local })
  } else if (!sprite.anims.isPlaying) {
    sprite.anims.resume()
  }
}
