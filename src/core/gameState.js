import { LEVELS } from "../levels/levels.js"

import {
    PLAYER_SPEED,
    PLAYER_BOMB_RANGE,
    PLAYER_MAX_BOMBS,
    PLAYER_LIVES
} from "../config/constants.js"

const SAVE_KEY = 'bomberman_save'

export class GameState {

    constructor() {
        this.reset()
        this.unlockedLevels = 1
    }

    reset() {
        this.currentLevelIndex = 0
        this.score             = 0
        this.lives             = PLAYER_LIVES

        // Stats que persisten entre niveles via power ups
        this.speed             = PLAYER_SPEED
        this.bombRange         = PLAYER_BOMB_RANGE
        this.maxBombs          = PLAYER_MAX_BOMBS
    }

    // Aplica el estado persistido al jugador al iniciar un nivel
    applyToPlayer(player) {
        player.speed    = this.speed
        player.bombRange = this.bombRange
        player.maxBombs  = this.maxBombs
        player.lives     = this.lives
        player.score     = this.score
    }

    // Sincroniza de vuelta desde el jugador al terminar un nivel
    syncFromPlayer(player) {
        this.speed     = player.speed
        this.bombRange = player.bombRange
        this.maxBombs  = player.maxBombs
        this.lives     = player.lives
        this.score     = player.score
    }

    nextLevel() {
        this.currentLevelIndex++
        this.unlockedLevels = Math.min(
            Math.max(this.unlockedLevels, this.currentLevelIndex + 1),
            LEVELS.length
        )
    }

    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null
    }

    save() {
        const data = {
            currentLevelIndex: this.currentLevelIndex,
            score:             this.score,
            lives:             this.lives,
            speed:             this.speed,
            bombRange:         this.bombRange,
            maxBombs:          this.maxBombs,
            unlockedLevels:    this.unlockedLevels
        }
        localStorage.setItem(SAVE_KEY, JSON.stringify(data))
    }

    load() {
        const raw = localStorage.getItem(SAVE_KEY)
        if (!raw) return false

        try {
            const data = JSON.parse(raw)
            this.currentLevelIndex = data.currentLevelIndex ?? 0
            this.score             = data.score             ?? 0
            this.lives             = data.lives             ?? PLAYER_LIVES
            this.speed             = data.speed             ?? PLAYER_SPEED
            this.bombRange         = data.bombRange         ?? PLAYER_BOMB_RANGE
            this.maxBombs          = data.maxBombs          ?? PLAYER_MAX_BOMBS
            this.unlockedLevels    = data.unlockedLevels    ?? 1
            return true
        } catch {
            return false
        }
    }

    deleteSave() {
        localStorage.removeItem(SAVE_KEY)
    }

}