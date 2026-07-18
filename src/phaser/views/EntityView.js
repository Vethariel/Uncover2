import { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT } from '../../config/constants.js'

const COLORS = {
  player: 0x4ea5ff,
  playerDirection: 0xd9efff,
  enemy: {
    golem_basic: 0x8d8a84,
    spirit: 0x7ec8ff,
    golem_advanced: 0xc45c26,
  },
  bomb: 0x20242b,
  fuse: 0xffc857,
  explosion: 0xff9f1c,
}

export class EntityView {
  constructor(scene, world) {
    this.scene = scene
    this.world = world
    this.graphics = scene.add.graphics({ x: 0, y: 0 })
  }

  update() {
    this.graphics.clear()

    const drawables = [
      ...this.world.explosions.map((entity) => ({ entity, kind: 'explosion' })),
      ...this.world.bombs.map((entity) => ({ entity, kind: 'bomb' })),
      ...this.world.enemies.map((entity) => ({ entity, kind: 'enemy' })),
      { entity: this.world.player, kind: 'player' },
    ]

    drawables
      .sort((a, b) => (a.entity.posY + a.entity.size) - (b.entity.posY + b.entity.size))
      .forEach(({ entity, kind }) => this._draw(kind, entity))

    this._drawMiningProgress()
    this._drawFragmentProgress()
    this._drawPuzzleFlashes()
    this._drawTrapWarnings()
    this._drawDarts()
  }

  destroy() {
    this.graphics.destroy()
  }

  _draw(kind, entity) {
    if (
      kind !== 'player'
      && this.world.visibleTiles
      && !this.world.visibleTiles.has(`${entity.tileX},${entity.tileY}`)
    ) return

    switch (kind) {
      case 'player':
        this._drawPlayer(entity)
        break
      case 'enemy':
        this._drawEnemy(entity)
        break
      case 'bomb':
        this._drawBomb(entity)
        break
      case 'explosion':
        this._drawExplosion(entity)
        break
    }
  }

  _drawPlayer(player) {
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 !== 0) return

    const cx = player.posX + player.size / 2
    const cy = player.posY + player.size / 2
    const color = player.alive ? COLORS.player : 0x68717d
    this.graphics.fillStyle(color).fillCircle(cx, cy, player.size / 2)

    const direction = this._directionVector(player.facing)
    this.graphics.lineStyle(2, COLORS.playerDirection)
    this.graphics.lineBetween(cx, cy, cx + direction.x * 6, cy + direction.y * 6)
  }

  _drawEnemy(enemy) {
    if (enemy.visible === false) return
    if (
      enemy.alive
      && enemy.invulnerableTimer > 0
      && Math.floor(enemy.invulnerableTimer * 20) % 2 !== 0
    ) return

    let color = COLORS.enemy[enemy.kind] ?? COLORS.enemy.golem_basic
    if (!enemy.alive) color = 0x5d3f43
    else if (enemy.aggressive && enemy.kind === 'golem_basic') color = 0xb08d57
    else if (enemy.aggressive && enemy.kind === 'spirit') color = 0xa8e6ff

    this.graphics.fillStyle(color).fillRect(enemy.posX, enemy.posY, enemy.size, enemy.size)
    this.graphics.lineStyle(1, 0xffffff, 0.65)
    this.graphics.strokeRect(enemy.posX + 0.5, enemy.posY + 0.5, enemy.size - 1, enemy.size - 1)
  }

  _drawBomb(bomb) {
    const cx = bomb.posX + bomb.size / 2
    const cy = bomb.posY + bomb.size / 2
    const pulse = 0.75 + 0.15 * Math.sin(bomb.timer * 12)
    this.graphics.fillStyle(COLORS.bomb).fillCircle(cx, cy + 1, bomb.size * pulse / 2)
    this.graphics.lineStyle(2, COLORS.fuse).lineBetween(cx, cy - 6, cx + 3, cy - 9)
  }

  _drawExplosion(explosion) {
    const inset = explosion.kind === 'center' ? 1 : 3
    this.graphics.fillStyle(COLORS.explosion, 0.85)
    this.graphics.fillRect(
      explosion.posX + inset,
      explosion.posY + inset,
      explosion.size - inset * 2,
      explosion.size - inset * 2,
    )
  }

  _drawMiningProgress() {
    this._drawProgressBar(this.world.activeMiningTarget, 0xffc857)
  }

  _drawFragmentProgress() {
    this._drawProgressBar(this.world.activeFragmentTarget, 0xd28cff)
  }

  _drawProgressBar(target, fillColor) {
    if (!target || target.duration <= 0) return

    const tileSize = this.world.tileSize
    const ratio = Math.min(1, target.progress / target.duration)
    const x = target.x * tileSize + 4
    const y = target.y * tileSize + 4
    const width = tileSize - 8

    this.graphics.fillStyle(0x111820, 0.85)
    this.graphics.fillRect(x, y, width, 4)
    this.graphics.fillStyle(fillColor, 1)
    this.graphics.fillRect(x, y, width * ratio, 4)
  }

  _drawPuzzleFlashes() {
    const tileSize = this.world.tileSize
    for (const tablet of this.world.puzzleTablets ?? []) {
      if (tablet.visual !== 'flashGreen' && tablet.visual !== 'flashRed') continue
      const color = tablet.visual === 'flashGreen' ? 0x6dff9a : 0xff6d6d
      this.graphics.fillStyle(color, 0.55)
      this.graphics.fillRect(
        tablet.x * tileSize + 2,
        tablet.y * tileSize + 2,
        tileSize - 4,
        tileSize - 4,
      )
    }
  }

  _drawTrapWarnings() {
    const tileSize = this.world.tileSize
    for (const trap of this.world.traps ?? []) {
      if (trap.state !== 'warning') continue
      const pulse = 0.35 + 0.35 * Math.abs(Math.sin(trap.warningTimer * 14))
      this.graphics.fillStyle(0xff6b4a, pulse)
      this.graphics.fillRect(
        trap.plate.x * tileSize + 3,
        trap.plate.y * tileSize + 3,
        tileSize - 6,
        tileSize - 6,
      )
    }
  }

  _drawDarts() {
    const tileSize = this.world.tileSize
    for (const dart of this.world.darts ?? []) {
      if (!dart.alive) continue
      if (
        this.world.visibleTiles
        && !this.world.visibleTiles.has(`${dart.tileX},${dart.tileY}`)
      ) continue
      const cx = dart.tileX * tileSize + tileSize / 2
      const cy = dart.tileY * tileSize + tileSize / 2
      this.graphics.fillStyle(0xe8e0d0, 0.95)
      this.graphics.fillCircle(cx, cy, 3)
      this.graphics.lineStyle(2, 0xb0a090, 1)
      this.graphics.lineBetween(
        cx - dart.dir.x * 5,
        cy - dart.dir.y * 5,
        cx + dart.dir.x * 5,
        cy + dart.dir.y * 5,
      )
    }
  }

  _directionVector(facing) {
    switch (facing) {
      case DIR_UP:
        return { x: 0, y: -1 }
      case DIR_DOWN:
        return { x: 0, y: 1 }
      case DIR_LEFT:
        return { x: -1, y: 0 }
      case DIR_RIGHT:
        return { x: 1, y: 0 }
      default:
        return { x: 0, y: 1 }
    }
  }
}
