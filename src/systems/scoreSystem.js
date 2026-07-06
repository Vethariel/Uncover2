export class ScoreSystem {

    constructor() {
        this.comboTimer  = 0
        this.comboWindow = 1  // segundos
    }

    update(world, dt, gameState) {
        if (this.comboTimer > 0) this.comboTimer -= dt

        // Actualiza y limpia popups
        world.scorePopups = world.scorePopups.filter(p => {
            p.timer -= dt
            p.posY  -= 20 * dt  // asciende
            return p.timer > 0
        })
    }

    addScore(world, enemy) {

        const base    = enemy.scoreValue ?? 100
        const isCombo = this.comboTimer > 0
        const points  = isCombo ? base * 2 : base

        world.player.score += points
        this.comboTimer = this.comboWindow

        // Popup sobre el enemigo
        world.scorePopups.push({
            value: points,
            posX:  enemy.posX,
            posY:  enemy.posY,
            timer: 1.2,
            combo: isCombo,
        })

    }

}