import { sumSpecializedFragments } from '../config/crafting.js'

export function createLevelResult(world, levelIndex, levelName) {
  const resources = {
    bronze: world.runResources?.bronze ?? 0,
    iron: world.runResources?.iron ?? 0,
    crystal: world.runResources?.crystal ?? 0,
  }
  const fragments = {
    generic: world.runFragments?.generic ?? 0,
    specialized: sumSpecializedFragments(
      world.runFragments ?? { specialized: {} },
    ),
  }

  return {
    levelIndex,
    levelName,
    resources,
    fragments,
    totalCollected: Object.values(resources).reduce((sum, value) => sum + value, 0)
      + fragments.generic
      + fragments.specialized,
  }
}
