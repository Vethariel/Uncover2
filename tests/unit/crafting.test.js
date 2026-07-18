import { describe, expect, it } from 'vitest'
import {
  canSmelt,
  smeltBatch,
  craftUpgrade,
  createEmptyUpgrades,
  miningDurationFactor,
  fortuneChance,
} from '../../src/config/crafting.js'
import { createEmptyResources } from '../../src/config/miningTypes.js'

describe('crafting', () => {
  it('funde lotes 3→2 bronce/hierro y 2→1 cristal', () => {
    const crude = createEmptyResources()
    const refined = createEmptyResources()
    crude.bronze = 3
    crude.crystal = 2

    expect(canSmelt(crude, 'bronze')).toBe(true)
    expect(smeltBatch(crude, refined, 'bronze')).toEqual({
      ok: true,
      crudeSpent: 3,
      refinedGained: 2,
    })
    expect(crude.bronze).toBe(0)
    expect(refined.bronze).toBe(2)

    expect(smeltBatch(crude, refined, 'crystal').ok).toBe(true)
    expect(refined.crystal).toBe(1)
    expect(crude.crystal).toBe(0)
  })

  it('forja mejoras de rango 1 y bloquea repetir', () => {
    const refined = createEmptyResources()
    const upgrades = createEmptyUpgrades()
    refined.bronze = 6

    expect(craftUpgrade(refined, upgrades, 'maxBombs').ok).toBe(true)
    expect(upgrades.maxBombs).toBe(1)
    expect(refined.bronze).toBe(3)
    expect(craftUpgrade(refined, upgrades, 'maxBombs').ok).toBe(false)
  })

  it('calcula factores de pico', () => {
    expect(miningDurationFactor(0)).toBe(1)
    expect(miningDurationFactor(1)).toBeCloseTo(0.85)
    expect(fortuneChance(0)).toBe(0)
    expect(fortuneChance(1)).toBeCloseTo(0.2)
  })
})
