import {
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
  DIR_UP,
  PLAYER_SPEED,
  TILE_SIZE,
} from '../../config/constants.js'

// Un ciclo completo de walk (~8 frames) cubre ~3 tiles a velocidad base.
const WALK_FRAME_COUNT = 8
const WALK_CYCLE_DISTANCE = TILE_SIZE * 3

export const PLAYER_WALK_FRAME_RATE = (PLAYER_SPEED / WALK_CYCLE_DISTANCE) * WALK_FRAME_COUNT

export const PLAYER_WALK_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-walk-down', start: 0, end: 7 },
  [DIR_LEFT]: { key: 'player-walk-left', start: 8, end: 15 },
  [DIR_RIGHT]: { key: 'player-walk-right', start: 16, end: 23 },
  [DIR_UP]: { key: 'player-walk-up', start: 24, end: 31 },
}

export const PLAYER_IDLE_ANIMATIONS = {
  [DIR_DOWN]: { key: 'player-idle-down', start: 0, end: 5 },
  [DIR_LEFT]: { key: 'player-idle-left', start: 6, end: 11 },
  [DIR_RIGHT]: { key: 'player-idle-right', start: 12, end: 17 },
  [DIR_UP]: { key: 'player-idle-up', start: 18, end: 23 },
}

export function ensurePlayerLocomotionAnims(scene) {
  createAnimationSet(scene, PLAYER_WALK_ANIMATIONS, 'playerWalk', {
    frameRate: PLAYER_WALK_FRAME_RATE,
  })
  createAnimationSet(scene, PLAYER_IDLE_ANIMATIONS, 'playerIdle', {
    frameRate: 4,
  })
}

export function createPlayerSprite(scene, depth = 955) {
  return scene.add.sprite(0, 0, 'playerIdle', 0)
    // El dibujo toca el borde inferior de cada frame: los pies son el ancla.
    .setOrigin(0.5, 1)
    .setDepth(depth)
}

/**
 * Posiciona y elige walk/idle según desplazamiento desde lastPlayerPosition.
 * @returns {{ x: number, y: number } | null} nueva lastPlayerPosition
 */
export function syncPlayerLocomotion(sprite, player, lastPlayerPosition) {
  if (!player) {
    sprite.setVisible(false)
    return lastPlayerPosition
  }

  const feetX = player.posX + player.size / 2
  const feetY = player.posY + player.size
  const moved = Boolean(
    lastPlayerPosition
    && (
      Math.abs(player.posX - lastPlayerPosition.x) > 0.01
      || Math.abs(player.posY - lastPlayerPosition.y) > 0.01
    ),
  )
  const nextPosition = { x: player.posX, y: player.posY }

  sprite.setPosition(feetX, feetY).setVisible(true)

  const walkAnimation = PLAYER_WALK_ANIMATIONS[player.facing]
    ?? PLAYER_WALK_ANIMATIONS[DIR_DOWN]
  const idleAnimation = PLAYER_IDLE_ANIMATIONS[player.facing]
    ?? PLAYER_IDLE_ANIMATIONS[DIR_DOWN]

  if (moved) {
    sprite.clearTint()
    sprite.anims.timeScale = (player.speed ?? PLAYER_SPEED) / PLAYER_SPEED
    sprite.play(walkAnimation.key, true)
  } else {
    sprite.clearTint()
    sprite.anims.timeScale = 1
    sprite.play(idleAnimation.key, true)
  }

  return nextPosition
}

export function playPlayerIdle(sprite, player) {
  if (!player || !sprite) return
  const idleAnimation = PLAYER_IDLE_ANIMATIONS[player.facing]
    ?? PLAYER_IDLE_ANIMATIONS[DIR_DOWN]
  sprite.clearTint()
  sprite.anims.timeScale = 1
  sprite.play(idleAnimation.key, true)
}

function createAnimationSet(scene, animationSet, texture, {
  frameRate,
  duration,
  repeat = -1,
}) {
  for (const animation of Object.values(animationSet)) {
    if (scene.anims.exists(animation.key)) continue
    const config = {
      key: animation.key,
      frames: scene.anims.generateFrameNumbers(texture, {
        start: animation.start,
        end: animation.end,
      }),
      repeat,
    }
    if (duration !== undefined) config.duration = duration
    else config.frameRate = frameRate
    scene.anims.create(config)
  }
}

/** Usado por EntityView para el resto de sets (hurt, bomb, mine, escape). */
export function createPlayerAnimationSet(scene, animationSet, texture, options) {
  createAnimationSet(scene, animationSet, texture, options)
}
