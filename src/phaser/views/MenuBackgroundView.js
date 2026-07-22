import Phaser from 'phaser'

/** Matches creation GIF delay (~8 centiseconds). */
export const MENU_FRAME_RATE = 12.5
export const MENU_BREATH_FRAMES = 22
export const MENU_HEAD_FRAMES = 23

const BREATH_KEY = 'menuBreath'
const HEAD_KEY = 'menuHead'
const EXIT_KEY = 'menuBreathExit'
const ANIM_BREATH = 'menu_breath'
const ANIM_HEAD = 'menu_head'

/**
 * Register menu background textures (call from PreloadScene.preload).
 * @param {Phaser.Loader.LoaderPlugin} load
 */
export function preloadMenuBackground(load) {
  load.spritesheet(BREATH_KEY, 'assets/ui/menu/menu_breath.png', {
    frameWidth: 640,
    frameHeight: 360,
  })
  load.spritesheet(HEAD_KEY, 'assets/ui/menu/menu_head.png', {
    frameWidth: 640,
    frameHeight: 360,
  })
  load.image(EXIT_KEY, 'assets/ui/menu/menu_breath_exit.png')
}

/**
 * @param {Phaser.Scene} scene
 */
export function ensureMenuAnims(scene) {
  if (scene.anims.exists(ANIM_BREATH)) return

  scene.anims.create({
    key: ANIM_BREATH,
    frames: scene.anims.generateFrameNumbers(BREATH_KEY, {
      start: 0,
      end: MENU_BREATH_FRAMES - 1,
    }),
    frameRate: MENU_FRAME_RATE,
    repeat: 0,
  })
  scene.anims.create({
    key: ANIM_HEAD,
    frames: scene.anims.generateFrameNumbers(HEAD_KEY, {
      start: 0,
      end: MENU_HEAD_FRAMES - 1,
    }),
    frameRate: MENU_FRAME_RATE,
    repeat: 0,
  })
}

/**
 * Full-bleed menu art: breath idle loop with occasional head-look insert.
 */
export class MenuBackgroundView {
  /**
   * @param {Phaser.Scene} scene
   * @param {{ minBreathLoops?: number, maxBreathLoops?: number }} [opts]
   */
  constructor(scene, opts = {}) {
    this.scene = scene
    this.minBreathLoops = opts.minBreathLoops ?? 2
    this.maxBreathLoops = opts.maxBreathLoops ?? 4
    this._destroyed = false
    this._exitTimer = null
    this._breathsLeft = 0

    ensureMenuAnims(scene)

    this.sprite = scene.add
      .sprite(0, 0, BREATH_KEY, 0)
      .setOrigin(0, 0)
      .setDepth(0)

    scene.events.once('shutdown', this.destroy, this)
    scene.events.once('destroy', this.destroy, this)

    this._startBreathCycle()
  }

  _randBreathLoops() {
    return Phaser.Math.Between(this.minBreathLoops, this.maxBreathLoops)
  }

  _startBreathCycle() {
    if (this._destroyed) return
    this._breathsLeft = this._randBreathLoops()
    this._playBreathOnce()
  }

  _playBreathOnce() {
    if (this._destroyed) return
    this.sprite.setTexture(BREATH_KEY)
    this.sprite.play(ANIM_BREATH)
    this.sprite.once(`animationcomplete-${ANIM_BREATH}`, this._onBreathComplete, this)
  }

  _onBreathComplete() {
    if (this._destroyed) return
    this._breathsLeft -= 1
    if (this._breathsLeft > 0) {
      this._playBreathOnce()
      return
    }
    this._playHead()
  }

  _playHead() {
    if (this._destroyed) return
    this.sprite.anims.stop()
    this.sprite.setTexture(EXIT_KEY)
    const frameMs = 1000 / MENU_FRAME_RATE
    this._exitTimer = this.scene.time.delayedCall(frameMs, () => {
      this._exitTimer = null
      if (this._destroyed) return
      this.sprite.setTexture(HEAD_KEY)
      this.sprite.play(ANIM_HEAD)
      this.sprite.once(`animationcomplete-${ANIM_HEAD}`, this._onHeadComplete, this)
    })
  }

  _onHeadComplete() {
    if (this._destroyed) return
    this._startBreathCycle()
  }

  destroy() {
    if (this._destroyed) return
    this._destroyed = true
    this.sprite?.off(`animationcomplete-${ANIM_BREATH}`, this._onBreathComplete, this)
    this.sprite?.off(`animationcomplete-${ANIM_HEAD}`, this._onHeadComplete, this)
    this._exitTimer?.remove(false)
    this._exitTimer = null
    this.sprite?.destroy()
    this.sprite = null
  }
}
