import { describe, expect, it } from 'vitest'
import {
  buildFragmentPlan,
  canAffordSealCraft,
  collectSmeltJob,
  completeSealCraft,
  consumeSealCraftCosts,
  createEmptyEquippedSlots,
  createEmptyFragmentBag,
  createEmptySeals,
  equipSeal,
  fortuneChance,
  isAnvilRecipeVisible,
  listAnvilRecipes,
  migrateLegacyUpgrades,
  miningDurationFactor,
  ranksFromEquipped,
  smeltBatch,
  canSmelt,
  startSmeltJob,
  tickAnvilJob,
  tickSmeltJob,
  unequipSeal,
  unequippedSealIds,
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

  it('job de fundición consume crudo y entrega al recoger', () => {
    const crude = createEmptyResources()
    const refined = createEmptyResources()
    crude.bronze = 3
    const start = startSmeltJob(crude, 'bronze', () => 0)
    expect(start.ok).toBe(true)
    expect(crude.bronze).toBe(0)
    expect(start.job.duration).toBe(10)

    let job = tickSmeltJob(start.job, 5)
    expect(job.ready).toBe(false)
    job = tickSmeltJob(job, 5)
    expect(job.ready).toBe(true)

    expect(collectSmeltJob(refined, job).ok).toBe(true)
    expect(refined.bronze).toBe(2)
  })

  it('receta R1 visible; R2 solo con fragmentos y sello R1', () => {
    const seals = createEmptySeals()
    const fragments = createEmptyFragmentBag()
    const refined = createEmptyResources()
    refined.bronze = 10

    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 1)).toBe(true)
    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 2)).toBe(false)

    seals.maxBombs = 1
    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 1)).toBe(false)
    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 2)).toBe(false)

    fragments.generic = 2
    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 2)).toBe(true)
    expect(canAffordSealCraft(refined, fragments, 'maxBombs', 2)).toBe(true)
  })

  it('forja one-shot R1→R2→R3 con costes al iniciar', () => {
    const seals = createEmptySeals()
    const refined = createEmptyResources()
    const fragments = createEmptyFragmentBag()
    refined.bronze = 20
    fragments.generic = 2
    fragments.specialized.maxBombs = 3

    const r1 = consumeSealCraftCosts(refined, fragments, 'maxBombs', 1)
    expect(r1.ok).toBe(true)
    expect(refined.bronze).toBe(17)
    expect(completeSealCraft(seals, 'maxBombs', 1).ok).toBe(true)
    expect(seals.maxBombs).toBe(1)

    // R1 ya no visible
    expect(isAnvilRecipeVisible(seals, fragments, 'maxBombs', 1)).toBe(false)

    const r2 = consumeSealCraftCosts(refined, fragments, 'maxBombs', 2)
    expect(r2.ok).toBe(true)
    expect(fragments.generic).toBe(0)
    expect(r2.job.duration).toBe(20)
    completeSealCraft(seals, 'maxBombs', 2)
    expect(seals.maxBombs).toBe(2)

    const r3 = consumeSealCraftCosts(refined, fragments, 'maxBombs', 3)
    expect(r3.ok).toBe(true)
    expect(fragments.specialized.maxBombs).toBe(0)
    expect(r3.job.duration).toBe(30)
    completeSealCraft(seals, 'maxBombs', 3)
    expect(seals.maxBombs).toBe(3)
  })

  it('equipa máx 4 tipos distintos; ranks solo desde slots', () => {
    const seals = createEmptySeals()
    seals.maxBombs = 2
    seals.bombRange = 1
    seals.pickSpeed = 1
    seals.fortune = 1
    seals.moveSpeed = 1
    let equipped = createEmptyEquippedSlots()

    expect(equipSeal(equipped, seals, 'maxBombs', 0).ok).toBe(true)
    equipped = equipSeal(equipped, seals, 'maxBombs', 0).equipped
    expect(equipSeal(equipped, seals, 'maxBombs', 1).reason).toBe('duplicate_type')

    for (const [id, slot] of [
      ['bombRange', 1],
      ['pickSpeed', 2],
      ['fortune', 3],
    ]) {
      const r = equipSeal(equipped, seals, id, slot)
      expect(r.ok).toBe(true)
      equipped = r.equipped
    }

    const ranks = ranksFromEquipped(seals, equipped)
    expect(ranks.maxBombs).toBe(2)
    expect(ranks.moveSpeed).toBe(0)
    expect(unequippedSealIds(seals, equipped)).toEqual(['moveSpeed'])

    equipped = unequipSeal(equipped, 0).equipped
    expect(equipped[0]).toBeNull()
    expect(unequippedSealIds(seals, equipped)).toContain('maxBombs')
  })

  it('lista de recetas marca affordable y tick de yunque completa', () => {
    const seals = createEmptySeals()
    const refined = createEmptyResources()
    const fragments = createEmptyFragmentBag()
    refined.bronze = 3
    const list = listAnvilRecipes(seals, refined, fragments)
    const bombs = list.find((r) => r.upgradeId === 'maxBombs' && r.targetRank === 1)
    expect(bombs?.affordable).toBe(true)

    const start = consumeSealCraftCosts(refined, fragments, 'maxBombs', 1)
    let { job, completed } = tickAnvilJob(start.job, 5)
    expect(completed).toBe(false)
    ;({ job, completed } = tickAnvilJob(job, 5))
    expect(completed).toBe(true)
    expect(job).toBeNull()
  })

  it('migra upgrades legacy a sellos equipados', () => {
    const { seals, equipped } = migrateLegacyUpgrades(
      { maxBombs: 2, fortune: 1, bombRange: 0, pickSpeed: 0, moveSpeed: 0, maxLives: 0 },
      { maxBombs: 2 },
    )
    expect(seals.maxBombs).toBe(2)
    expect(seals.fortune).toBe(1)
    expect(equipped.filter(Boolean)).toEqual(['maxBombs', 'fortune'])
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
