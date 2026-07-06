export class LevelIntroOverlay {

    constructor(gameState) {
        this.gameState = gameState
        this.timer     = 0
        this.duration  = 3.7
    }

    onEnter() {
        
        this.timer = this.duration
        this.soundManager.playOverlayMusic('levelStart', false)
        this.soundManager.pauseMusic()
    }

    onExit() {
        this.soundManager.resumeMusic()
    }

    update(dt, p) {
        this.timer -= dt

        if (this.timer <= 0) {
            this.manager.hideOverlay()
        }
    }

    render(buffer) {
        // Oscurece la escena base
        buffer.fill(0, 0, 0, 150)
        buffer.noStroke()
        buffer.rect(0, 0, buffer.width, buffer.height)

        buffer.textAlign('center', 'center')

        buffer.fill(255)
        buffer.textSize(10)
        buffer.text('LEVEL', buffer.width / 2, buffer.height / 2 - 20)

        buffer.textSize(20)
        buffer.fill(255, 220, 0)
        buffer.text(this.gameState.currentLevelIndex + 1, buffer.width / 2, buffer.height / 2 + 10)
    }

}