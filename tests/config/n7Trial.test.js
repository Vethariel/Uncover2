import { describe, expect, it } from 'vitest'
import {
  evaluateN7Trial,
  scoreRun,
  defaultTrialQuota,
} from '../../src/config/n7Trial.js'

describe('n7Trial', () => {
  it('calcula score con pesos de material y fragmentos', () => {
    expect(scoreRun(
      { bronze: 2, iron: 1, crystal: 1 },
      { generic: 1, specialized: { maxBombs: 1 } },
    )).toBe(2 + 2 + 3 + 2 + 3)
  })

  it('aprueba cuando score alcanza la cuota', () => {
    const world = {
      runResources: { bronze: 4, iron: 3, crystal: 2 },
      runFragments: { generic: 0, specialized: {} },
      trialWastedScore: 0,
    }
    const result = evaluateN7Trial(world, { trialQuota: 14 })
    expect(result.score).toBe(4 + 6 + 6)
    expect(result.passed).toBe(true)
  })

  it('penaliza menas desperdiciadas', () => {
    const world = {
      runResources: { bronze: 10, iron: 0, crystal: 0 },
      runFragments: { generic: 0, specialized: {} },
      trialWastedScore: 4,
    }
    const result = evaluateN7Trial(world, { trialQuota: 10 })
    expect(result.score).toBe(6)
    expect(result.passed).toBe(false)
  })

  it('deriva cuota por defecto del resourceCap', () => {
    expect(defaultTrialQuota(10)).toBe(14)
  })
})
