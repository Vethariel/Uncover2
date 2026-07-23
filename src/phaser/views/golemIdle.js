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

/** Golem básico — idle/walk/hurt/death 4 dirs, hojas 7×4 @ 64px.
 *  Orden del sheet: down, left, right, up (igual que viajero / resto).
 */

export const GOLEM_IDLE_TEXTURE = 'golemIdle'
export const GOLEM_WALK_TEXTURE = 'golemWalk'
export const GOLEM_HURT_TEXTURE = 'golemHurt'
export const GOLEM_DEATH_TEXTURE = 'golemDeath'

const GOLEM_IDLE_FRAME_RATE = 3.5
const GOLEM_WALK_FRAME_COUNT = 7
const GOLEM_WALK_CYCLE_DISTANCE = TILE_SIZE * 3
const GOLEM_WALK_BASE_SPEED = ENEMY_TYPES.golem_basic.speed

export const GOLEM_WALK_FRAME_RATE = (
  GOLEM_WALK_BASE_SPEED / GOLEM_WALK_CYCLE_DISTANCE
) * GOLEM_WALK_FRAME_COUNT

/** down / left / right / up — 7 frames por fila. */
const ROW = {
  [DIR_DOWN]: { start: 0, end: 6 },
  [DIR_LEFT]: { start: 7, end: 13 },
  [DIR_RIGHT]: { start: 14, end: 20 },
  [DIR_UP]: { start: 21, end: 27 },
}

export const GOLEM_IDLE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem-idle-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem-idle-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem-idle-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem-idle-up', ...ROW[DIR_UP] },
}

export const GOLEM_WALK_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem-walk-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem-walk-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem-walk-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem-walk-up', ...ROW[DIR_UP] },
}

export const GOLEM_HURT_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem-hurt-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem-hurt-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem-hurt-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem-hurt-up', ...ROW[DIR_UP] },
}

export const GOLEM_DEATH_ANIMATIONS = {
  [DIR_DOWN]: { key: 'golem-death-down', ...ROW[DIR_DOWN] },
  [DIR_LEFT]: { key: 'golem-death-left', ...ROW[DIR_LEFT] },
  [DIR_RIGHT]: { key: 'golem-death-right', ...ROW[DIR_RIGHT] },
  [DIR_UP]: { key: 'golem-death-up', ...ROW[DIR_UP] },
}

export function ensureGolemAnims(scene) {
  for (const animation of Object.values(GOLEM_IDLE_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM_IDLE_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      frameRate: GOLEM_IDLE_FRAME_RATE,
      repeat: -1,
    })
  }

  for (const animation of Object.values(GOLEM_WALK_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM_WALK_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      frameRate: GOLEM_WALK_FRAME_RATE,
      repeat: -1,
    })
  }

  for (const animation of Object.values(GOLEM_HURT_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM_HURT_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      duration: GOLEM_HURT_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
  }

  for (const animation of Object.values(GOLEM_DEATH_ANIMATIONS)) {
    if (scene.anims.exists(animation.key)) continue
    scene.anims.create({
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(GOLEM_DEATH_TEXTURE, {
        start: animation.start,
        end: animation.end,
      }),
      duration: GOLEM_DEATH_ANIMATION_DURATION * 1000,
      repeat: 0,
    })
  }
}

/** @deprecated use ensureGolemAnims */
export function ensureGolemIdleAnims(scene) {
  ensureGolemAnims(scene)
}

export function createGolemSprite(scene, depth = 955) {
  ensureGolemAnims(scene)
  return scene.add.sprite(0, 0, GOLEM_IDLE_TEXTURE, 0)
    .setOrigin(0.5, 1)
    .setDepth(depth)
}

/**
 * @param {{ moved?: boolean }} [locomotion]
 */
export function syncGolemSprite(sprite, enemy, locomotion = {}) {
  if (!sprite || !enemy) return
  const feetX = enemy.posX + enemy.size / 2
  const feetY = enemy.posY + enemy.size
  sprite.setPosition(feetX, feetY)

  const facing = enemy.facing ?? DIR_DOWN

  if (!enemy.alive) {
    const death = GOLEM_DEATH_ANIMATIONS[facing] ?? GOLEM_DEATH_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = 1
    if (sprite.anims.currentAnim?.key !== death.key) {
      sprite.play(death.key, false)
    }
    return
  }

  if ((enemy.hurtAnimationTimer ?? 0) > 0) {
    const hurt = GOLEM_HURT_ANIMATIONS[facing] ?? GOLEM_HURT_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = 1
    if (sprite.anims.currentAnim?.key !== hurt.key) {
      sprite.play(hurt.key, false)
    }
    return
  }

  if (locomotion.moved) {
    const walk = GOLEM_WALK_ANIMATIONS[facing] ?? GOLEM_WALK_ANIMATIONS[DIR_DOWN]
    sprite.anims.timeScale = (enemy.speed ?? GOLEM_WALK_BASE_SPEED) / GOLEM_WALK_BASE_SPEED
    if (sprite.anims.currentAnim?.key !== walk.key) {
      const local = sprite.anims.currentAnim?.key?.startsWith('golem-walk-')
        ? (sprite.anims.currentFrame?.index ?? 0) % 7
        : 0
      sprite.play({ key: walk.key, startFrame: local })
    }
    return
  }

  const idle = GOLEM_IDLE_ANIMATIONS[facing] ?? GOLEM_IDLE_ANIMATIONS[DIR_DOWN]
  sprite.anims.timeScale = 1
  if (sprite.anims.currentAnim?.key !== idle.key) {
    const prev = sprite.anims.currentAnim?.key ?? ''
    const local = prev.startsWith('golem-hurt-') || prev.startsWith('golem-death-') || !prev
      ? Math.floor(Math.random() * 7)
      : (sprite.anims.currentFrame?.index ?? 0) % 7
    sprite.play({ key: idle.key, startFrame: local })
  }
}

/** @deprecated use syncGolemSprite */
export function syncGolemIdle(sprite, enemy) {
  syncGolemSprite(sprite, enemy)
}
