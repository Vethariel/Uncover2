import { HUD_HEIGHT } from "../config/constants.js"

export class HudSystem {

    draw(world, gameState, assets, buffer) {

        const player = world.player

        // Fondo del HUD
        const bannerHud = assets.get('hud')
        buffer.image(bannerHud, 0, 0)

        // Vidas
        this.drawNumber(buffer, assets, Math.max(0,player.lives), 28, 13, 10, 2, 'center', 'center')

        // Puntaje
        this.drawNumber(buffer, assets, player.score, 74, 13, 11, 0, 'left', 'center')

        // Timer
        const minutes = Math.floor(world.levelTimer / 60)
        const seconds = Math.floor(world.levelTimer % 60)
        const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
        this.drawNumber(buffer, assets, timeStr, 138, 12, 14, 0, 'center', 'center')

        // Score popups
        this.drawPopups(world, assets, buffer)

    }

    drawNumber(buffer, assets, value, x, y, size = 8, strokeWeight = 0, alignX = 'left', alignY = 'top') {
        const sheet  = assets.get('numbers')
        if (!sheet) {
            // Fallback texto si no hay sprite
            buffer.fill(255)
            buffer.textSize(size)
            buffer.stroke(0)
            buffer.strokeWeight(strokeWeight)
            buffer.textAlign(alignX, alignY)
            buffer.text(value, x, y)
            return
        }

        const str    = String(value).padStart(6, '0')
        const digitW = 8
        const digitH = 8

        for (let i = 0; i < str.length; i++) {
            const digit = parseInt(str[i])
            buffer.image(sheet, x + i * digitW, y, digitW, digitH,
                               digit * digitW,  0, digitW, digitH)
        }

    }

    drawPopups(world, assets, buffer) {

        for (const popup of world.scorePopups ?? []) {
            buffer.textAlign('center', 'center')
            buffer.textSize(popup.combo ? 10 : 8)
            buffer.fill(popup.combo ? [255, 220, 0] : [255])
            buffer.text(popup.value, Math.floor(popup.posX), Math.floor(popup.posY))
        }

    }

}