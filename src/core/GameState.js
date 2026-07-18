import { LEVELS } from '../config/levels.js'
import {
  PLAYER_SPEED,
  PLAYER_BOMB_RANGE,
  PLAYER_MAX_BOMBS,
  PLAYER_LIVES,
} from '../config/constants.js'
import {
  clearResources,
  createEmptyResources,
  transferResources,
} from '../config/miningTypes.js'

const SAVE_KEY = 'uncover_save'

export class GameState {
  constructor() {
    this.reset()
    this.unlockedLevels = LEVELS.length
    this.workshopStorage = createEmptyResources()
  }

  reset() {
    this.currentLevelIndex = 0
    this.lives = PLAYER_LIVES
    this.speed = PLAYER_SPEED
    this.bombRange = PLAYER_BOMB_RANGE
    this.maxBombs = PLAYER_MAX_BOMBS
    this.runResources = createEmptyResources()
  }

  applyToPlayer(player) {
    player.speed = this.speed
    player.bombRange = this.bombRange
    player.maxBombs = this.maxBombs
    // Cada nivel / run empieza con vida completa.
    player.lives = PLAYER_LIVES
    this.lives = PLAYER_LIVES
  }

  syncFromPlayer(player) {
    this.speed = player.speed
    this.bombRange = player.bombRange
    this.maxBombs = player.maxBombs
    // La vida no persiste entre niveles; solo se usa dentro del nivel actual.
    this.lives = PLAYER_LIVES
  }

  syncRunResourcesFromWorld(world) {
    this.runResources = {
      bronze: world.runResources?.bronze ?? 0,
      iron: world.runResources?.iron ?? 0,
      crystal: world.runResources?.crystal ?? 0,
    }
  }

  applyRunResourcesToWorld(world) {
    world.runResources = {
      bronze: this.runResources.bronze ?? 0,
      iron: this.runResources.iron ?? 0,
      crystal: this.runResources.crystal ?? 0,
    }
  }

  depositRunToWorkshop() {
    transferResources(this.runResources, this.workshopStorage)
  }

  clearRunResources() {
    clearResources(this.runResources)
  }

  nextLevel() {
    this.currentLevelIndex++
    this.unlockedLevels = Math.min(
      Math.max(this.unlockedLevels, this.currentLevelIndex + 1),
      LEVELS.length,
    )
  }

  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null
  }

  save() {
    const data = {
      currentLevelIndex: this.currentLevelIndex,
      speed: this.speed,
      bombRange: this.bombRange,
      maxBombs: this.maxBombs,
      unlockedLevels: this.unlockedLevels,
      runResources: { ...this.runResources },
      workshopStorage: { ...this.workshopStorage },
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false

    try {
      const data = JSON.parse(raw)
      this.currentLevelIndex = data.currentLevelIndex ?? 0
      this.lives = PLAYER_LIVES
      this.speed = data.speed ?? PLAYER_SPEED
      this.bombRange = data.bombRange ?? PLAYER_BOMB_RANGE
      this.maxBombs = data.maxBombs ?? PLAYER_MAX_BOMBS
      // Debug: selector abierto; conservar valor si existe pero no bloquear.
      this.unlockedLevels = LEVELS.length
      this.runResources = {
        ...createEmptyResources(),
        ...(data.runResources ?? {}),
      }
      this.workshopStorage = {
        ...createEmptyResources(),
        ...(data.workshopStorage ?? {}),
      }
      return true
    } catch {
      return false
    }
  }

  deleteSave() {
    localStorage.removeItem(SAVE_KEY)
  }

  /** Game over: pierde la run, conserva almacenamiento del taller. */
  onGameOver() {
    this.clearRunResources()
    this.lives = PLAYER_LIVES
    this.save()
  }
}
