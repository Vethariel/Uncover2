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
    state.upgrades.maxBombs = 1
    state.hubUnlocked = true

    expect(state.routeAfterGameOver()).toBe('menu')
    expect(state.workshopCrude).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopRefined).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.upgrades.maxBombs).toBe(0)
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
    state.upgrades.maxBombs = 1
    state.recipesKnown.maxBombs = 2

    expect(state.routeAfterGameOver()).toBe('workshop')
    expect(state.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.runFragments.generic).toBe(0)
    expect(state.workshopCrude).toEqual({ bronze: 5, iron: 0, crystal: 0 })
    expect(state.workshopFragments.generic).toBe(1)
    expect(state.upgrades.maxBombs).toBe(1)
    expect(state.recipesKnown.maxBombs).toBe(2)
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

  it('aplica mejoras al jugador incluyendo vida máxima', () => {
    const state = new GameState()
    state.upgrades.maxBombs = 1
    state.upgrades.maxLives = 1
    state.upgrades.moveSpeed = 1
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

  it('funde y forja desde GameState', () => {
    const state = new GameState()
    state.workshopCrude.bronze = 3
    expect(state.trySmelt('bronze').ok).toBe(true)
    expect(state.workshopRefined.bronze).toBe(2)
    expect(state.tryCraft('maxBombs').ok).toBe(false)
    state.workshopRefined.bronze = 3
    expect(state.tryCraft('maxBombs').ok).toBe(true)
    expect(state.upgrades.maxBombs).toBe(1)
  })

  it('desbloquea R2/R3 desde el yunque', () => {
    const state = new GameState()
    state.upgrades.maxBombs = 1
    state.workshopFragments.generic = 2
    expect(state.tryUnlockRank2('maxBombs').ok).toBe(true)
    expect(state.recipesKnown.maxBombs).toBe(2)
    expect(state.fragmentEligibility().r2UpgradeIds).toContain('maxBombs')

    state.workshopFragments.specialized.maxBombs = 3
    expect(state.tryUnlockRank3('maxBombs').ok).toBe(true)
    expect(state.recipesKnown.maxBombs).toBe(3)
  })

  it('persiste crudo, refinado, fragmentos y upgrades', () => {
    const state = new GameState()
    state.workshopCrude = { bronze: 7, iron: 3, crystal: 1 }
    state.workshopRefined = { bronze: 2, iron: 0, crystal: 1 }
    state.workshopFragments.generic = 2
    state.workshopFragments.specialized.fortune = 1
    state.upgrades.fortune = 1
    state.recipesKnown.fortune = 2
    state.currentLevelIndex = 2
    state.hubUnlocked = true
    state.save()

    const loaded = new GameState()
    expect(loaded.load()).toBe(true)
    expect(loaded.workshopCrude).toEqual({ bronze: 7, iron: 3, crystal: 1 })
    expect(loaded.workshopRefined).toEqual({ bronze: 2, iron: 0, crystal: 1 })
    expect(loaded.workshopFragments.generic).toBe(2)
    expect(loaded.workshopFragments.specialized.fortune).toBe(1)
    expect(loaded.upgrades.fortune).toBe(1)
    expect(loaded.recipesKnown.fortune).toBe(2)
    expect(loaded.hubUnlocked).toBe(true)
    expect(loaded.unlockedLevels).toBe(LEVELS.length)
  })
})
