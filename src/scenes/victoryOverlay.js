import { LEVELS } from "../levels/levels.js"

export class VictoryOverlay {

    constructor(gameState) {
        this.gameState = gameState
        this.timer     = 0
        this.duration  = 4
    }

    onEnter() {
        this.timer = this.duration
        this.gameState.nextLevel()
        this.soundManager.playOverlayMusic('victory', false)
    }

    update(dt, p) {
        this.timer -= dt

        if (this.timer <= 0) {
            this.manager.hideOverlay()

            if (this.gameState.currentLevelIndex >= LEVELS.length) {
                this.manager.transition('menu')
            } else {
                this.manager.transition('gameplay')
                this.manager.showOverlay('levelIntro')
            }
        }
    }

    render(buffer) {
        buffer.fill(0, 0, 0, 150)
        buffer.noStroke()
        buffer.rect(0, 0, buffer.width, buffer.height)

        buffer.textAlign('center', 'center')

        buffer.fill(255, 220, 0)
        buffer.textSize(20)
        buffer.text('LEVEL CLEAR!', buffer.width / 2, buffer.height / 2 - 20)

        buffer.fill(255)
        buffer.textSize(8)
        buffer.text('NEXT LEVEL IN ' + Math.ceil(this.timer) + '...', buffer.width / 2, buffer.height / 2 + 15)
    }

}