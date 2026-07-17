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
  }

  destroy() {
    this.graphics.destroy()
  }

  _draw(kind, entity) {
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
    const color = enemy.alive ? (COLORS.enemy[enemy.kind] ?? COLORS.enemy.golem_basic) : 0x5d3f43
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
