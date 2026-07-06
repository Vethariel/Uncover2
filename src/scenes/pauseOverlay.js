export class PauseOverlay {

    constructor(gameState) {
        this.gameState = gameState
    }


    update(dt, p) {
        if (this.inputHandler.isJustDown('Escape')) {
            this.manager.hideOverlay()
        }

        if (this.inputHandler.isJustDown('Enter')) {
            this.manager.hideOverlay()
            this.manager.transition('menu')
        }
    }

    render(buffer) {
        buffer.fill(0, 0, 0, 150)
        buffer.noStroke()
        buffer.rect(0, 0, buffer.width, buffer.height)

        buffer.textAlign('center', 'center')

        buffer.fill(255)
        buffer.textSize(20)
        buffer.text('PAUSED', buffer.width / 2, buffer.height / 2 - 30)

        buffer.fill(200)
        buffer.textSize(8)
        buffer.text('ESC TO RESUME', buffer.width / 2, buffer.height / 2 + 10)
        buffer.text('ENTER TO QUIT TO MENU', buffer.width / 2, buffer.height / 2 + 25)
    }

}