export class MenuScene {

    constructor(gameState) {
        this.gameState = gameState
        this.blinkTimer = 0
        this.blinkVisible = true
        this.bombFrame = 0
        this.bombTimer = 0
        this.bombFps = 6
        this.bombFrames = 4
        this.bombRow = 0
        this.bombFrameSize = 16
        this.bombScale = 3
    }

    onEnter() {
        this.gameState.reset()
        this.soundManager.playMusic('menu')
    }

    update(dt) {
        // Blink
        this.blinkTimer += dt
        if (this.blinkTimer >= 0.5) {
            this.blinkTimer = 0
            this.blinkVisible = !this.blinkVisible
        }

        // Bomba
        this.bombTimer += dt
        if (this.bombTimer >= 1 / this.bombFps) {
            this.bombTimer = 0
            this.bombFrame = (this.bombFrame + 1) % this.bombFrames
        }

        if (this.inputHandler.isJustDown('Enter')) {
            this.manager.transition('levelSelect')
        }
    }

    render(buffer) {
        buffer.background(0)
        buffer.textAlign('center', 'center')

        const cx = buffer.width / 2
        const cy = buffer.height / 2

        // Bomba animada centrada arriba del título
        const sheet = this.manager.scenes['gameplay'].assets.get('bombs')
        if (sheet) {
            const fs = this.bombFrameSize
            const sc = this.bombScale
            const sx = this.bombFrame * fs
            const sy = this.bombRow * fs
            const dx = cx - (fs * sc) / 2
            const dy = cy - 60

            buffer.image(sheet, dx, dy, fs * sc, fs * sc, sx, sy, fs, fs)
        }

        // Título
        buffer.fill(255)
        buffer.textSize(16)
        buffer.text('BOMBERMAN', cx, cy - 10)

        // Press Enter parpadeante
        if (this.blinkVisible) {
            buffer.fill(200)
            buffer.textSize(8)
            buffer.text('PRESS ENTER TO START', cx, cy + 15)
        }
    }

}