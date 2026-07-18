import { createEmptyResources } from './miningTypes.js'

export const SMELT_RECIPES = {
  bronze: { crude: 3, refined: 2 },
  iron: { crude: 3, refined: 2 },
  crystal: { crude: 2, refined: 1 },
}

export const MAX_UPGRADE_RANK = 1

/** Efectos base por rango de mejora. */
export const UPGRADE_DEFS = {
  maxBombs: {
    id: 'maxBombs',
    name: 'Capacidad',
    material: 'bronze',
    cost: 3,
    description: '+1 bomba concurrente',
  },
  bombRange: {
    id: 'bombRange',
    name: 'Alcance',
    material: 'bronze',
    cost: 3,
    description: '+1 tile de blast',
  },
  pickSpeed: {
    id: 'pickSpeed',
    name: 'Temple',
    material: 'iron',
    cost: 3,
    description: '-15% tiempo de picado',
  },
  fortune: {
    id: 'fortune',
    name: 'Fortuna',
    material: 'iron',
    cost: 3,
    description: '20% chance de +1 material',
  },
  moveSpeed: {
    id: 'moveSpeed',
    name: 'Pasos',
    material: 'crystal',
    cost: 3,
    description: '+velocidad de movimiento',
  },
  maxLives: {
    id: 'maxLives',
    name: 'Respiro',
    material: 'crystal',
    cost: 4,
    description: '+1 vida máxima',
  },
}

export const UPGRADE_IDS = Object.keys(UPGRADE_DEFS)

export function createEmptyUpgrades() {
  return Object.fromEntries(UPGRADE_IDS.map((id) => [id, 0]))
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

export function canCraft(refined, upgrades, upgradeId) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def) return false
  const rank = upgrades[upgradeId] ?? 0
  if (rank >= MAX_UPGRADE_RANK) return false
  return (refined[def.material] ?? 0) >= def.cost
}

export function craftUpgrade(refined, upgrades, upgradeId) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def) return { ok: false, reason: 'unknown' }
  const rank = upgrades[upgradeId] ?? 0
  if (rank >= MAX_UPGRADE_RANK) return { ok: false, reason: 'max_rank' }
  if ((refined[def.material] ?? 0) < def.cost) {
    return { ok: false, reason: 'insufficient' }
  }
  refined[def.material] -= def.cost
  upgrades[upgradeId] = rank + 1
  return { ok: true, rank: upgrades[upgradeId], def }
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
