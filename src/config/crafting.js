import { createEmptyResources } from './miningTypes.js'

export const SMELT_RECIPES = {
  bronze: { crude: 3, refined: 2 },
  iron: { crude: 3, refined: 2 },
  crystal: { crude: 2, refined: 1 },
}

export const MAX_UPGRADE_RANK = 3
export const GENERIC_R2_COST = 2
export const SPECIALIZED_R3_COST = 3
export const FRAGMENT_EXTRACT_DURATION = {
  generic: 2.5,
  specialized: 3.5,
}

/** Efectos base por rango de mejora. */
export const UPGRADE_DEFS = {
  maxBombs: {
    id: 'maxBombs',
    name: 'Capacidad',
    material: 'bronze',
    costs: [3, 5, 8],
    description: '+1 bomba concurrente',
  },
  bombRange: {
    id: 'bombRange',
    name: 'Alcance',
    material: 'bronze',
    costs: [3, 5, 8],
    description: '+1 tile de blast',
  },
  pickSpeed: {
    id: 'pickSpeed',
    name: 'Temple',
    material: 'iron',
    costs: [3, 5, 8],
    description: '-15% tiempo de picado',
  },
  fortune: {
    id: 'fortune',
    name: 'Fortuna',
    material: 'iron',
    costs: [3, 5, 8],
    description: '20% chance de +1 material',
  },
  moveSpeed: {
    id: 'moveSpeed',
    name: 'Pasos',
    material: 'crystal',
    costs: [3, 5, 8],
    description: '+velocidad de movimiento',
  },
  maxLives: {
    id: 'maxLives',
    name: 'Respiro',
    material: 'crystal',
    costs: [4, 7, 11],
    description: '+1 vida máxima',
  },
}

export const UPGRADE_IDS = Object.keys(UPGRADE_DEFS)

export function createEmptyUpgrades() {
  return Object.fromEntries(UPGRADE_IDS.map((id) => [id, 0]))
}

export function createDefaultRecipesKnown() {
  return Object.fromEntries(UPGRADE_IDS.map((id) => [id, 1]))
}

export function createEmptyFragmentBag() {
  return {
    generic: 0,
    specialized: Object.fromEntries(UPGRADE_IDS.map((id) => [id, 0])),
  }
}

export function cloneFragmentBag(bag) {
  return {
    generic: bag?.generic ?? 0,
    specialized: {
      ...createEmptyFragmentBag().specialized,
      ...(bag?.specialized ?? {}),
    },
  }
}

export function clearFragmentBag(bag) {
  bag.generic = 0
  for (const id of UPGRADE_IDS) bag.specialized[id] = 0
}

export function transferFragmentBag(from, to) {
  to.generic += from.generic
  from.generic = 0
  for (const id of UPGRADE_IDS) {
    to.specialized[id] = (to.specialized[id] ?? 0) + (from.specialized[id] ?? 0)
    from.specialized[id] = 0
  }
}

export function addFragmentToBag(bag, fragment) {
  if (!fragment) return
  if (fragment.kind === 'specialized' && fragment.upgradeId) {
    bag.specialized[fragment.upgradeId] = (bag.specialized[fragment.upgradeId] ?? 0) + 1
    return
  }
  bag.generic += 1
}

export function sumSpecializedFragments(bag) {
  return UPGRADE_IDS.reduce((total, id) => total + (bag.specialized[id] ?? 0), 0)
}

export function canSmelt(crude, material) {
  const recipe = SMELT_RECIPES[material]
  if (!recipe) return false
  return (crude[material] ?? 0) >= recipe.crude
}

export function smeltBatch(crude, refined, material) {
  const recipe = SMELT_RECIPES[material]
  if (!recipe || (crude[material] ?? 0) < recipe.crude) {
    return { ok: false, reason: 'insufficient' }
  }
  crude[material] -= recipe.crude
  refined[material] = (refined[material] ?? 0) + recipe.refined
  return { ok: true, crudeSpent: recipe.crude, refinedGained: recipe.refined }
}

export function nextCraftCost(upgradeId, currentRank) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def) return null
  return def.costs[currentRank] ?? null
}

