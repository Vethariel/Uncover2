import { describe, it, expect } from 'vitest'
import { TILE_DESTRUCTIBLE } from '../../src/config/constants.js'
import { Explosion } from '../../src/game/entities/Explosion.js'
import { TILE_SIZE } from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepLife } from '../helpers/systems.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'

const life = new LifeSystem()

describe('LifeSystem — ciclo de vida', () => {
  it('invulnerabilidad tras respawn bloquea explosión y contacto', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    life.respawn(world)
    expect(world.player.invulnerableTimer).toBe(2)

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)
    expect(world.player.alive).toBe(true)
  })

  it('timer de respawn revive al jugador tras 2s si quedan vidas', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, player: { lives: 2 } },
    )

    world.player.alive = false
    world.respawnTimer = 2

    stepLife(world, 1.0)
    expect(world.player.alive).toBe(false)

    stepLife(world, 1.1)
    expect(world.player.alive).toBe(true)
    expect(world.player.tileX).toBe(2)
  })

  it('gameOver si no quedan vidas al expirar respawn', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, player: { lives: -1 } },
    )

    world.player.alive = false
    world.respawnTimer = 0.1

    stepLife(world, 0.2)
    expect(world.gameOver).toBe(true)
  })

  it('activa portal cuando no hay enemigos y el tile está vacío', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        portal: { x: 3, y: 1, visible: false },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    world.enemies[0].alive = false
    stepLife(world, 0.016)

    expect(world.portal.visible).toBe(true)
    expect(world.events).toContain('portalActive')
  })

  it('no activa portal si hay enemigo vivo', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        portal: { x: 3, y: 1, visible: false },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    stepLife(world, 0.016)
    expect(world.portal.visible).toBe(false)
  })

  it('no activa portal si el tile no está vacío', () => {
    const world = createTestWorld(
      ['#####', '#..D#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        portal: { x: 3, y: 1, visible: false },
      },
    )

    world.grid.set(3, 1, TILE_DESTRUCTIBLE)
    stepLife(world, 0.016)
    expect(world.portal.visible).toBe(false)
  })

  it('no gana si el portal no está visible', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        portal: { x: 3, y: 1, visible: false },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    const portal = world.portal
    world.player.posX = portal.posX + 2
    world.player.posY = portal.posY + 2

    stepLife(world, 0.016)
    expect(world.portal.visible).toBe(false)
    expect(world.gameWon).toBe(false)
  })

  it('timeUp resta una vida y marca timeUp', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        player: { lives: 3 },
        levelTimer: 0.5,
      },
    )

    stepLife(world, 0.6)

    expect(world.timeUp).toBe(true)
    expect(world.player.lives).toBe(2)
    expect(world.levelTimer).toBe(0)
  })

  it('timeUp con última vida provoca gameOver', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        player: { lives: 0 },
        levelTimer: 0.1,
      },
    )

    stepLife(world, 0.2)
    expect(world.gameOver).toBe(true)
  })
})
