import Phaser from 'phaser'
import { session } from '../../core/session.js'

export class InputAdapter {
  constructor(scene) {
    this.scene = scene
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      upArrow: Phaser.Input.Keyboard.KeyCodes.UP,
      downArrow: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArrow: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArrow: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      bomb: Phaser.Input.Keyboard.KeyCodes.SPACE,
      mine: Phaser.Input.Keyboard.KeyCodes.Q,
      debugMine: Phaser.Input.Keyboard.KeyCodes.T,
      debugTeleportExit: Phaser.Input.Keyboard.KeyCodes.Y,
      interact: Phaser.Input.Keyboard.KeyCodes.E,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC,
    })

    this.justPressed = new Set()
    scene.input.keyboard.on('keydown', (event) => {
      this.justPressed.add(event.code)
    })
  }

  _devEnabled() {
    return Boolean(session.gameState?.isDevMode?.())
  }

  isDown(action) {
    switch (action) {
      case 'up':
        return this.keys.up.isDown || this.keys.upArrow.isDown
      case 'down':
        return this.keys.down.isDown || this.keys.downArrow.isDown
      case 'left':
        return this.keys.left.isDown || this.keys.leftArrow.isDown
      case 'right':
        return this.keys.right.isDown || this.keys.rightArrow.isDown
      case 'bomb':
        return this.keys.bomb.isDown
      case 'mine':
        return this.keys.mine.isDown
      case 'interact':
        return this.keys.interact.isDown
      default:
        return false
    }
  }

  isJustDown(action) {
    switch (action) {
      case 'enter':
        return Phaser.Input.Keyboard.JustDown(this.keys.enter)
      case 'escape':
        return Phaser.Input.Keyboard.JustDown(this.keys.escape)
      case 'left':
        return Phaser.Input.Keyboard.JustDown(this.keys.left) || Phaser.Input.Keyboard.JustDown(this.keys.leftArrow)
      case 'right':
        return Phaser.Input.Keyboard.JustDown(this.keys.right) || Phaser.Input.Keyboard.JustDown(this.keys.rightArrow)
      case 'bomb':
        return Phaser.Input.Keyboard.JustDown(this.keys.bomb)
      case 'interact':
        return Phaser.Input.Keyboard.JustDown(this.keys.interact)
      case 'debugMine':
        return this._devEnabled() && Phaser.Input.Keyboard.JustDown(this.keys.debugMine)
      case 'debugTeleportExit':
        return this._devEnabled() && Phaser.Input.Keyboard.JustDown(this.keys.debugTeleportExit)
      case 'mouse':
        return this.scene.input.activePointer.isDown && this.justPressed.has('pointer')
      default:
        return false
    }
  }

  flush() {
    this.justPressed.clear()
  }
}
