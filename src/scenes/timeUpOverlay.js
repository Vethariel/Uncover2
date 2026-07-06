export class TimeUpOverlay {

    constructor(gameState) {
        this.gameState = gameState
        this.timer = 0
        this.duration = 2
    }

    onEnter() {
        this.timer = this.duration
        this.soundManager.playOverlayMusic('timeUp', false)
    }

    update(dt) {
        this.timer -= dt

        if (this.timer <= 0) {
            this.manager.hideOverlay()

            this.manager.transition('gameplay')
            this.manager.showOverlay('levelIntro')

        }
    }

    render(buffer) {
        buffer.fill(0, 0, 0, 180)
        buffer.noStroke()
        buffer.rect(0, 0, buffer.width, buffer.height)

        buffer.textAlign('center', 'center')

        buffer.fill(220, 60, 60)
        buffer.textSize(20)
        buffer.text('TIME OUT!', buffer.width / 2, buffer.height / 2 - 20)

        buffer.fill(200)
        buffer.textSize(8)
        buffer.text('HURRY UP NEXT TIME...', buffer.width / 2, buffer.height / 2 + 15)
    }

}