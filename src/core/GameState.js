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
import {
  canCraft,
  canSmelt,
  craftUpgrade,
  createEmptyUpgrades,
  fortuneChance,
  miningDurationFactor,
  smeltBatch,
} from '../config/crafting.js'

const SAVE_KEY = 'uncover_save'
const SAVE_VERSION = 2
const MOVE_SPEED_PER_RANK = 18

export class GameState {
  constructor() {
    this.resetCampaign()
    // Debug: LevelSelect abierto.
    this.unlockedLevels = LEVELS.length
  }

  resetCampaign() {
    this.currentLevelIndex = 0
    this.lives = PLAYER_LIVES
    this.maxLives = PLAYER_LIVES
    this.speed = PLAYER_SPEED
    this.bombRange = PLAYER_BOMB_RANGE
    this.maxBombs = PLAYER_MAX_BOMBS
    this.pickSpeed = 0
    this.fortune = 0
    this.runResources = createEmptyResources()
    this.workshopCrude = createEmptyResources()
    this.workshopRefined = createEmptyResources()
    this.upgrades = createEmptyUpgrades()
    this.hubUnlocked = false
    this.hubEntry = null
  }

  /** Compat: menú "nueva partida" / wipe. */
  reset() {
    this.resetCampaign()
    this.unlockedLevels = LEVELS.length
  }

  wipeProgress() {
    this.resetCampaign()
    this.unlockedLevels = LEVELS.length
    this.deleteSave()
  }

  applyToPlayer(player) {
    this.recomputeStatsFromUpgrades()
    player.speed = this.speed
    player.baseSpeed = this.speed
    player.bombRange = this.bombRange
    player.maxBombs = this.maxBombs
    player.pickSpeed = this.pickSpeed
    player.fortune = this.fortune
    player.maxLives = this.maxLives
    player.lives = this.maxLives
    this.lives = this.maxLives
  }

  syncFromPlayer(player) {
    // Stats persistentes vienen de upgrades; no sobrescribir desde daño de nivel.
    this.lives = this.maxLives
  }

  recomputeStatsFromUpgrades() {
    const u = this.upgrades
    this.maxBombs = PLAYER_MAX_BOMBS + (u.maxBombs ?? 0)
    this.bombRange = PLAYER_BOMB_RANGE + (u.bombRange ?? 0)
    this.speed = PLAYER_SPEED + MOVE_SPEED_PER_RANK * (u.moveSpeed ?? 0)
    this.maxLives = PLAYER_LIVES + (u.maxLives ?? 0)
    this.pickSpeed = u.pickSpeed ?? 0
    this.fortune = u.fortune ?? 0
  }

  miningDurationFactor() {
    return miningDurationFactor(this.pickSpeed)
  }

  fortuneChance() {
    return fortuneChance(this.fortune)
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
    transferResources(this.runResources, this.workshopCrude)
  }

  clearRunResources() {
    clearResources(this.runResources)
  }

  trySmelt(material) {
    if (!canSmelt(this.workshopCrude, material)) {
      return { ok: false, reason: 'insufficient' }
    }
    return smeltBatch(this.workshopCrude, this.workshopRefined, material)
  }

  tryCraft(upgradeId) {
    if (!canCraft(this.workshopRefined, this.upgrades, upgradeId)) {
      return { ok: false, reason: 'blocked' }
    }
    const result = craftUpgrade(this.workshopRefined, this.upgrades, upgradeId)
    if (result.ok) this.recomputeStatsFromUpgrades()
    return result
  }

  nextLevel() {
    this.currentLevelIndex++
    this.unlockedLevels = Math.min(
      Math.max(this.unlockedLevels, this.currentLevelIndex + 1),
      LEVELS.length,
    )
  }

  /**
   * Tras victoria. completedIndex = índice del nivel acabado de completar.
   * @returns {'level'|'workshop'|'menu'}
   */
  routeAfterVictory(completedIndex) {
    this.depositRunToWorkshop()
    if (completedIndex >= 1) this.hubUnlocked = true
    this.nextLevel()
    this.hubEntry = null
    this.save()

    if (this.currentLevelIndex >= LEVELS.length) return 'menu'
    if (completedIndex === 0) return 'level'
    this.hubEntry = 'advance'
    return 'workshop'
  }

  /**
   * Tras game over.
   * @returns {'menu'|'workshop'}
   */
  routeAfterGameOver() {
    const failedIndex = this.currentLevelIndex
    if (failedIndex <= 1) {
      this.wipeProgress()
      return 'menu'
    }
    this.clearRunResources()
    this.lives = this.maxLives
    this.hubEntry = 'retry'
    this.hubUnlocked = true
    this.save()
    return 'workshop'
  }

  /** Destino al salir del hub por la puerta. */
  levelIndexForHubExit() {
    return this.currentLevelIndex
  }

  hasSave() {
    return localStorage.getItem(SAVE_KEY) !== null
  }

  save() {
    this.recomputeStatsFromUpgrades()
    const data = {
      saveVersion: SAVE_VERSION,
      currentLevelIndex: this.currentLevelIndex,
      speed: this.speed,
      bombRange: this.bombRange,
      maxBombs: this.maxBombs,
      maxLives: this.maxLives,
      pickSpeed: this.pickSpeed,
      fortune: this.fortune,
      unlockedLevels: this.unlockedLevels,
      hubUnlocked: this.hubUnlocked,
      hubEntry: this.hubEntry,
      runResources: { ...this.runResources },
      workshopCrude: { ...this.workshopCrude },
      workshopRefined: { ...this.workshopRefined },
      workshopStorage: { ...this.workshopCrude },
      upgrades: { ...this.upgrades },
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(data))
  }

  load() {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return false

    try {
      const data = JSON.parse(raw)
      this.currentLevelIndex = data.currentLevelIndex ?? 0
      this.upgrades = {
        ...createEmptyUpgrades(),
        ...(data.upgrades ?? {}),
      }
      this.recomputeStatsFromUpgrades()
      if (data.maxLives != null) this.maxLives = data.maxLives
      this.lives = this.maxLives
      this.unlockedLevels = LEVELS.length
      this.hubUnlocked = data.hubUnlocked != null
        ? Boolean(data.hubUnlocked)
        : ((data.currentLevelIndex ?? 0) >= 2 || (data.unlockedLevels ?? 0) > 2)
      this.hubEntry = data.hubEntry ?? null
      this.runResources = {
        ...createEmptyResources(),
        ...(data.runResources ?? {}),
      }
      const crudeSource = data.workshopCrude ?? data.workshopStorage ?? {}
      this.workshopCrude = {
        ...createEmptyResources(),
        ...crudeSource,
      }
      this.workshopRefined = {
        ...createEmptyResources(),
        ...(data.workshopRefined ?? {}),
      }
      return true
    } catch {
      return false
    }
  }

  deleteSave() {
    localStorage.removeItem(SAVE_KEY)
  }

  /** Soft game over legacy helper. */
  onGameOver() {
    return this.routeAfterGameOver()
  }
}
