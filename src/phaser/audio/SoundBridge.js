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
        case 'bombPlace':
          this.audio.playSFX('bombPlace')
          break
        case 'explosion':
          this.audio.playSFX('explosion')
          break
        case 'playerDeath':
          this.audio.playSFX('playerDeath')
          break
        case 'enemyDeath':
          this.audio.playSFX('enemyDeath')
          break
      }
    }
  }
}
