export class ScoreSystem {
  constructor() {
    this.comboTimer = 0
    this.comboWindow = 1
  }

  update(world, dt) {
    if (this.comboTimer > 0) this.comboTimer -= dt

    world.scorePopups = world.scorePopups.filter((popup) => {
      popup.timer -= dt
      popup.posY -= 20 * dt
      return popup.timer > 0
    })
  }

  addScore(world, enemy) {
    const base = enemy.score ?? 100
    const isCombo = this.comboTimer > 0
    const points = isCombo ? base * 2 : base

    world.player.score += points
    this.comboTimer = this.comboWindow

    world.scorePopups.push({
      value: points,
      posX: enemy.posX,
      posY: enemy.posY,
      timer: 1.2,
      combo: isCombo,
    })
  }
}