export function canCraft(refined, upgrades, recipesKnown, upgradeId) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def) return false
  const rank = upgrades[upgradeId] ?? 0
  const known = recipesKnown[upgradeId] ?? 1
  if (rank >= MAX_UPGRADE_RANK || rank >= known) return false
  const cost = nextCraftCost(upgradeId, rank)
  if (cost == null) return false
  return (refined[def.material] ?? 0) >= cost
}

export function craftUpgrade(refined, upgrades, recipesKnown, upgradeId) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def) return { ok: false, reason: 'unknown' }
  const rank = upgrades[upgradeId] ?? 0
  const known = recipesKnown[upgradeId] ?? 1
  if (rank >= MAX_UPGRADE_RANK) return { ok: false, reason: 'max_rank' }
  if (rank >= known) return { ok: false, reason: 'recipe_locked' }
  const cost = nextCraftCost(upgradeId, rank)
  if (cost == null || (refined[def.material] ?? 0) < cost) {
    return { ok: false, reason: 'insufficient' }
  }
  refined[def.material] -= cost
  upgrades[upgradeId] = rank + 1
  return { ok: true, rank: upgrades[upgradeId], def, cost }
}

export function canUnlockRank2(fragments, recipesKnown, upgradeId) {
  if (!UPGRADE_DEFS[upgradeId]) return false
  if ((recipesKnown[upgradeId] ?? 1) >= 2) return false
  return (fragments.generic ?? 0) >= GENERIC_R2_COST
}

export function unlockRank2(fragments, recipesKnown, upgradeId) {
  if (!canUnlockRank2(fragments, recipesKnown, upgradeId)) {
    return { ok: false, reason: 'blocked' }
  }
  fragments.generic -= GENERIC_R2_COST
  recipesKnown[upgradeId] = 2
  return { ok: true, rank: 2, upgradeId }
}

export function canUnlockRank3(fragments, recipesKnown, upgradeId) {
  if (!UPGRADE_DEFS[upgradeId]) return false
  if ((recipesKnown[upgradeId] ?? 1) < 2) return false
  if ((recipesKnown[upgradeId] ?? 1) >= 3) return false
  return (fragments.specialized[upgradeId] ?? 0) >= SPECIALIZED_R3_COST
}

export function unlockRank3(fragments, recipesKnown, upgradeId) {
  if (!canUnlockRank3(fragments, recipesKnown, upgradeId)) {
    return { ok: false, reason: 'blocked' }
  }
  fragments.specialized[upgradeId] -= SPECIALIZED_R3_COST
  recipesKnown[upgradeId] = 3
  return { ok: true, rank: 3, upgradeId }
}

/** Factor de duración de minado: 1.0 base, −15% por rango de pickSpeed. */
export function miningDurationFactor(pickSpeedRank) {
  return Math.max(0.25, 1 - 0.15 * (pickSpeedRank ?? 0))
}

export function fortuneChance(fortuneRank) {
  return 0.2 * (fortuneRank ?? 0)
}

export function createWorkshopBags() {
  return {
    crude: createEmptyResources(),
    refined: createEmptyResources(),
  }
}

export function normalizeFragmentSlots(spec) {
  if (Array.isArray(spec.fragmentSlots)) {
    return spec.fragmentSlots.map((slot) => ({ ...slot }))
  }
  const count = spec.recipeFragments ?? 0
  return Array.from({ length: count }, () => ({ rank: 2, kind: 'generic' }))
}

/**
 * Resuelve slots de nivel + elegibilidad a asignaciones concretas.
 * eligibility.r2UpgradeIds = mejoras con recipesKnown >= 2.
 */
export function buildFragmentPlan(spec, eligibility = {}) {
  const slots = normalizeFragmentSlots(spec)
  const pool = [...(eligibility.r2UpgradeIds ?? [])]
  return slots.map((slot) => {
    if (slot.kind === 'specialized' || slot.rank === 3) {
      if (!pool.length) {
        return { rank: 2, kind: 'generic', upgradeId: null }
      }
      const upgradeId = pool.shift()
      return { rank: 3, kind: 'specialized', upgradeId }
    }
    return { rank: 2, kind: 'generic', upgradeId: null }
  })
}

export function fragmentExtractDuration(fragment) {
  if (fragment?.kind === 'specialized') return FRAGMENT_EXTRACT_DURATION.specialized
  return FRAGMENT_EXTRACT_DURATION.generic
}
