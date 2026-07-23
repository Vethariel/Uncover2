import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameState } from '../../src/core/GameState.js'
import { PLAYER_LIVES, PLAYER_MAX_BOMBS } from '../../src/config/constants.js'
import { LEVELS } from '../../src/config/levels.js'

describe('GameState resources and progression', () => {
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    })
  })

  it('deposita la run en crudo y fragmentos del taller', () => {
    const state = new GameState()
    state.runResources = { bronze: 3, iron: 1, crystal: 2 }
    state.workshopCrude = { bronze: 1, iron: 0, crystal: 0 }
    state.runFragments.generic = 2
    state.runFragments.specialized.maxBombs = 1
    state.workshopFragments.generic = 1

    state.depositRunToWorkshop()

    expect(state.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopCrude).toEqual({ bronze: 4, iron: 1, crystal: 2 })
    expect(state.runFragments.generic).toBe(0)
    expect(state.runFragments.specialized.maxBombs).toBe(0)
    expect(state.workshopFragments.generic).toBe(3)
    expect(state.workshopFragments.specialized.maxBombs).toBe(1)
  })

  it('game over en N1–N2 borra todo el progreso', () => {
    const state = new GameState()
    state.currentLevelIndex = 1
    state.workshopCrude = { bronze: 5, iron: 0, crystal: 0 }
    state.workshopRefined = { bronze: 2, iron: 0, crystal: 0 }
    state.workshopSeals.maxBombs = 1
    state.equippedSeals[0] = 'maxBombs'
    state.hubUnlocked = true

    expect(state.routeAfterGameOver()).toBe('menu')
    expect(state.workshopCrude).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopRefined).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopSeals.maxBombs).toBe(0)
    expect(state.hubUnlocked).toBe(false)
    expect(state.currentLevelIndex).toBe(0)
    expect(state.hasSave()).toBe(false)
  })

  it('game over en N3+ pierde la run y conserva el taller', () => {
    const state = new GameState()
    state.currentLevelIndex = 2
    state.runResources = { bronze: 2, iron: 2, crystal: 1 }
    state.runFragments.generic = 2
    state.workshopCrude = { bronze: 5, iron: 0, crystal: 0 }
    state.workshopFragments.generic = 1
    state.workshopSeals.maxBombs = 1
    state.equippedSeals[0] = 'maxBombs'
    state.recomputeStatsFromUpgrades()

    expect(state.routeAfterGameOver()).toBe('workshop')
    expect(state.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.runFragments.generic).toBe(0)
    expect(state.workshopCrude).toEqual({ bronze: 5, iron: 0, crystal: 0 })
    expect(state.workshopFragments.generic).toBe(1)
    expect(state.workshopSeals.maxBombs).toBe(1)
    expect(state.upgrades.maxBombs).toBe(1)
    expect(state.currentLevelIndex).toBe(2)
    expect(state.hubEntry).toBe('retry')
  })

  it('victoria N1 va a nivel; N2+ abre hub', () => {
    const state = new GameState()
    state.runResources = { bronze: 1, iron: 0, crystal: 0 }
    expect(state.routeAfterVictory(0)).toBe('level')
    expect(state.currentLevelIndex).toBe(1)
    expect(state.hubUnlocked).toBe(false)
    expect(state.workshopCrude.bronze).toBe(1)

    state.runResources = { bronze: 2, iron: 0, crystal: 0 }
    expect(state.routeAfterVictory(1)).toBe('workshop')
    expect(state.currentLevelIndex).toBe(2)
    expect(state.hubUnlocked).toBe(true)
    expect(state.hubEntry).toBe('advance')
    expect(state.hubNarrativeLevel).toBe(2)
  })

  it('victoria N3 prepara catarsis hub.advance.3', () => {
    const state = new GameState()
    expect(state.routeAfterVictory(2)).toBe('workshop')
    expect(state.hubNarrativeLevel).toBe(3)
    expect(state.hubEntry).toBe('advance')
  })

  it('fallo N3+ guarda hubNarrativeLevel para retry', () => {
    const state = new GameState()
    state.currentLevelIndex = 2
    state.routeAfterGameOver()
    expect(state.hubNarrativeLevel).toBe(3)
  })

  it('aplica sellos equipados al jugador incluyendo vida máxima', () => {
    const state = new GameState()
    state.workshopSeals.maxBombs = 1
    state.workshopSeals.maxLives = 1
    state.workshopSeals.moveSpeed = 1
    state.equippedSeals = ['maxBombs', 'maxLives', 'moveSpeed', null]
    const player = {
      lives: 1,
      speed: 100,
      bombRange: 1,
      maxBombs: 1,
      baseSpeed: 100,
      pickSpeed: 0,
      fortune: 0,
      maxLives: 3,
    }
    state.applyToPlayer(player)
    expect(player.maxBombs).toBe(PLAYER_MAX_BOMBS + 1)
    expect(player.lives).toBe(PLAYER_LIVES + 1)
    expect(player.maxLives).toBe(PLAYER_LIVES + 1)
    expect(player.speed).toBeGreaterThan(100)
  })

  it('funde con job y forja sellos desde GameState', () => {
    const state = new GameState()
    state.workshopCrude.bronze = 3
    expect(state.startSmelt('bronze').ok).toBe(true)
    expect(state.workshopCrude.bronze).toBe(0)
    expect(state.furnaceJob).toBeTruthy()

    state.tickWorkshopJobs(state.furnaceJob.duration)
    expect(state.furnaceJob.ready).toBe(true)
    expect(state.collectSmelt().ok).toBe(true)
    expect(state.workshopRefined.bronze).toBe(2)

    state.workshopRefined.bronze = 3
    expect(state.startCraft('maxBombs', 1).ok).toBe(true)
    expect(state.workshopRefined.bronze).toBe(0)
    state.tickWorkshopJobs(10)
    expect(state.workshopSeals.maxBombs).toBe(1)
    expect(state.anvilJob).toBeNull()

    state.equipSealAt('maxBombs', 0)
    expect(state.upgrades.maxBombs).toBe(1)
  })

  it('R2 requiere sello R1 + fragmentos; elegibilidad por sellos ≥2', () => {
    const state = new GameState()
    state.workshopSeals.maxBombs = 1
    state.workshopFragments.generic = 2
    state.workshopRefined.bronze = 5
    expect(state.listAnvilRecipes().some((r) => r.targetRank === 2)).toBe(true)

    expect(state.startCraft('maxBombs', 2).ok).toBe(true)
    state.tickWorkshopJobs(20)
    expect(state.workshopSeals.maxBombs).toBe(2)
    expect(state.fragmentEligibility().r2UpgradeIds).toContain('maxBombs')
  })

  it('persiste sellos, equipo y jobs', () => {
    const state = new GameState()
    state.workshopCrude = { bronze: 7, iron: 3, crystal: 1 }
    state.workshopRefined = { bronze: 2, iron: 0, crystal: 1 }
    state.workshopFragments.generic = 2
    state.workshopFragments.specialized.fortune = 1
    state.workshopSeals.fortune = 2
    state.equippedSeals[0] = 'fortune'
    state.currentLevelIndex = 2
    state.hubUnlocked = true
    state.recomputeStatsFromUpgrades()
    state.save()

    const loaded = new GameState()
    expect(loaded.load()).toBe(true)
    expect(loaded.workshopCrude).toEqual({ bronze: 7, iron: 3, crystal: 1 })
    expect(loaded.workshopRefined).toEqual({ bronze: 2, iron: 0, crystal: 1 })
    expect(loaded.workshopFragments.generic).toBe(2)
    expect(loaded.workshopFragments.specialized.fortune).toBe(1)
    expect(loaded.workshopSeals.fortune).toBe(2)
    expect(loaded.equippedSeals[0]).toBe('fortune')
    expect(loaded.upgrades.fortune).toBe(2)
    expect(loaded.hubUnlocked).toBe(true)
    expect(loaded.unlockedLevels).toBe(LEVELS.length)
  })

  it('migra save legacy upgrades → sellos', () => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    })
    store.set('uncover_save', JSON.stringify({
      saveVersion: 4,
      currentLevelIndex: 2,
      upgrades: { maxBombs: 1, fortune: 1 },
      recipesKnown: { maxBombs: 2, fortune: 1 },
      workshopCrude: { bronze: 1, iron: 0, crystal: 0 },
      workshopRefined: { bronze: 0, iron: 0, crystal: 0 },
      hubUnlocked: true,
    }))

    const loaded = new GameState()
    expect(loaded.load()).toBe(true)
    expect(loaded.workshopSeals.maxBombs).toBe(1)
    expect(loaded.workshopSeals.fortune).toBe(1)
    expect(loaded.equippedSeals.filter(Boolean)).toEqual(['maxBombs', 'fortune'])
  })
})
