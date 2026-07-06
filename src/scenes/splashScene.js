// scenes/splashScene.js
export class SplashScene {

    constructor(gameState) {
        this.gameState = gameState
        this.blinkTimer = 0
        this.blinkVisible = true
    }

    onEnter() {
        // nada — aún no se puede tocar audio
    }

    update(dt) {
        this.blinkTimer += dt
        if (this.blinkTimer >= 0.5) {
            this.blinkTimer = 0
            this.blinkVisible = !this.blinkVisible
        }
        if (
            this.inputHandler.isJustDown('Enter') ||
            this.inputHandler.isJustDown('mouse')   // ver nota abajo
        ) {
            this.manager.transition('menu')
        }
    }

    render(buffer) {
        buffer.background(0)
        buffer.fill(255)
        buffer.textAlign('center', 'center')
        buffer.textSize(16)
        if (this.blinkVisible) {
            buffer.text('CLICK OR PRESS', buffer.width / 2, buffer.height / 2 - 15)
            buffer.text('ENTER TO START', buffer.width / 2, buffer.height / 2 + 15)
        }
    }
}