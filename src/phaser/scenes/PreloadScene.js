import Phaser from 'phaser'
import { registerAnimations } from '../AnimationRegistry.js'
import { registerTilemaps } from '../level/registerTilemaps.js'
import { LEVELS } from '../../config/levels.js'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('dino', 'assets/sprites/dino.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('demon', 'assets/sprites/demon.png', { frameWidth: 32, frameHeight: 32 })
    this.load.spritesheet('bombs', 'assets/sprites/bomb.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('powerUp', 'assets/sprites/powerUp.png', { frameWidth: 16, frameHeight: 16 })
    this.load.spritesheet('portal', 'assets/sprites/portal.png', { frameWidth: 16, frameHeight: 48 })
    this.load.image('hud', 'assets/sprites/hud.png')

    for (const level of LEVELS) {
      this.load.json(`tmj_${level.data}`, `assets/tilemaps/${level.data}.tmj`)
      this.load.json(`tsj_${level.data}`, `assets/tilemaps/${level.data}.tsj`)
      this.load.spritesheet(level.data, `assets/tilemaps/${level.data}.png`, {
        frameWidth: 16,
        frameHeight: 16,
      })
    }

    this.load.audio('walk', 'assets/sounds/walk.wav')
    this.load.audio('bombPlace', 'assets/sounds/bomb_place.wav')
    this.load.audio('explosion', 'assets/sounds/explosion.wav')
    this.load.audio('powerUp', 'assets/sounds/powerup.wav')
    this.load.audio('playerDeath', 'assets/sounds/player_death.wav')
    this.load.audio('enemyDeath', 'assets/sounds/enemy_death.wav')
    this.load.audio('portalActive', 'assets/sounds/portal.wav')
    this.load.audio('menu', 'assets/sounds/music_menu.mp3')
    this.load.audio('world1', 'assets/sounds/music_world1.mp3')
    this.load.audio('victory', 'assets/sounds/music_victory.mp3')
    this.load.audio('gameOver', 'assets/sounds/music_gameover.mp3')
    this.load.audio('levelStart', 'assets/sounds/music_levelstart.mp3')
    this.load.audio('timeUp', 'assets/sounds/music_timeUp.mp3')
  }

  create() {
    registerAnimations(this.anims)
    registerTilemaps(this.cache)
    this.scene.start('Splash')
  }
}
