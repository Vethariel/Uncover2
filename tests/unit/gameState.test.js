import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GameState } from '../../src/core/GameState.js'
import { PLAYER_LIVES } from '../../src/config/constants.js'
import { LEVELS } from '../../src/config/levels.js'

describe('GameState resources and lives', () => {
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    })
  })

  it('deposita la run en el taller y deja la run en cero', () => {
    const state = new GameState()
    state.runResources = { bronze: 3, iron: 1, crystal: 2 }
    state.workshopStorage = { bronze: 1, iron: 0, crystal: 0 }

    state.depositRunToWorkshop()

    expect(state.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopStorage).toEqual({ bronze: 4, iron: 1, crystal: 2 })
  })

  it('en game over pierde la run y conserva el taller', () => {
    const state = new GameState()
    state.runResources = { bronze: 2, iron: 2, crystal: 1 }
    state.workshopStorage = { bronze: 5, iron: 0, crystal: 0 }

    state.onGameOver()

    expect(state.runResources).toEqual({ bronze: 0, iron: 0, crystal: 0 })
    expect(state.workshopStorage).toEqual({ bronze: 5, iron: 0, crystal: 0 })
    expect(state.hasSave()).toBe(true)
  })

  it('aplica siempre vida completa al jugador', () => {
    const state = new GameState()
    const player = { lives: 1, speed: 100, bombRange: 1, maxBombs: 1 }
    state.lives = 1
    state.applyToPlayer(player)
    expect(player.lives).toBe(PLAYER_LIVES)
  })

  it('persiste workshopStorage en save/load', () => {
    const state = new GameState()
    state.workshopStorage = { bronze: 7, iron: 3, crystal: 1 }
    state.currentLevelIndex = 2
    state.save()

    const loaded = new GameState()
    expect(loaded.load()).toBe(true)
    expect(loaded.workshopStorage).toEqual({ bronze: 7, iron: 3, crystal: 1 })
    expect(loaded.unlockedLevels).toBe(LEVELS.length)
    expect(loaded.lives).toBe(PLAYER_LIVES)
  })
})
