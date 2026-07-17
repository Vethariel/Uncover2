import { describe, it, expect } from 'vitest'
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

  it('completa el nivel al pisar cualquiera de los tiles de la puerta', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        exitDoor: { tiles: [{ x: 3, y: 1 }] },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    world.player.tileX = 3
    world.player.tileY = 1
    stepLife(world, 0.016)

    expect(world.gameWon).toBe(true)
    expect(world.events).toContain('levelExit')
  })

  it('la puerta permanece abierta aunque haya enemigos vivos', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        exitDoor: { tiles: [{ x: 3, y: 1 }] },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    world.player.tileX = 3
    world.player.tileY = 1
    stepLife(world, 0.016)
    expect(world.gameWon).toBe(true)
  })

  it('no gana mientras no pisa la puerta', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        exitDoor: { tiles: [{ x: 3, y: 1 }] },
      },
    )

    stepLife(world, 0.016)
    expect(world.gameWon).toBe(false)
  })

  it('el temporizador opcional termina el intento', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 1, y: 1 } },
    )

    world.levelTimer = 0.1
    stepLife(world, 0.2)
    expect(world.levelTimer).toBe(0)
    expect(world.gameOver).toBe(true)
    expect(world.events).toContain('levelTimeExpired')
  })

})
