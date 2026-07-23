import Phaser from 'phaser'
import { preloadMenuBackground } from '../views/MenuBackgroundView.js'
import {
  BRUN_EXPRESSIONS,
  EXCAVATOR_EXPRESSIONS,
  PLAYER_EXPRESSIONS,
  portraitTextureKey,
} from '../../config/portraitExpressions.js'
import { preloadUiAtlas, registerUiAtlasFrames } from '../ui/uiAtlas.js'
import { preloadIconsAtlas, registerIconsAtlasFrames } from '../ui/iconsAtlas.js'
import { preloadFurnace } from '../views/furnaceSprite.js'
import { preloadAnvil } from '../views/anvilSprite.js'
import { preloadMineWalls } from '../../config/mineWalls.js'
import { preloadMineProps } from '../../config/mineProps.js'
import { preloadTorch } from '../../config/torch.js'
import { preloadRail } from '../../config/rail.js'
import { waitForGameFonts } from '../../config/typography.js'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('Preload')
  }

  preload() {
    // Respeta el base de Vite (p. ej. /Uncover2/ en GitHub Pages).
    this.load.setBaseURL(import.meta.env.BASE_URL)

    preloadMenuBackground(this.load)
    preloadUiAtlas(this.load)
    preloadIconsAtlas(this.load)
    for (const expression of PLAYER_EXPRESSIONS) {
      this.load.image(
        portraitTextureKey('player', expression),
        `assets/ui/portraits/player/${expression}.png`,
      )
    }
    for (const expression of EXCAVATOR_EXPRESSIONS) {
      this.load.image(
        portraitTextureKey('excavator', expression),
        `assets/ui/portraits/excavator/${expression}.png`,
      )
    }
    for (const expression of BRUN_EXPRESSIONS) {
      this.load.image(
        portraitTextureKey('smith', expression),
        `assets/ui/portraits/brun/${expression}.png`,
      )
    }
    this.load.image(
      portraitTextureKey('fragment'),
      'assets/ui/portraits/fragment.png',
    )

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
      'brunIdle',
      'assets/sprites/brun_idle.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'excavatorIdle',
      'assets/sprites/excavator_idle.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golemIdle',
      'assets/sprites/golem_idle.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golem2Idle',
      'assets/sprites/golem2_idle.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golem2Walk',
      'assets/sprites/golem2_walk.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golem2Hurt',
      'assets/sprites/golem2_hurt.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golem2Death',
      'assets/sprites/golem2_death.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golemWalk',
      'assets/sprites/golem_walk.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golemHurt',
      'assets/sprites/golem_hurt.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'golemDeath',
      'assets/sprites/golem_death.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'spiritFloat',
      'assets/sprites/spirit_idle_walk.png',
      { frameWidth: 64, frameHeight: 64 },
    )
    this.load.spritesheet(
      'spiritDeath',
      'assets/sprites/spirit_death.png',
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
    this.load.image('mineFloor', 'assets/tilemaps/mine_floor.png')
    this.load.image('workshopFloor', 'assets/tilemaps/workshop_floor.png')
    preloadMineWalls(this.load)
    preloadMineProps(this.load)
    preloadTorch(this.load)
    preloadRail(this.load)
    preloadFurnace(this.load)
    preloadAnvil(this.load)
    this.load.spritesheet(
      'chest',
      'assets/sprites/chest.png',
      { frameWidth: 32, frameHeight: 32 },
    )
    this.load.spritesheet(
      'bomb',
      'assets/sprites/bomb.png',
      { frameWidth: 32, frameHeight: 32 },
    )
    this.load.spritesheet(
      'explosion',
      'assets/sprites/explosion.png',
      { frameWidth: 32, frameHeight: 32 },
    )
    this.load.audio('walk', 'assets/sounds/walk.mp3')
    this.load.audio('mine', 'assets/sounds/mine.mp3')
    this.load.audio('bombPlace', 'assets/sounds/bomb_place.mp3')
    this.load.audio('explosion', 'assets/sounds/explosion.mp3')
    this.load.audio('playerHurt', 'assets/sounds/player_hurt.mp3')
    this.load.audio('playerDeath', 'assets/sounds/player_death.mp3')
    this.load.audio('enemyDeath', 'assets/sounds/enemy_death.wav')
    this.load.audio('enemyHurt', 'assets/sounds/enemy_hurt.mp3')
    this.load.audio('spiritRage', 'assets/sounds/spirit_rage.mp3')
    this.load.audio('golemAggro', 'assets/sounds/golem_aggro.mp3')
    this.load.audio('uiStep', 'assets/sounds/ui_step.mp3')
    this.load.audio('puzzleComplete', 'assets/sounds/puzzle_complete.mp3')
    this.load.audio('puzzleFail', 'assets/sounds/puzzle_fail.mp3')
    this.load.audio('dartFire', 'assets/sounds/dart_fire.mp3')
    this.load.audio('dartHit', 'assets/sounds/dart_hit.mp3')
    this.load.audio('trapDestroyed', 'assets/sounds/trap_destroyed.mp3')
    this.load.audio('chestOpen', 'assets/sounds/chest_open.mp3')
    this.load.audio('mineComplete', 'assets/sounds/mine_complete.mp3')
    this.load.audio('fragmentCollected', 'assets/sounds/fragment_collected.mp3')
    this.load.audio('menu', 'assets/sounds/music_menu.mp3')
    this.load.audio('mov1_n1', 'assets/sounds/music_mov1_n1.mp3')
    this.load.audio('mov1_n2', 'assets/sounds/music_mov1_n2.mp3')
    this.load.audio('mov1_n3', 'assets/sounds/music_mov1_n3.mp3')
    this.load.audio('mov1_n4', 'assets/sounds/music_mov1_n4.mp3')
    this.load.audio('mov1_n5', 'assets/sounds/music_mov1_n5.mp3')
    this.load.audio('mov1_n6', 'assets/sounds/music_mov1_n6.mp3')
    this.load.audio('mov1_n7', 'assets/sounds/music_mov1_n7.mp3')
    this.load.audio('workshop', 'assets/sounds/music_workshop.mp3')
    this.load.audio('victory', 'assets/sounds/music_victory.mp3')
    this.load.audio('gameOver', 'assets/sounds/music_gameover.mp3')
    this.load.audio('levelStart', 'assets/sounds/music_levelstart.mp3')
  }

  create() {
    registerUiAtlasFrames(this)
    registerIconsAtlasFrames(this)
    waitForGameFonts().then(() => {
      this.scene.start('Splash')
    })
  }
}
