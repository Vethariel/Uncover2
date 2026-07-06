// SoundSystem — traduce world.events a llamadas al SoundManager.
// Vive en GameplayScene igual que RenderSystem o BombSystem.
// Las escenas (GameOver, Victory, etc.) llaman a soundManager directamente
// desde su onEnter() para música — este sistema solo maneja eventos de gameplay.

export class SoundSystem {

    constructor() {
        // Cooldown de pasos para no disparar el sfx cada frame
        this.walkCooldown    = 0
        this.walkCooldownMax = 0.4   // segundos entre pasos
    }

    update(world, soundManager, dt) {

        if (this.walkCooldown > 0) this.walkCooldown -= dt

        for (const event of world.events) {

            switch (event) {

                case "playerWalk":
                    if (this.walkCooldown <= 0) {
                        soundManager.playSFX("walk")
                        this.walkCooldown = this.walkCooldownMax
                    }
                    break

                case "bombPlace":     soundManager.playSFX("bombPlace");    break
                case "explosion":     soundManager.playSFX("explosion");    break
                case "powerUpPickup": soundManager.playSFX("powerUp");      break
                case "playerDeath":   soundManager.playSFX("playerDeath");  break
                case "enemyDeath":    soundManager.playSFX("enemyDeath");   break
                case "portalActive":  soundManager.playSFX("portalActive"); break

            }

        }

        world.events = []

    }

}