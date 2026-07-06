import { describe, it, expect, beforeEach } from 'vitest'
import { createTestWorld } from '../helpers/worldFactory.js'
import { createScoreSystem, stepScore } from '../helpers/systems.js'
import { ScoreSystem } from '../../src/game/systems/ScoreSystem.js'

describe('ScoreSystem', () => {
  let scoreSystem

  beforeEach(() => {
    scoreSystem = createScoreSystem()
  })

  it('suma puntos base al matar enemigo', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 2, y: 1 }] },
    )

    scoreSystem.addScore(world, world.enemies[0])
    expect(world.player.score).toBe(100)
    expect(world.scorePopups).toHaveLength(1)
    expect(world.scorePopups[0].combo).toBe(false)
  })

  it('combo duplica puntos si el kill es dentro de la ventana', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 2, y: 1 }, { x: 3, y: 1 }] },
    )

    scoreSystem.addScore(world, world.enemies[0])
    scoreSystem.addScore(world, world.enemies[1])

    expect(world.player.score).toBe(300)
    expect(world.scorePopups[1].combo).toBe(true)
    expect(world.scorePopups[1].value).toBe(200)
  })

  it('combo expira tras la ventana', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 2, y: 1 }, { x: 3, y: 1 }] },
    )

    scoreSystem.addScore(world, world.enemies[0])
    stepScore(world, 1.5, scoreSystem)
    scoreSystem.addScore(world, world.enemies[1])

    expect(world.player.score).toBe(200)
    expect(world.scorePopups).toHaveLength(1)
    expect(world.scorePopups[0].combo).toBe(false)
  })

  it('elimina popups cuando expira su timer', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 2, y: 1 }] },
    )

    scoreSystem.addScore(world, world.enemies[0])
    stepScore(world, 1.5, scoreSystem)

    expect(world.scorePopups).toHaveLength(0)
  })
})
