import {
  DIR_UP,
  DIR_DOWN,
  DIR_LEFT,
  DIR_RIGHT,
} from '../../src/config/constants.js'
import { CollisionSystem } from '../../src/game/systems/CollisionSystem.js'
import { BombSystem } from '../../src/game/systems/BombSystem.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'
import { InputSystem } from '../../src/game/systems/InputSystem.js'
import { MiningSystem } from '../../src/game/systems/MiningSystem.js'
import { FragmentExtractSystem } from '../../src/game/systems/FragmentExtractSystem.js'
import { PuzzleSystem } from '../../src/game/systems/PuzzleSystem.js'
import { TrapSystem } from '../../src/game/systems/TrapSystem.js'
import { GameLoop } from '../../src/game/GameLoop.js'
import { mockInput } from './worldFactory.js'

const collision = new CollisionSystem()
const bomb = new BombSystem()
const life = new LifeSystem()
const input = new InputSystem()
const mining = new MiningSystem()
const fragments = new FragmentExtractSystem()
const puzzle = new PuzzleSystem()
const traps = new TrapSystem(life)
const gameLoop = new GameLoop()

export function stepCollision(world, dt, direction) {
  const player = world.player
  const prevFacing = player.desiredFacing
  if (direction !== undefined) player.desiredFacing = direction
  collision.update(world, dt)
  if (direction !== undefined) player.desiredFacing = prevFacing
}

export function stepBomb(world, dt) {
  bomb.update(world, dt)
}

export function stepLife(world, dt) {
  life.update(world, dt)
}

export function stepGameLoop(world, dt, keys = {}) {
  return gameLoop.update(world, dt, mockInput(keys))
}

export function stepInput(world, keys) {
  input.update(world, mockInput(keys))
}

export function stepMining(world, dt, keys = {}) {
  mining.update(world, dt, mockInput(keys))
}

export function stepFragments(world, dt, keys = {}) {
  fragments.update(world, dt, mockInput(keys))
}

export function stepPuzzle(world, dt = 0, keys = {}) {
  puzzle.update(world, dt, mockInput(keys))
}

export function stepTrap(world, dt = 0) {
  traps.update(world, dt)
}

export function explodeBomb(world, bombIndex = 0) {
  bomb.explode(world, world.bombs[bombIndex])
  // La expansión en anillos es asíncrona (BLAST_EXPAND_DELAY); los tests
  // síncronos necesitan ver el blast completo.
  flushPendingBlastWaves(world)
}

/** Avanza todas las ondas de blast pendientes hasta agotarlas. */
export function flushPendingBlastWaves(world) {
  let guard = 64
  while ((world.pendingBlastWaves ?? []).length > 0 && guard-- > 0) {
    for (const wave of world.pendingBlastWaves) {
      wave.timer = 0
    }
    bomb.updatePendingBlastWaves(world, 0)
  }
}

export { DIR_UP, DIR_DOWN, DIR_LEFT, DIR_RIGHT }
