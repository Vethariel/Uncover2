import { describe, expect, it } from 'vitest'
import {
  buildFragmentPlan,
  canCraft,
  canSmelt,
  canUnlockRank2,
  canUnlockRank3,
  craftUpgrade,
  createDefaultRecipesKnown,
  createEmptyFragmentBag,
  createEmptyUpgrades,
  fortuneChance,
  miningDurationFactor,
  smeltBatch,
  unlockRank2,
  unlockRank3,
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

  it('forja rango 1 y bloquea sin receta R2', () => {
    const refined = createEmptyResources()
    const upgrades = createEmptyUpgrades()
    const recipesKnown = createDefaultRecipesKnown()
    refined.bronze = 6

    expect(craftUpgrade(refined, upgrades, recipesKnown, 'maxBombs').ok).toBe(true)
    expect(upgrades.maxBombs).toBe(1)
    expect(refined.bronze).toBe(3)
    expect(canCraft(refined, upgrades, recipesKnown, 'maxBombs')).toBe(false)
    expect(craftUpgrade(refined, upgrades, recipesKnown, 'maxBombs').reason).toBe('recipe_locked')
  })

  it('desbloquea R2 con 2 genéricos y permite forjar', () => {
    const fragments = createEmptyFragmentBag()
    const recipesKnown = createDefaultRecipesKnown()
    const upgrades = createEmptyUpgrades()
    upgrades.maxBombs = 1
    fragments.generic = 2

    expect(canUnlockRank2(fragments, recipesKnown, 'maxBombs')).toBe(true)
    expect(unlockRank2(fragments, recipesKnown, 'maxBombs')).toEqual({
      ok: true,
      rank: 2,
      upgradeId: 'maxBombs',
    })
    expect(fragments.generic).toBe(0)
    expect(recipesKnown.maxBombs).toBe(2)

    const refined = createEmptyResources()
    refined.bronze = 5
    expect(craftUpgrade(refined, upgrades, recipesKnown, 'maxBombs').ok).toBe(true)
    expect(upgrades.maxBombs).toBe(2)
  })

  it('desbloquea R3 con 3 especializados tras R2', () => {
    const fragments = createEmptyFragmentBag()
    const recipesKnown = createDefaultRecipesKnown()
    recipesKnown.pickSpeed = 2
    fragments.specialized.pickSpeed = 3

    expect(canUnlockRank3(fragments, recipesKnown, 'pickSpeed')).toBe(true)
    expect(unlockRank3(fragments, recipesKnown, 'pickSpeed').ok).toBe(true)
    expect(recipesKnown.pickSpeed).toBe(3)
    expect(fragments.specialized.pickSpeed).toBe(0)
  })

  it('plan N6 cae a genéricos si no hay elegibles R2', () => {
    const plan = buildFragmentPlan(
      {
        fragmentSlots: [
          { rank: 3, kind: 'specialized' },
          { rank: 3, kind: 'specialized' },
          { rank: 3, kind: 'specialized' },
        ],
      },
      { r2UpgradeIds: [] },
    )
    expect(plan).toEqual([
      { rank: 2, kind: 'generic', upgradeId: null },
      { rank: 2, kind: 'generic', upgradeId: null },
      { rank: 2, kind: 'generic', upgradeId: null },
    ])
  })

  it('plan N6 asigna especializados desde elegibilidad', () => {
    const plan = buildFragmentPlan(
      {
        fragmentSlots: [
          { rank: 3, kind: 'specialized' },
          { rank: 3, kind: 'specialized' },
        ],
      },
      { r2UpgradeIds: ['maxBombs', 'fortune'] },
    )
    expect(plan).toEqual([
      { rank: 3, kind: 'specialized', upgradeId: 'maxBombs' },
      { rank: 3, kind: 'specialized', upgradeId: 'fortune' },
    ])
  })

  it('calcula factores de pico', () => {
    expect(miningDurationFactor(0)).toBe(1)
    expect(miningDurationFactor(1)).toBeCloseTo(0.85)
    expect(fortuneChance(0)).toBe(0)
    expect(fortuneChance(1)).toBeCloseTo(0.2)
  })
})
