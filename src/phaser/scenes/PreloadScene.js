import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    this.load.audio('walk', 'assets/sounds/walk.wav')
    this.load.audio('bombPlace', 'assets/sounds/bomb_place.wav')
    this.load.audio('explosion', 'assets/sounds/explosion.wav')
    this.load.audio('playerDeath', 'assets/sounds/player_death.wav')
    this.load.audio('enemyDeath', 'assets/sounds/enemy_death.wav')
    this.load.audio('portalActive', 'assets/sounds/portal.wav')
    this.load.audio('menu', 'assets/sounds/music_menu.mp3')
    this.load.audio('world1', 'assets/sounds/music_world1.mp3')
    this.load.audio('victory', 'assets/sounds/music_victory.mp3')
    this.load.audio('gameOver', 'assets/sounds/music_gameover.mp3')
    this.load.audio('levelStart', 'assets/sounds/music_levelstart.mp3')
  }

  create() {
    this.scene.start('Splash')
  }
}
