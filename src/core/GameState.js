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
  buildFragmentPlan,
  canCraft,
  canSmelt,
  canUnlockRank2,
  canUnlockRank3,
  clearFragmentBag,
  cloneFragmentBag,
  craftUpgrade,
  createDefaultRecipesKnown,
  createEmptyFragmentBag,
  createEmptyUpgrades,
  fortuneChance,
  miningDurationFactor,
  smeltBatch,
  transferFragmentBag,
  UPGRADE_IDS,
  unlockRank2,
  unlockRank3,
} from '../config/crafting.js'

const SAVE_KEY = 'uncover_save'
const SAVE_VERSION = 4
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
    this.runFragments = createEmptyFragmentBag()
    this.workshopFragments = createEmptyFragmentBag()
    this.upgrades = createEmptyUpgrades()
    this.recipesKnown = createDefaultRecipesKnown()
    this.hubUnlocked = false
    this.hubEntry = null
    this.pendingFragmentPlan = null
    this.narrativeFlags = {}
    /** @type {null | { kind: string, title: string, detail: string, hint: string }} */
    this.gameOverPresentation = null
  }

  hasSeen(id) {
    return Boolean(this.narrativeFlags?.[id])
  }

  /** Idempotente. Persiste en el próximo save explícito del caller. */
  markSeen(id) {
    if (!id || this.hasSeen(id)) return false
    this.narrativeFlags[id] = true
    return true
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
    this.runFragments = cloneFragmentBag(world.runFragments)
  }

  applyRunResourcesToWorld(world) {
    world.runResources = {
      bronze: this.runResources.bronze ?? 0,
      iron: this.runResources.iron ?? 0,
      crystal: this.runResources.crystal ?? 0,
    }
    world.runFragments = cloneFragmentBag(this.runFragments)
  }

  depositRunToWorkshop() {
    transferResources(this.runResources, this.workshopCrude)
    transferFragmentBag(this.runFragments, this.workshopFragments)
  }

  clearRunResources() {
    clearResources(this.runResources)
    clearFragmentBag(this.runFragments)
  }

  fragmentEligibility() {
    return {
      r2UpgradeIds: UPGRADE_IDS.filter((id) => (this.recipesKnown[id] ?? 1) >= 2),
    }
  }

  prepareFragmentPlanForLevel(levelSpec) {
    this.pendingFragmentPlan = buildFragmentPlan(levelSpec, this.fragmentEligibility())
    return this.pendingFragmentPlan
  }

  trySmelt(material) {
    if (!canSmelt(this.workshopCrude, material)) {
      return { ok: false, reason: 'insufficient' }
    }
    return smeltBatch(this.workshopCrude, this.workshopRefined, material)
  }

  tryCraft(upgradeId) {
    if (!canCraft(this.workshopRefined, this.upgrades, this.recipesKnown, upgradeId)) {
      return { ok: false, reason: 'blocked' }
    }
    const result = craftUpgrade(
      this.workshopRefined,
      this.upgrades,
      this.recipesKnown,
      upgradeId,
    )
    if (result.ok) this.recomputeStatsFromUpgrades()
    return result
  }

  tryUnlockRank2(upgradeId) {
    if (!canUnlockRank2(this.workshopFragments, this.recipesKnown, upgradeId)) {
      return { ok: false, reason: 'blocked' }
    }
    return unlockRank2(this.workshopFragments, this.recipesKnown, upgradeId)
  }

  tryUnlockRank3(upgradeId) {
    if (!canUnlockRank3(this.workshopFragments, this.recipesKnown, upgradeId)) {
      return { ok: false, reason: 'blocked' }
    }
    return unlockRank3(this.workshopFragments, this.recipesKnown, upgradeId)
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
    // N7 (índice 6): Excavador pasa al hub.
    if (completedIndex === 6) this.markSeen('excavatorInHub')
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
      this.gameOverPresentation = {
        kind: 'tutorial_wipe',
        title: 'HAS ESCAPADO',
        detail: 'PERO HAS PERDIDO TODO EL PROGRESO',
        hint: 'PRESS ENTER TO RETURN TO MENU',
      }
      return 'menu'
    }

    // N7 (índice 6): fallo del umbral → pierde corrida y vuelve a N6.
    if (failedIndex === 6) {
      this.clearRunResources()
      this.lives = this.maxLives
      this.currentLevelIndex = 5
      this.hubEntry = 'retry'
      this.hubUnlocked = true
      this.markSeen('n7FailSeen')
      this.gameOverPresentation = {
        kind: 'n7_fail',
        title: 'EL UMBRAL NO SE ABRIÓ',
        detail: 'Pierdes lo recogido en esta corrida.\nEl Taller te devuelve a la Cámara Antigua (N6).',
        hint: 'PRESS ENTER TO RETURN TO WORKSHOP',
      }
      this.save()
      return 'workshop'
    }

    this.clearRunResources()
    this.lives = this.maxLives
    this.hubEntry = 'retry'
    this.hubUnlocked = true
    this.gameOverPresentation = {
      kind: 'escape',
      title: 'HAS ESCAPADO',
      detail: 'PERO HAS PERDIDO TODOS TUS OBJETOS',
      hint: 'PRESS ENTER TO RETURN TO WORKSHOP',
    }
    this.save()
    return 'workshop'
  }

  consumeGameOverPresentation() {
    const info = this.gameOverPresentation
    this.gameOverPresentation = null
    return info
  }

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
      narrativeFlags: { ...this.narrativeFlags },
      runResources: { ...this.runResources },
      workshopCrude: { ...this.workshopCrude },
      workshopRefined: { ...this.workshopRefined },
      workshopStorage: { ...this.workshopCrude },
      runFragments: cloneFragmentBag(this.runFragments),
      workshopFragments: cloneFragmentBag(this.workshopFragments),
      upgrades: { ...this.upgrades },
      recipesKnown: { ...this.recipesKnown },
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
      this.recipesKnown = {
        ...createDefaultRecipesKnown(),
        ...(data.recipesKnown ?? {}),
      }
      for (const id of UPGRADE_IDS) {
        const owned = this.upgrades[id] ?? 0
        this.recipesKnown[id] = Math.max(this.recipesKnown[id] ?? 1, owned, 1)
      }
      this.recomputeStatsFromUpgrades()
      if (data.maxLives != null) this.maxLives = data.maxLives
      this.lives = this.maxLives
      this.unlockedLevels = LEVELS.length
      this.hubUnlocked = data.hubUnlocked != null
        ? Boolean(data.hubUnlocked)
        : ((data.currentLevelIndex ?? 0) >= 2 || (data.unlockedLevels ?? 0) > 2)
      this.hubEntry = data.hubEntry ?? null
      this.narrativeFlags = { ...(data.narrativeFlags ?? {}) }
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
      this.runFragments = cloneFragmentBag(data.runFragments)
      this.workshopFragments = cloneFragmentBag(data.workshopFragments)
      return true
    } catch {
      return false
    }
  }

  deleteSave() {
    localStorage.removeItem(SAVE_KEY)
  }

  onGameOver() {
    return this.routeAfterGameOver()
  }
}
