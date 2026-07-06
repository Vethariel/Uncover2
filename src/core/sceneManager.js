import { MenuScene } from "../scenes/menuScene.js"
import { LevelSelectScene } from "../scenes/levelSelectScene.js"
import { GameplayScene } from "../scenes/gameplayScene.js"
import { GameOverScene } from "../scenes/gameOverScene.js"
//import { MinigameScene }    from "../scenes/minigameScene.js"
import { TimeUpOverlay } from "../scenes/timeUpOverlay.js"
import { PauseOverlay } from "../scenes/pauseOverlay.js"
import { VictoryOverlay } from "../scenes/victoryOverlay.js"
import { LevelIntroOverlay } from "../scenes/levelIntroOverlay.js"
import { SplashScene } from "../scenes/splashScene.js"

export class SceneManager {

    constructor(gameState, inputHandler, soundManager) {

        this.gameState = gameState
        this.inputHandler = inputHandler
        this.soundManager = soundManager
        this.current = null
        this.overlay = null

        this.scenes = {
            menu: new MenuScene(gameState),
            levelSelect: new LevelSelectScene(gameState),
            gameplay: new GameplayScene(gameState),
            gameOver: new GameOverScene(gameState),
            //minigame:    new MinigameScene(gameState),
            timeUp: new TimeUpOverlay(gameState),
            pause: new PauseOverlay(gameState),
            victory: new VictoryOverlay(gameState),
            levelIntro: new LevelIntroOverlay(gameState),
            splash: new SplashScene(gameState),
        }

        for (const scene of Object.values(this.scenes)) {
            scene.manager = this
            scene.inputHandler = inputHandler
            scene.soundManager = soundManager
        }

    }

    transition(name, data = {}) {
        this.overlay = null
        this.current?.onExit?.()
        this.current = this.scenes[name]
        this.current?.onEnter?.(data)
    }

    showOverlay(name, data = {}) {
        this.soundManager.pauseMusic()
        this.overlay = this.scenes[name]
        this.overlay?.onEnter?.(data)
    }

    hideOverlay() {
        this.soundManager.resumeMusic()
        this.overlay?.onExit?.()
        this.overlay = null
    }

    update(dt, p) {

        // Input global — ESC para pausa
        if (this.inputHandler.isJustDown('Escape') &&
            !this.overlay &&
            this.current === this.scenes['gameplay']) {
            this.showOverlay('pause')
            return
        }

        if (this.overlay) {
            this.overlay.update?.(dt, p)
        } else {
            this.current?.update?.(dt, p)
        }

    }

    render(buffer) {
        this.current?.render?.(buffer)
        this.overlay?.render?.(buffer)
    }

}