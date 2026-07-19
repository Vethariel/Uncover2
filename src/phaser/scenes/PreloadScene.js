import Phaser from 'phaser'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    this.load.spritesheet(
      'playerWalk',
      'assets/sprites/player_walk.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'playerIdle',
      'assets/sprites/player_idle.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'playerHurt',
      'assets/sprites/player_hurt.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'playerDeath',
      'assets/sprites/player_death.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'playerBomb',
      'assets/sprites/player_bomb.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'playerMine',
      'assets/sprites/player_mine.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.audio('walk', 'assets/sounds/walk.wav')
    this.load.audio('bombPlace', 'assets/sounds/bomb_place.wav')
    this.load.audio('explosion', 'assets/sounds/explosion.wav')
    this.load.audio('playerDeath', 'assets/sounds/player_death.wav')
    this.load.audio('enemyDeath', 'assets/sounds/enemy_death.wav')
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
