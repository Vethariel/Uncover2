import { describe, it, expect } from 'vitest'
import {
  POWERUP_BOMB_AMOUNT,
  POWERUP_RANGE_AMOUNT,
  POWERUP_SPEED_AMOUNT,
} from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepPowerUp } from '../helpers/systems.js'

describe('PowerUpSystem — efectos', () => {
  const map = ['#####', '#...#', '#####']

  it('bomb aumenta maxBombs', () => {
    const world = createTestWorld(map, {
      playerSpawn: { x: 2, y: 1 },
      powerUps: [{ x: 2, y: 1, kind: 'bomb' }],
    })

    stepPowerUp(world)
    expect(world.player.maxBombs).toBe(1 + POWERUP_BOMB_AMOUNT)
  })

  it('range aumenta bombRange', () => {
    const world = createTestWorld(map, {
      playerSpawn: { x: 2, y: 1 },
      powerUps: [{ x: 2, y: 1, kind: 'range' }],
    })

    stepPowerUp(world)
    expect(world.player.bombRange).toBe(1 + POWERUP_RANGE_AMOUNT)
  })

  it('speed aumenta velocidad', () => {
    const world = createTestWorld(map, {
      playerSpawn: { x: 2, y: 1 },
      powerUps: [{ x: 2, y: 1, kind: 'speed' }],
    })

    const base = world.player.speed
    stepPowerUp(world)
    expect(world.player.speed).toBe(base + POWERUP_SPEED_AMOUNT)
  })

  it('life aumenta vidas', () => {
    const world = createTestWorld(map, {
      playerSpawn: { x: 2, y: 1 },
      player: { lives: 2 },
      powerUps: [{ x: 2, y: 1, kind: 'life' }],
    })

    stepPowerUp(world)
    expect(world.player.lives).toBe(3)
  })
})
