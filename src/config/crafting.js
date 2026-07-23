import { createEmptyResources } from './miningTypes.js'

export const SMELT_RECIPES = {
  bronze: { crude: 3, refined: 2 },
  iron: { crude: 3, refined: 2 },
  crystal: { crude: 2, refined: 1 },
}

export const MAX_UPGRADE_RANK = 3
export const EQUIPPED_SLOT_COUNT = 4
export const GENERIC_R2_COST = 2
export const SPECIALIZED_R3_COST = 3
export const FRAGMENT_EXTRACT_DURATION = {
  generic: 2.5,
  specialized: 3.5,
}

/** Duración de fundición (s). */
export const SMELT_DURATION_MIN = 10
export const SMELT_DURATION_MAX = 20

/** Duración de forja por rango objetivo (s). */
export const ANVIL_DURATION_BY_RANK = {
  1: 10,
  2: 20,
  3: 30,
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

/** Sellos poseídos: upgradeId → rango 0..3. */
export function createEmptySeals() {
  return createEmptyUpgrades()
}

export function createEmptyEquippedSlots() {
  return Array.from({ length: EQUIPPED_SLOT_COUNT }, () => null)
}

/** @deprecated recipesKnown; migraciones antiguas. */
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

export function rollSmeltDuration(rand = Math.random) {
  return SMELT_DURATION_MIN
    + (SMELT_DURATION_MAX - SMELT_DURATION_MIN) * rand()
}

export function anvilDurationForRank(rank) {
  return ANVIL_DURATION_BY_RANK[rank] ?? ANVIL_DURATION_BY_RANK[1]
}

export function placeholderFrameForRank(rank) {
  if (rank >= 3) return 'legendary_placeholder'
  if (rank >= 2) return 'rare_placeholder'
  return 'item_placeholder'
}

export function materialCostForRank(upgradeId, targetRank) {
  const def = UPGRADE_DEFS[upgradeId]
  if (!def || targetRank < 1 || targetRank > MAX_UPGRADE_RANK) return null
  return def.costs[targetRank - 1] ?? null
}

/**
 * Coste de fragmentos para forjar el rango objetivo (R2/R3).
 * @returns {{ kind: 'generic'|'specialized', amount: number } | null}
 */
export function fragmentCostForRank(upgradeId, targetRank) {
  if (targetRank === 2) {
    return { kind: 'generic', amount: GENERIC_R2_COST }
  }
  if (targetRank === 3) {
    return { kind: 'specialized', amount: SPECIALIZED_R3_COST, upgradeId }
  }
  return null
}

export function nextCraftCost(upgradeId, currentRank) {
  return materialCostForRank(upgradeId, currentRank + 1)
}

/**
 * Ranks efectivos desde sellos equipados.
 * @param {Record<string, number>} seals
 * @param {(string|null)[]} equipped
 */
export function ranksFromEquipped(seals, equipped) {
  const ranks = createEmptyUpgrades()
  for (const id of equipped ?? []) {
    if (!id) continue
    ranks[id] = seals[id] ?? 0
  }
  return ranks
}

/**
 * ¿La receta de (id, targetRank) debe listarse?
 * R1: sello en 0. R2/R3: sello previo + fragmentos suficientes.
 */
export function isAnvilRecipeVisible(seals, fragments, upgradeId, targetRank) {
  const owned = seals[upgradeId] ?? 0
  if (owned !== targetRank - 1) return false
  if (targetRank === 1) return true
  const frag = fragmentCostForRank(upgradeId, targetRank)
  if (!frag) return false
  if (frag.kind === 'generic') {
    return (fragments.generic ?? 0) >= frag.amount
  }
  return (fragments.specialized?.[upgradeId] ?? 0) >= frag.amount
}

export function canAffordSealCraft(refined, fragments, upgradeId, targetRank) {
  const def = UPGRADE_DEFS[upgradeId]
  const matCost = materialCostForRank(upgradeId, targetRank)
  if (!def || matCost == null) return false
  if ((refined[def.material] ?? 0) < matCost) return false
  const frag = fragmentCostForRank(upgradeId, targetRank)
  if (!frag) return true
  if (frag.kind === 'generic') {
    return (fragments.generic ?? 0) >= frag.amount
  }
  return (fragments.specialized?.[upgradeId] ?? 0) >= frag.amount
}

/**
 * Lista recetas visibles del yunque.
 * @returns {Array<{
 *   upgradeId: string,
 *   targetRank: number,
 *   def: object,
 *   materialCost: number,
 *   fragmentCost: object|null,
 *   affordable: boolean,
 *   requirementsText: string,
 * }>}
 */
export function listAnvilRecipes(seals, refined, fragments, { busy = false } = {}) {
  const list = []
  for (const upgradeId of UPGRADE_IDS) {
    for (let targetRank = 1; targetRank <= MAX_UPGRADE_RANK; targetRank++) {
      if (!isAnvilRecipeVisible(seals, fragments, upgradeId, targetRank)) continue
      const def = UPGRADE_DEFS[upgradeId]
      const materialCost = materialCostForRank(upgradeId, targetRank)
      const fragmentCost = fragmentCostForRank(upgradeId, targetRank)
      const affordable = !busy && canAffordSealCraft(refined, fragments, upgradeId, targetRank)
      const parts = [`${materialCost} ${def.material}`]
      if (fragmentCost?.kind === 'generic') {
        parts.push(`${fragmentCost.amount} frag. gen`)
      } else if (fragmentCost?.kind === 'specialized') {
        parts.push(`${fragmentCost.amount} frag. ${def.name}`)
      }
      list.push({
        upgradeId,
        targetRank,
        def,
        materialCost,
        fragmentCost,
        affordable,
        requirementsText: parts.join(' + '),
      })
    }
  }
  return list
}

/**
 * Consume costes e inicia forja. No modifica seals hasta completar.
 */
export function consumeSealCraftCosts(refined, fragments, upgradeId, targetRank) {
  if (!canAffordSealCraft(refined, fragments, upgradeId, targetRank)) {
    return { ok: false, reason: 'insufficient' }
  }
  const def = UPGRADE_DEFS[upgradeId]
  const matCost = materialCostForRank(upgradeId, targetRank)
  refined[def.material] -= matCost
  const frag = fragmentCostForRank(upgradeId, targetRank)
  if (frag?.kind === 'generic') {
    fragments.generic -= frag.amount
  } else if (frag?.kind === 'specialized') {
    fragments.specialized[upgradeId] -= frag.amount
  }
  return {
    ok: true,
    job: {
      upgradeId,
      targetRank,
      remaining: anvilDurationForRank(targetRank),
      duration: anvilDurationForRank(targetRank),
    },
  }
}

export function completeSealCraft(seals, upgradeId, targetRank) {
  const owned = seals[upgradeId] ?? 0
  if (owned !== targetRank - 1) {
    return { ok: false, reason: 'invalid' }
  }
  seals[upgradeId] = targetRank
  return { ok: true, rank: targetRank }
}

/**
 * Equipar sello en slot. Tipos únicos en los 4 slots.
 * @returns {{ ok: boolean, reason?: string, equipped?: (string|null)[] }}
 */
export function equipSeal(equipped, seals, upgradeId, slotIndex) {
  if (!UPGRADE_DEFS[upgradeId]) return { ok: false, reason: 'unknown' }
  if ((seals[upgradeId] ?? 0) <= 0) return { ok: false, reason: 'no_seal' }
  if (slotIndex < 0 || slotIndex >= EQUIPPED_SLOT_COUNT) {
    return { ok: false, reason: 'bad_slot' }
  }
  const next = [...equipped]
  const existing = next.findIndex((id, i) => id === upgradeId && i !== slotIndex)
  if (existing >= 0) return { ok: false, reason: 'duplicate_type' }
  next[slotIndex] = upgradeId
  return { ok: true, equipped: next }
}

export function unequipSeal(equipped, slotIndex) {
  if (slotIndex < 0 || slotIndex >= EQUIPPED_SLOT_COUNT) {
    return { ok: false, reason: 'bad_slot' }
  }
  const next = [...equipped]
  next[slotIndex] = null
  return { ok: true, equipped: next }
}

/** Sellos poseídos no instalados. */
export function unequippedSealIds(seals, equipped) {
  const worn = new Set((equipped ?? []).filter(Boolean))
  return UPGRADE_IDS.filter((id) => (seals[id] ?? 0) > 0 && !worn.has(id))
}

/**
 * Migra save antiguo (upgrades + recipesKnown) → seals + equipped.
 */
export function migrateLegacyUpgrades(upgrades, recipesKnown) {
  const seals = createEmptySeals()
  for (const id of UPGRADE_IDS) {
    seals[id] = Math.max(0, Math.min(MAX_UPGRADE_RANK, upgrades?.[id] ?? 0))
  }
  const equipped = createEmptyEquippedSlots()
  let slot = 0
  for (const id of UPGRADE_IDS) {
    if (seals[id] > 0 && slot < EQUIPPED_SLOT_COUNT) {
      equipped[slot] = id
      slot++
    }
  }
  return { seals, equipped, recipesKnown }
}

export function startSmeltJob(crude, material, rand = Math.random) {
  const recipe = SMELT_RECIPES[material]
  if (!recipe || !canSmelt(crude, material)) {
    return { ok: false, reason: 'insufficient' }
  }
  crude[material] -= recipe.crude
  const duration = rollSmeltDuration(rand)
  return {
    ok: true,
    job: {
      material,
      remaining: duration,
      duration,
      ready: false,
      refinedPending: recipe.refined,
    },
  }
}

export function tickSmeltJob(job, dt) {
  if (!job || job.ready) return job
  const remaining = Math.max(0, job.remaining - dt)
  return {
    ...job,
    remaining,
    ready: remaining <= 0,
  }
}

export function collectSmeltJob(refined, job) {
  if (!job?.ready) return { ok: false, reason: 'not_ready' }
  refined[job.material] = (refined[job.material] ?? 0) + job.refinedPending
  return { ok: true, material: job.material, amount: job.refinedPending }
}

export function tickAnvilJob(job, dt) {
  if (!job) return { job: null, completed: false }
  const remaining = Math.max(0, job.remaining - dt)
  if (remaining > 0) {
    return { job: { ...job, remaining }, completed: false }
  }
  return { job: null, completed: true, upgradeId: job.upgradeId, targetRank: job.targetRank }
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
 * eligibility.r2UpgradeIds = mejoras con sello rank >= 2.
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

/* --- Compat legacy (tests antiguos / migración) --- */

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
