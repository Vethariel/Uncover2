import { SceneManager } from "./core/sceneManager.js"
import { SoundManager } from "./core/soundManager.js"
import { GameState } from "./core/gameState.js"
import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from "./config/constants.js"
import { InputHandler } from "./utils/inputHandler.js"

let sketch = (p) => {

  let sceneManager
  let buffer
  let inputHandler
  let gameState
  let soundManager

  p.setup = async function () {

    p.pixelDensity(1)

    const canvas = p.createCanvas(p.windowWidth, p.windowHeight)
    canvas.style('display', 'block')

    canvas.elt.style.imageRendering = 'pixelated'
    p.noSmooth()

    buffer = p.createGraphics(INTERNAL_WIDTH, INTERNAL_HEIGHT)
    buffer.pixelDensity(1)
    buffer.noSmooth()
    buffer.elt.style.imageRendering = 'pixelated'

    inputHandler = new InputHandler()
    inputHandler.setP(p)
    gameState = new GameState()
    if(gameState.hasSave()){
      gameState.load()
    }
    soundManager = new SoundManager()

    await soundManager.load(p)
    sceneManager = new SceneManager(gameState, inputHandler, soundManager)

    await sceneManager.scenes['gameplay'].preload(p)

    sceneManager.transition('splash')
  }

  p.draw = function () {

    const dt = Math.min(p.deltaTime / 1000, 0.05)

    buffer.clear()
    sceneManager.update(dt, p)
    sceneManager.render(buffer)

    const scale = Math.max(1, Math.floor(Math.min(
      p.width / INTERNAL_WIDTH,
      p.height / INTERNAL_HEIGHT
    )))

    const scaledW = INTERNAL_WIDTH * scale
    const scaledH = INTERNAL_HEIGHT * scale

    const offsetX = Math.floor((p.width - scaledW) / 2)
    const offsetY = Math.floor((p.height - scaledH) / 2)

    p.background(0)
    p.image(buffer, offsetX, offsetY, scaledW, scaledH)

    inputHandler.flush()
  }

  p.keyPressed = () => inputHandler.onKeyPressed(p.key)
  p.keyReleased = () => inputHandler.onKeyReleased(p.key)

  p.mousePressed = () => inputHandler.onMousePressed()

  p.windowResized = () => p.resizeCanvas(p.windowWidth, p.windowHeight)

}

new p5(sketch)