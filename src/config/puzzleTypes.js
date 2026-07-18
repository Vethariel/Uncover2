export const PUZZLE_FLASH_DURATION = 0.35

export const DEFAULT_PUZZLE_REWARD = Object.freeze({
  bronze: 3,
  iron: 2,
  crystal: 1,
})

export function createPuzzleState() {
  return {
    nextExpected: 0,
    completed: false,
    flashTimer: 0,
    lastPlayerTile: null,
  }
}

export function clonePuzzleReward(reward = DEFAULT_PUZZLE_REWARD) {
  return {
    bronze: reward.bronze ?? 0,
    iron: reward.iron ?? 0,
    crystal: reward.crystal ?? 0,
  }
}
