import {
    POWERUP_BOMB_AMOUNT,
    POWERUP_RANGE_AMOUNT,
    POWERUP_SPEED_AMOUNT
} from "../config/constants.js"

export class PowerUpSystem {

    update(world) {

        const player = world.player
        if (!player.alive) return

        const key = `${player.tileX},${player.tileY}`

        const powerUp = world.powerUps[key]

        if (!powerUp || !powerUp.alive) return

        this.apply(player, powerUp.kind)
        world.events.push("powerUpPickup")
        powerUp.alive = false
        delete world.powerUps[key]

    }

    apply(player, kind) {

        switch (kind) {
            case "life":
                player.lives++
                break
            case "bomb":
                player.maxBombs += POWERUP_BOMB_AMOUNT
                break
            case "range":
                player.bombRange = (player.bombRange ?? 2) + POWERUP_RANGE_AMOUNT
                break
            case "speed":
                player.speed += POWERUP_SPEED_AMOUNT
                break
        }

    }

}