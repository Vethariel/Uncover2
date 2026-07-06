import Phaser from 'phaser'
import { gameConfig } from './phaser/config.js'
import { setupIntegerScale } from './phaser/integerScale.js'

const game = new Phaser.Game(gameConfig)
setupIntegerScale(game)
