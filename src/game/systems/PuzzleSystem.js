import { TILE_EMPTY } from '../../config/constants.js'
import { addResources } from '../../config/miningTypes.js'
import {
  PUZZLE_FLASH_DURATION,
  clonePuzzleReward,
  createPuzzleState,
} from '../../config/puzzleTypes.js'

function tileKey(x, y) {
  return `${x},${y}`
}

function isNearChest(player, chest) {
  const dx = Math.abs(player.tileX - chest.x)
  const dy = Math.abs(player.tileY - chest.y)
  return dx + dy <= 1
}

function findChestSpawn(world, player) {
  const occupied = new Set()
  for (const tablet of world.puzzleTablets ?? []) {
    occupied.add(tileKey(tablet.x, tablet.y))
  }
  for (const door of [world.entryDoor, world.exitDoor]) {
    for (const tile of [...(door?.tiles ?? []), ...(door?.triggerTiles ?? [])]) {
      occupied.add(tileKey(tile.x, tile.y))
    }
  }

  const maxRadius = 4
  for (let radius = 1; radius <= maxRadius; radius++) {
    const candidates = []
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (Math.abs(dx) + Math.abs(dy) !== radius) continue
        const x = player.tileX + dx
        const y = player.tileY + dy
        if (!world.grid.inBounds(x, y)) continue
        if (world.grid.get(x, y) !== TILE_EMPTY) continue
        if (occupied.has(tileKey(x, y))) continue
        if (x === player.tileX && y === player.tileY) continue
        candidates.push({ x, y })
      }
    }
    if (candidates.length) {
      return candidates[0]
    }
  }
  return null
}

export function isNearOpenableChest(world, player) {
  const chest = world.chest
  if (!chest || chest.opened || !player?.alive) return false
  return isNearChest(player, chest)
}

export class PuzzleSystem {
  update(world, dt, input) {
    if (!world.puzzle) world.puzzle = createPuzzleState()
    if (!world.puzzleTablets) world.puzzleTablets = []

    this._updateFlashes(world, dt)

    const player = world.player
    if (!player?.alive) return

    this._handleChestInteract(world, player, input)
    this._handleTabletStep(world, player)
  }

  _updateFlashes(world, dt) {
    if (world.puzzle.flashTimer <= 0) return
    world.puzzle.flashTimer = Math.max(0, world.puzzle.flashTimer - dt)
    if (world.puzzle.flashTimer > 0) return

    for (const tablet of world.puzzleTablets) {
      if (tablet.visual === 'flashGreen') {
        tablet.visual = 'on'
      } else if (tablet.visual === 'flashRed') {
        tablet.visual = 'off'
      }
    }
  }

  _handleTabletStep(world, player) {
    if (world.puzzle.completed) {
      world.puzzle.lastPlayerTile = tileKey(player.tileX, player.tileY)
      return
    }

    const currentKey = tileKey(player.tileX, player.tileY)
    if (world.puzzle.lastPlayerTile === currentKey) return
    world.puzzle.lastPlayerTile = currentKey

    const tablet = world.puzzleTablets.find(
      (entry) => entry.x === player.tileX && entry.y === player.tileY,
    )
    if (!tablet) return

    if (tablet.order === world.puzzle.nextExpected) {
      tablet.visual = 'flashGreen'
      world.puzzle.flashTimer = PUZZLE_FLASH_DURATION
      world.puzzle.nextExpected += 1
      world.events.push('puzzleStep')

      if (world.puzzle.nextExpected >= world.puzzleTablets.length) {
        this._completePuzzle(world, player)
      }
      return
    }

    for (const entry of world.puzzleTablets) {
      entry.visual = 'flashRed'
    }
    world.puzzle.nextExpected = 0
    world.puzzle.flashTimer = PUZZLE_FLASH_DURATION
    world.events.push('puzzleFail')
  }

  _completePuzzle(world, player) {
    world.puzzle.completed = true
    world.events.push('puzzleComplete')

    if (world.chest) return
    const spawn = findChestSpawn(world, player)
    if (!spawn) return

    const reward = clonePuzzleReward(
      world.levelVisualConfig?.puzzleReward
        ?? world.puzzleReward
        ?? undefined,
    )
    world.chest = {
      x: spawn.x,
      y: spawn.y,
      opened: false,
      reward,
    }
  }

  _handleChestInteract(world, player, input) {
    const chest = world.chest
    if (!chest || chest.opened) return
    if (!input?.isJustDown?.('interact')) return
    if (!isNearChest(player, chest)) return

    for (const [material, amount] of Object.entries(chest.reward ?? {})) {
      addResources(world.runResources, material, amount ?? 0)
    }
    chest.opened = true
    world.events.push('chestOpen')
  }
}
