export class GameOverScene {

    constructor(gameState) {
        this.gameState = gameState
    }

    onEnter() {
        this.gameState.deleteSave()
        this.soundManager.playMusic('gameOver', false)
    }

    update(dt) {
        if (this.inputHandler.isJustDown('Enter')) {
            this.manager.transition('menu')
        }
    }

    render(buffer) {
        buffer.background(0)

        buffer.textAlign('center', 'center')

        buffer.fill(220, 60, 60)
        buffer.textSize(20)
        buffer.text('GAME OVER', buffer.width / 2, buffer.height / 2 - 20)

        buffer.fill(200)
        buffer.textSize(8)
        buffer.text('PRESS ENTER TO RETURN TO MENU', buffer.width / 2, buffer.height / 2 + 15)
    }

}