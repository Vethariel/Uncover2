/** Idle frontal del Primer Excavador — misma hoja 6×64 que Brun/player-down. */

export const EXCAVATOR_IDLE_TEXTURE = 'excavatorIdle'
export const EXCAVATOR_IDLE_ANIM = 'excavator-idle'

/** Distinto de player (4) y Brun (3.35) para no respirar a la par. */
const EXCAVATOR_IDLE_FRAME_RATE = 3.7
const EXCAVATOR_IDLE_START_FRAME = 1

export function ensureExcavatorIdleAnim(scene) {
  if (scene.anims.exists(EXCAVATOR_IDLE_ANIM)) return
  scene.anims.create({
    key: EXCAVATOR_IDLE_ANIM,
    frames: scene.anims.generateFrameNumbers(EXCAVATOR_IDLE_TEXTURE, {
      start: 0,
      end: 5,
    }),
    frameRate: EXCAVATOR_IDLE_FRAME_RATE,
    repeat: -1,
  })
}

export function createExcavatorSprite(scene, depth = 8) {
  ensureExcavatorIdleAnim(scene)
  const sprite = scene.add.sprite(0, 0, EXCAVATOR_IDLE_TEXTURE, EXCAVATOR_IDLE_START_FRAME)
    .setOrigin(0.5, 1)
    .setDepth(depth)
  sprite.play({ key: EXCAVATOR_IDLE_ANIM, startFrame: EXCAVATOR_IDLE_START_FRAME })
  return sprite
}

/** Ancla pies al borde inferior del tile. */
export function placeExcavatorOnTile(sprite, tile, tileSize) {
  const feetX = tile.x * tileSize + tileSize / 2
  const feetY = (tile.y + 1) * tileSize
  sprite.setPosition(feetX, feetY).setVisible(true)
}

/** Depth sobre niebla (950) y bajo HUD (1000), ordenado por pies Y. */
export function levelActorDepth(feetY) {
  return 955 + feetY * 0.01
}
