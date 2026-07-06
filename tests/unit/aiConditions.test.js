import { describe, it, expect } from 'vitest'
import { BT_SUCCESS, BT_FAILURE } from '../../src/game/ai/behaviorTree.js'
import { IsPlayerInLine } from '../../src/game/ai/conditions/isPlayerInLine.js'
import { IsPlayerNear } from '../../src/game/ai/conditions/isPlayerNear.js'
import { IsInDanger } from '../../src/game/ai/conditions/isInDanger.js'
import { Bomb } from '../../src/game/entities/Bomb.js'
import { TILE_SIZE } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'

describe('condiciones de IA', () => {
  it('IsPlayerInLine: éxito con línea horizontal libre', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      { playerSpawn: { x: 5, y: 1 }, enemies: [{ x: 1, y: 1 }] },
    )

    const node = new IsPlayerInLine()
    expect(node.tick(world.enemies[0], world)).toBe(BT_SUCCESS)
  })

  it('IsPlayerInLine: falla si hay pared entre enemigo y jugador', () => {
    const world = createTestWorld(
      ['#######', '#..#..#', '#######'],
      { playerSpawn: { x: 5, y: 1 }, enemies: [{ x: 1, y: 1 }] },
    )

    const node = new IsPlayerInLine()
    expect(node.tick(world.enemies[0], world)).toBe(BT_FAILURE)
  })

  it('IsPlayerNear: éxito dentro del radio Manhattan', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 3, y: 1 }, enemies: [{ x: 1, y: 1 }] },
    )

    const node = new IsPlayerNear(4)
    expect(node.tick(world.enemies[0], world)).toBe(BT_SUCCESS)
  })

  it('IsPlayerNear: falla fuera del radio', () => {
    const world = createTestWorld(
      ['#######', '#.....#', '#######'],
      { playerSpawn: { x: 5, y: 1 }, enemies: [{ x: 1, y: 1 }] },
    )

    const node = new IsPlayerNear(2)
    expect(node.tick(world.enemies[0], world)).toBe(BT_FAILURE)
  })

  it('IsInDanger: éxito sobre tile peligroso', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 2, y: 1 }] },
    )

    world.bombs.push(new Bomb(2, 1, TILE_SIZE, world.player, 1, 1.0))

    const node = new IsInDanger()
    expect(node.tick(world.enemies[0], world)).toBe(BT_SUCCESS)
  })

  it('IsInDanger: falla en tile seguro', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 }, enemies: [{ x: 3, y: 1 }] },
    )

    const node = new IsInDanger()
    expect(node.tick(world.enemies[0], world)).toBe(BT_FAILURE)
  })
})
