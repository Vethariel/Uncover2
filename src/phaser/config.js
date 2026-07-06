import Phaser from 'phaser'
import { INTERNAL_WIDTH, INTERNAL_HEIGHT } from '../config/constants.js'
import { BootScene } from './scenes/BootScene.js'
import { PreloadScene } from './scenes/PreloadScene.js'
import { SplashScene } from './scenes/SplashScene.js'
import { MenuScene } from './scenes/MenuScene.js'
import { LevelSelectScene } from './scenes/LevelSelectScene.js'
import { GameScene } from './scenes/GameScene.js'
import { GameOverlayScene } from './scenes/GameOverlayScene.js'
import { GameOverScene } from './scenes/GameOverScene.js'

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: INTERNAL_WIDTH,
  height: INTERNAL_HEIGHT,
  backgroundColor: '#000000',
  pixelArt: true,
  antialias: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
  scene: [BootScene, PreloadScene, SplashScene, MenuScene, LevelSelectScene, GameScene, GameOverlayScene, GameOverScene],
}
