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
  canSmelt,
  clearFragmentBag,
  cloneFragmentBag,
  collectSmeltJob,
  completeSealCraft,
  consumeSealCraftCosts,
  createEmptyEquippedSlots,
  createEmptyFragmentBag,
  createEmptySeals,
  createEmptyUpgrades,
  equipSeal,
  fortuneChance,
  listAnvilRecipes,
  migrateLegacyUpgrades,
  miningDurationFactor,
  ranksFromEquipped,
  startSmeltJob,
  tickAnvilJob,
  tickSmeltJob,
  transferFragmentBag,
  unequipSeal,
  unequippedSealIds,
  UPGRADE_IDS,
} from '../config/crafting.js'

const SAVE_KEY = 'uncover_save'
const SAVE_VERSION = 5
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
    this.workshopSeals = createEmptySeals()
    this.equippedSeals = createEmptyEquippedSlots()
    /** @type {null | { material: string, remaining: number, duration: number, ready: boolean, refinedPending: number }} */
    this.furnaceJob = null
    /** @type {null | { upgradeId: string, targetRank: number, remaining: number, duration: number }} */
    this.anvilJob = null
    /** Compat: ranks efectivos desde slots equipados. */
    this.upgrades = createEmptyUpgrades()
    this.hubUnlocked = false
    this.hubEntry = null
    /** Número de nivel Mov. I (1-based) para diálogo hub.advance/retry al entrar. */
    this.hubNarrativeLevel = null
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
    this.upgrades = ranksFromEquipped(this.workshopSeals, this.equippedSeals)
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
      r2UpgradeIds: UPGRADE_IDS.filter((id) => (this.workshopSeals[id] ?? 0) >= 2),
    }
  }

  prepareFragmentPlanForLevel(levelSpec) {
    this.pendingFragmentPlan = buildFragmentPlan(levelSpec, this.fragmentEligibility())
    return this.pendingFragmentPlan
  }

  listAnvilRecipes() {
    return listAnvilRecipes(
      this.workshopSeals,
      this.workshopRefined,
      this.workshopFragments,
      { busy: Boolean(this.anvilJob) },
    )
  }

  unequippedSeals() {
    return unequippedSealIds(this.workshopSeals, this.equippedSeals)
  }

  startSmelt(material) {
    if (this.furnaceJob) return { ok: false, reason: 'busy' }
    if (!canSmelt(this.workshopCrude, material)) {
      return { ok: false, reason: 'insufficient' }
    }
    const result = startSmeltJob(this.workshopCrude, material)
    if (!result.ok) return result
    this.furnaceJob = result.job
    return { ok: true, job: this.furnaceJob }
  }

  collectSmelt() {
    const result = collectSmeltJob(this.workshopRefined, this.furnaceJob)
    if (!result.ok) return result
    this.furnaceJob = null
    return result
  }

  startCraft(upgradeId, targetRank) {
    if (this.anvilJob) return { ok: false, reason: 'busy' }
    const result = consumeSealCraftCosts(
      this.workshopRefined,
      this.workshopFragments,
      upgradeId,
      targetRank,
    )
    if (!result.ok) return result
    this.anvilJob = result.job
    return { ok: true, job: this.anvilJob }
  }

  equipSealAt(upgradeId, slotIndex) {
    const result = equipSeal(
      this.equippedSeals,
      this.workshopSeals,
      upgradeId,
      slotIndex,
    )
    if (!result.ok) return result
    this.equippedSeals = result.equipped
    this.recomputeStatsFromUpgrades()
    return { ok: true }
  }

  unequipSealAt(slotIndex) {
    const result = unequipSeal(this.equippedSeals, slotIndex)
    if (!result.ok) return result
    this.equippedSeals = result.equipped
    this.recomputeStatsFromUpgrades()
    return { ok: true }
  }

  /**
   * Avanza jobs del taller. Devuelve flags de eventos UI.
   * @returns {{ smeltReady: boolean, anvilDone: boolean, crafted?: { upgradeId: string, targetRank: number } }}
   */
  tickWorkshopJobs(dt) {
    const events = { smeltReady: false, anvilDone: false }
    if (this.furnaceJob && !this.furnaceJob.ready) {
      const wasReady = this.furnaceJob.ready
      this.furnaceJob = tickSmeltJob(this.furnaceJob, dt)
      if (!wasReady && this.furnaceJob.ready) events.smeltReady = true
    }
    if (this.anvilJob) {
      const tick = tickAnvilJob(this.anvilJob, dt)
      this.anvilJob = tick.job
      if (tick.completed) {
        completeSealCraft(this.workshopSeals, tick.upgradeId, tick.targetRank)
        this.recomputeStatsFromUpgrades()
        events.anvilDone = true
        events.crafted = { upgradeId: tick.upgradeId, targetRank: tick.targetRank }
      }
    }
    return events
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

    if (this.currentLevelIndex >= LEVELS.length) {
      this.hubEntry = null
      this.hubNarrativeLevel = null
      this.save()
      return 'menu'
    }
    if (completedIndex === 0) {
      this.hubEntry = null
      this.hubNarrativeLevel = null
      this.save()
      return 'level'
    }

    this.hubEntry = 'advance'
    // hub.advance.N usa N de Mov. I (N3 → 3), no índice 0-based.
    this.hubNarrativeLevel = completedIndex + 1
    this.save()
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
      this.hubEntry = 'retry'
      this.hubNarrativeLevel = 7
      this.currentLevelIndex = 5
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
    this.hubNarrativeLevel = failedIndex + 1
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
      hubNarrativeLevel: this.hubNarrativeLevel,
      narrativeFlags: { ...this.narrativeFlags },
      runResources: { ...this.runResources },
      workshopCrude: { ...this.workshopCrude },
      workshopRefined: { ...this.workshopRefined },
      workshopStorage: { ...this.workshopCrude },
      runFragments: cloneFragmentBag(this.runFragments),
      workshopFragments: cloneFragmentBag(this.workshopFragments),
      workshopSeals: { ...this.workshopSeals },
      equippedSeals: [...this.equippedSeals],
      furnaceJob: this.furnaceJob ? { ...this.furnaceJob } : null,
      anvilJob: this.anvilJob ? { ...this.anvilJob } : null,
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

      if (data.workshopSeals) {
        this.workshopSeals = {
          ...createEmptySeals(),
          ...data.workshopSeals,
        }
        this.equippedSeals = Array.isArray(data.equippedSeals)
          ? [
            ...data.equippedSeals,
            ...createEmptyEquippedSlots(),
          ].slice(0, 4)
          : createEmptyEquippedSlots()
      } else {
        const migrated = migrateLegacyUpgrades(
          data.upgrades,
          data.recipesKnown,
        )
        this.workshopSeals = migrated.seals
        this.equippedSeals = migrated.equipped
      }

      this.furnaceJob = data.furnaceJob ?? null
      this.anvilJob = data.anvilJob ?? null
      this.recomputeStatsFromUpgrades()
      if (data.maxLives != null) this.maxLives = data.maxLives
      this.lives = this.maxLives
      this.unlockedLevels = LEVELS.length
      this.hubUnlocked = data.hubUnlocked != null
        ? Boolean(data.hubUnlocked)
        : ((data.currentLevelIndex ?? 0) >= 2 || (data.unlockedLevels ?? 0) > 2)
      this.hubEntry = data.hubEntry ?? null
      this.hubNarrativeLevel = data.hubNarrativeLevel ?? null
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
