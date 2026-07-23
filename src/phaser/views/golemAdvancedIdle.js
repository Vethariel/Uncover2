import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  TILE_SIZE,
} from '../../config/constants.js'
import {
  ENEMY_TYPES,
  GOLEM_DEATH_ANIMATION_DURATION,
  GOLEM_HURT_ANIMATION_DURATION,
} from '../../config/enemyTypes.js'

/** Golem avanzado — idle/walk/hurt/death (DLRU, 7×4 @ 64px). */

export const GOLEM2_IDLE_TEXTURE = 'golem2Idle'
export const GOLEM2_WALK_TEXTURE = 'golem2Walk'
export const GOLEM2_HURT_TEXTURE = 'golem2Hurt'
export const GOLEM2_DEATH_TEXTURE = 'golem2Death'

const GOLEM2_IDLE_FRAME_RATE = 3.5
const GOLEM2_WALK_FRAME_COUNT = 7
const GOLEM2_WALK_CYCLE_DISTANCE = TILE_SIZE * 3
const GOLEM2_WALK_BASE_SPEED = ENEMY_TYPES.golem_advanced.speed

export const GOLEM2_WALK_FRAME_RATE = (
  GOLEM2_WALK_BASE_SPEED / GOLEM2_WALK_CYCLE_DISTANCE
) * GOLEM2_WALK_FRAME_COUNT

const ROW = {
  [DIR_DOWN]: { start: 0, end: 6 },
  [DIR_LEFT]: { start: 7, end: 13 },
  [DIR_RIGHT]: { start: 14, end: 20 },
  [DIR_UP]: { start: 21, end: 27 },
}

export const GOLEM2_IDLE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem2-idle-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem2-idle-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem2-idle-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem2-idle-up', ...ROW[DIR_UP] },
}

export const GOLEM2_WALK_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem2-walk-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem2-walk-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem2-walk-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem2-walk-up', ...ROW[DIR_UP] },
}

export const GOLEM2_HURT_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem2-hurt-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem2-hurt-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem2-hurt-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem2-hurt-up', ...ROW[DIR_UP] },
}

export const GOLEM2_DEATH_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem2-death-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem2-death-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem2-death-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem2-death-up', ...ROW[DIR_UP] },
}

export function ensureGolem2Anims(scene) {
  for (const animation of Object.values(GOLEM2_IDLE_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM2_IDLE_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      frameRate: GOLEM2_IDLE_FRAME_RATE,
      repeat: -1,
    })
  }

  for (const animation of Object.values(GOLEM2_WALK_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM2_WALK_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      frameRate: GOLEM2_WALK_FRAME_RATE,
      repeat: -1,
    })
  }

  for (const animation of Object.values(GOLEM2_HURT_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM2_HURT_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      duration: GOLEM_HURT_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
  }

  for (const animation of Object.values(GOLEM2_DEATH_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM2_DEATH_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      duration: GOLEM_DEATH_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
  }
}

export function createGolem2Sprite(scene, depth = 955) {
  ensureGolem2Anims(scene)
  return scene.add.sprite(0, 0, GOLEM2_IDLE_TEXTURE, 0)
    .setOrigin(0.5, 1)
    .setDepth(depth)
}

/**
 * @param {{ moved?: boolean }} [locomotion]
 */
export function syncGolem2Sprite(sprite, enemy, locomotion = {}) {
  if (!sprite || !enemy) return
  const feetX = enemy.posX + enemy.size / 2
  const feetY = enemy.posY + enemy.size
  sprite.setPosition(feetX, feetY)

  const facing = enemy.facing ?? DIR_DOWN

  if (!enemy.alive) {
    const death = GOLEM2_DEATH_ANIMATIONS[facing] ?? GOLEM2_DEATH_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = 1
    if (sprite.anims.currentAnim?.key !== death.key) {
      sprite.play(death.key, false)
    }
    return
  }

  if ((enemy.hurtAnimationTimer ?? 0) > 0) {
    const hurt = GOLEM2_HURT_ANIMATIONS[facing] ?? GOLEM2_HURT_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = 1
    if (sprite.anims.currentAnim?.key !== hurt.key) {
      sprite.play(hurt.key, false)
    }
    return
  }

  if (locomotion.moved) {
    const walk = GOLEM2_WALK_ANIMATIONS[facing] ?? GOLEM2_WALK_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = (
      (enemy.speed ?? GOLEM2_WALK_BASE_SPEED) / GOLEM2_WALK_BASE_SPEED
    )
    if (sprite.anims.currentAnim?.key !== walk.key) {
      const local = sprite.anims.currentAnim?.key?.startsWith('golem2-walk-')
        ? (sprite.anims.currentFrame?.index ?? 0) % 7
        : 0
      sprite.play({ key: walk.key, startFrame: local })
    }
    return
  }

  const idle = GOLEM2_IDLE_ANIMATIONS[facing] ?? GOLEM2_IDLE_ANIMATIONS[DIR_DOWN]
  sprite.anims.timeScale = 1
  if (sprite.anims.currentAnim?.key !== idle.key) {
    const prev = sprite.anims.currentAnim?.key ?? ''
    const local = prev.startsWith('golem2-hurt-') || prev.startsWith('golem2-death-') || !prev
      ? Math.floor(Math.random() * 7)
      : (sprite.anims.currentFrame?.index ?? 0) % 7
    sprite.play({ key: idle.key, startFrame: local })
  } else if (!sprite.anims.isPlaying) {
    sprite.anims.resume()
  }
}
