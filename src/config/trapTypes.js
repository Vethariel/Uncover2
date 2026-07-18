export const DART_WARNING_DURATION = 0.7
export const DART_STEP_INTERVAL = 0.12
export const DART_MIN_DISTANCE = 3

export function createTrap({
  id,
  plate,
  launcher,
  dir,
}) {
  return {
    id,
    plate: { ...plate },
    launcher: { ...launcher },
    dir: { ...dir },
    state: 'idle',
    warningTimer: 0,
    occupiedLastFrame: false,
  }
}

export function createDart({
  tileX,
  tileY,
  dir,
  trapId,
}) {
  return {
    tileX,
    tileY,
    dir: { ...dir },
    stepTimer: DART_STEP_INTERVAL,
    trapId,
    alive: true,
  }
}
