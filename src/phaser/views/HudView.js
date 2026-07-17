import { HUD_HEIGHT } from '../../config/constants.js'

export class HudView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world

    const width = scene.scale.width

    // Barra fija en pantalla (no se desplaza con la cámara).
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000)
    this.banner = scene.add.rectangle(0, 0, width, HUD_HEIGHT, 0x111820)
      .setOrigin(0)
      .setStrokeStyle(1, 0x53616d)

    this.livesText = scene.add.text(16, HUD_HEIGHT / 2, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
    }).setOrigin(0, 0.5)

    this.timerText = scene.add.text(width - 16, HUD_HEIGHT / 2, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffc857',
    }).setOrigin(1, 0.5)

    this.container.add([this.banner, this.livesText, this.timerText])
  }

  update() {
    const player = this.world.player

    this.livesText.setText(`x${Math.max(0, player.lives)}`)
    this.timerText.setText(
      this.world.levelTimer === null ? '' : `TIEMPO ${Math.ceil(this.world.levelTimer)}`,
    )
  }

  destroy() {
    this.container.destroy(true)
  }
}
