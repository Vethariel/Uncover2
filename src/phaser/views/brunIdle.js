/** Idle frontal de Brun — misma hoja que player-idle-down, cadencia un poco más lenta
 *  para no respirar a la par del viajero en el taller. */

export const BRUN_IDLE_TEXTURE = 'brunIdle'
export const BRUN_IDLE_ANIM = 'brun-idle'

/** playerIdle usa 4; Brun un poco más lento rompe la sincronía visual. */
const BRUN_IDLE_FRAME_RATE = 3.35
/** Arranque a mitad del ciclo por si ambos se crean el mismo frame. */
const BRUN_IDLE_START_FRAME = 3

export function ensureBrunIdleAnim(scene) {
  if (scene.anims.exists(BRUN_IDLE_ANIM)) return
  scene.anims.create({
    key: BRUN_IDLE_ANIM,
    frames: scene.anims.generateFrameNumbers(BRUN_IDLE_TEXTURE, {
      start: 0,
      end: 5,
    }),
    frameRate: BRUN_IDLE_FRAME_RATE,
    repeat: -1,
  })
}

export function createBrunSprite(scene, depth = 8) {
  ensureBrunIdleAnim(scene)
  const sprite = scene.add.sprite(0, 0, BRUN_IDLE_TEXTURE, BRUN_IDLE_START_FRAME)
    .setOrigin(0.5, 1)
    .setDepth(depth)
  sprite.play({ key: BRUN_IDLE_ANIM, startFrame: BRUN_IDLE_START_FRAME })
  return sprite
}

/** Ancla pies al borde inferior del tile (igual que el viajero). */
export function placeBrunOnTile(sprite, tile, tileSize) {
  const feetX = tile.x * tileSize + tileSize / 2
  const feetY = (tile.y + 1) * tileSize
  sprite.setPosition(feetX, feetY).setVisible(true)
}
