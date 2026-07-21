import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getDialogue } from '../../src/config/dialogues.js'
import { getEventBeats } from '../../src/config/narrativeEvents.js'
import { GameState } from '../../src/core/GameState.js'

describe('hub narrative — mapeo de niveles', () => {
  beforeEach(() => {
    const store = new Map()
    vi.stubGlobal('localStorage', {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
    })
  })

  it('tras N3 (índice 2) apunta a hub.advance.3', () => {
    const state = new GameState()
    state.currentLevelIndex = 2
    expect(state.routeAfterVictory(2)).toBe('workshop')
    expect(state.currentLevelIndex).toBe(3)
    expect(state.hubEntry).toBe('advance')
    expect(state.hubNarrativeLevel).toBe(3)
    expect(getEventBeats('hub.advance.3')).not.toBeNull()
    expect(getDialogue('hub.advance.3').length).toBeGreaterThan(0)
  })

  it('fallo en N3 apunta a hub.retry.3 aunque el índice siga en 2', () => {
    const state = new GameState()
    state.currentLevelIndex = 2
    expect(state.routeAfterGameOver()).toBe('workshop')
    expect(state.currentLevelIndex).toBe(2)
    expect(state.hubNarrativeLevel).toBe(3)
    expect(getDialogue('hub.retry.3').length).toBeGreaterThan(0)
  })

  it('fallo en N7 apunta a hub.retry.7 aunque vuelva al índice de N6', () => {
    const state = new GameState()
    state.currentLevelIndex = 6
    expect(state.routeAfterGameOver()).toBe('workshop')
    expect(state.currentLevelIndex).toBe(5)
    expect(state.hubNarrativeLevel).toBe(7)
    expect(getDialogue('hub.retry.7').length).toBeGreaterThan(0)
  })

  it('cada hub.advance/retry declarado tiene texto', () => {
    for (let n = 3; n <= 7; n++) {
      expect(getDialogue(`hub.advance.${n}`).length).toBeGreaterThan(0)
      expect(getDialogue(`hub.retry.${n}`).length).toBeGreaterThan(0)
    }
  })
})
