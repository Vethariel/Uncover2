export const MATERIALS = ['bronze', 'iron', 'crystal']

export const EMPTY_RESOURCES = Object.freeze({
  bronze: 0,
  iron: 0,
  crystal: 0,
})

/** Tiempo (s) y yield por material. Roca / destructible sin mena usa `rock`. */
export const MINING_PROFILES = {
  rock: { duration: 2.5, yield: 0 },
  bronze: { duration: 2.5, yield: 1 },
  iron: { duration: 2.5, yield: 1 },
  crystal: { duration: 3.5, yield: 2 },
}

export function createEmptyResources() {
  return { ...EMPTY_RESOURCES }
}

export function miningProfileFor(material) {
  return MINING_PROFILES[material] ?? MINING_PROFILES.rock
}

export function addResources(target, material, amount) {
  if (!material || amount <= 0 || !(material in target)) return
  target[material] += amount
}

export function transferResources(from, to) {
  for (const material of MATERIALS) {
    to[material] += from[material]
    from[material] = 0
  }
}

export function clearResources(target) {
  for (const material of MATERIALS) target[material] = 0
}

export function sumResources(resources) {
  return MATERIALS.reduce((total, material) => total + (resources[material] ?? 0), 0)
}
