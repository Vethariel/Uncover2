import Phaser from 'phaser'
import { session } from '../../core/session.js'
import { LEVELS } from '../../config/levels.js'

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelect')
  }

  create() {
    this.gameState = session.gameState
    this.selectedIndex = Math.min(
      Math.max(0, this.gameState.currentLevelIndex),
      LEVELS.length - 1,
    )

    this.add.text(this.scale.width / 2, 24, 'SELECT LEVEL', {
      fontSize: '16px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.add.text(this.scale.width / 2, 42, 'DEBUG — todos los niveles abiertos', {
      fontSize: '8px',
      color: '#ffc857',
    }).setOrigin(0.5)

    this.cards = []
    this._drawCards()

    this.labelText = this.add.text(this.scale.width / 2, this.scale.height - 50, '', {
      fontSize: '11px',
      color: '#ffffff',
    }).setOrigin(0.5)

    this.controlsText = this.add.text(this.scale.width / 2, this.scale.height - 30, '← → MOVE    ENTER PLAY    ESC MENU', {
      fontSize: '7px',
      color: '#646464',
    }).setOrigin(0.5)

    this._updateLabel()

    this.input.keyboard.on('keydown-LEFT', () => this._move(-1))
    this.input.keyboard.on('keydown-A', () => this._move(-1))
    this.input.keyboard.on('keydown-RIGHT', () => this._move(1))
    this.input.keyboard.on('keydown-D', () => this._move(1))
    this.input.keyboard.on('keydown-ENTER', () => this._startLevel())
    this.input.keyboard.on('keydown-SPACE', () => this._startLevel())
    this.input.keyboard.on('keydown-ESC', () => this.scene.start('Menu'))
  }

  _move(dir) {
    const next = this.selectedIndex + dir
    if (next < 0 || next >= LEVELS.length) return
    this.selectedIndex = next
    this._drawCards()
    this._updateLabel()
  }

  _startLevel() {
    this.gameState.currentLevelIndex = this.selectedIndex
    this.scene.start('Game')
  }

  _drawCards() {
    for (const card of this.cards) card.destroy()
    this.cards = []

    const total = LEVELS.length
    const cardW = 32
    const cardH = 36
    const gap = 8
    const cols = Math.min(total, 8)
    const rows = Math.ceil(total / cols)
    const gridW = cols * (cardW + gap) - gap
    const startX = (this.scale.width - gridW) / 2
    const startY = this.scale.height / 2 - (rows * (cardH + gap)) / 2

    for (let i = 0; i < total; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * (cardW + gap)
      const y = startY + row * (cardH + gap)
      const isSelected = i === this.selectedIndex

      const color = isSelected ? 0x64c8ff : 0x285078
      const rect = this.add.rectangle(x + cardW / 2, y + cardH / 2, cardW, cardH, color)
        .setStrokeStyle(isSelected ? 2 : 0, 0xffffff)
      this.cards.push(rect)

      const text = this.add.text(x + cardW / 2, y + cardH / 2, `${i + 1}`, {
        fontSize: '11px',
        color: isSelected ? '#000000' : '#c8c8c8',
      }).setOrigin(0.5)
      this.cards.push(text)
    }
  }

  _updateLabel() {
    const name = LEVELS[this.selectedIndex]?.name ?? ''
    this.labelText.setText(`LEVEL ${this.selectedIndex + 1} — ${name}`)
  }
}
