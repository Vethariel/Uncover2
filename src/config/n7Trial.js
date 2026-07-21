import { sumSpecializedFragments } from './crafting.js'

/** Índice 0-based de N7. */
export const N7_LEVEL_INDEX = 6

/** 6 minutos — ventana de trabajo del umbral. */
export const N7_TIME_LIMIT_SEC = 360

/** Pesos del recuento (tomar con juicio > vaciar a fogonazos). */
export const N7_SCORE_WEIGHTS = {
  bronze: 1,
  iron: 2,
  crystal: 3,
  fragmentGeneric: 2,
  fragmentSpecialized: 3,
}

/**
 * Cuota por defecto si el nivel no define `trialQuota`.
 * ~1.4× resourceCap con mixto bronce/hierro.
 */
export function defaultTrialQuota(resourceCap = 10) {
  return Math.ceil(resourceCap * 1.4)
}

export function scoreRun(resources, fragments) {
  const r = resources ?? {}
  const f = fragments ?? { generic: 0, specialized: {} }
  const specialized = sumSpecializedFragments(f)
  return (r.bronze ?? 0) * N7_SCORE_WEIGHTS.bronze
    + (r.iron ?? 0) * N7_SCORE_WEIGHTS.iron
    + (r.crystal ?? 0) * N7_SCORE_WEIGHTS.crystal
    + (f.generic ?? 0) * N7_SCORE_WEIGHTS.fragmentGeneric
    + specialized * N7_SCORE_WEIGHTS.fragmentSpecialized
}

export function materialScoreWeight(material) {
  return N7_SCORE_WEIGHTS[material] ?? N7_SCORE_WEIGHTS.bronze
}

/**
 * @returns {{ score: number, quota: number, passed: boolean, waste: number }}
 */
export function evaluateN7Trial(world, levelSpec = {}) {
  const raw = scoreRun(world.runResources, world.runFragments)
  const waste = world.trialWastedScore ?? 0
  const score = Math.max(0, raw - waste)
  const quota = levelSpec.trialQuota
    ?? defaultTrialQuota(levelSpec.resourceCap ?? 10)
  return {
    score,
    quota,
    passed: score >= quota,
    waste,
    raw,
  }
}

export function isN7Level(levelIndex) {
  return levelIndex === N7_LEVEL_INDEX
}
