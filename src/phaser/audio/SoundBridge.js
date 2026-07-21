import { getAudio } from './AudioService.js'

export class SoundBridge {
  constructor(scene) {
    this.audio = getAudio(scene)
    this.walkCooldown = 0
    this.walkCooldownMax = 0.4
  }

  handleEvents(events, dt) {
    if (this.walkCooldown > 0) this.walkCooldown -= dt

    for (const event of events) {
      switch (event) {
        case 'playerWalk':
          if (this.walkCooldown <= 0) {
            this.audio.playSFX('walk')
            this.walkCooldown = this.walkCooldownMax
          }
          break
        case 'playerDamaged':
          this.audio.playSFX('playerHurt')
          break
        case 'enemyDeath':
          this.audio.playSFX('enemyDeath')
          break
        case 'puzzleStep':
        case 'trapArmed':
          this.audio.playSFX('uiStep')
          break
        case 'puzzleComplete':
          this.audio.playSFX('puzzleComplete')
          break
        case 'puzzleFail':
          this.audio.playSFX('puzzleFail')
          break
        case 'dartFire':
          this.audio.playSFX('dartFire')
          break
        case 'trapDestroyed':
          this.audio.playSFX('trapDestroyed')
          break
        case 'chestOpen':
          this.audio.playSFX('chestOpen')
          break
        case 'mineComplete':
        case 'resourceCollected':
          this.audio.playSFX('mineComplete')
          break
        case 'fragmentCollected':
          this.audio.playSFX('fragmentCollected')
          break
        case 'explosion':
          this.audio.playSFX('explosion')
          break
        case 'bombPlace':
        case 'playerDeath':
          // bombPlace / playerDeath: sincronizados a frame en EntityView.
          break
      }
    }
  }
}
