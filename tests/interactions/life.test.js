import { describe, it, expect } from 'vitest'
import { Explosion } from '../../src/game/entities/Explosion.js'
import {
  PLAYER_ESCAPE_DURATION,
  PLAYER_HURT_ANIMATION_DURATION,
  PLAYER_INVULNERABLE_DURATION,
  TILE_SIZE,
} from '../../src/config/constants.js'
import { createTestWorld } from '../helpers/worldFactory.js'
import { stepLife } from '../helpers/systems.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'

const life = new LifeSystem()

describe('LifeSystem — ciclo de vida', () => {
  it('un golpe no letal resta una vida sin mover ni matar al jugador', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        player: { lives: 3 },
      },
    )

    const initialPosition = {
      posX: world.player.posX,
      posY: world.player.posY,
      tileX: world.player.tileX,
      tileY: world.player.tileY,
    }

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.player.lives).toBe(2)
    expect(world.player.alive).toBe(true)
    expect(world.player).toMatchObject(initialPosition)
    expect(world.player.hurtAnimationTimer).toBe(PLAYER_HURT_ANIMATION_DURATION)
    expect(world.player.invulnerableTimer).toBe(PLAYER_INVULNERABLE_DURATION)
    expect(world.events).toContain('playerDamaged')
    expect(world.events).not.toContain('playerDeath')
  })

  it('la invulnerabilidad evita daño repetido por explosión y contacto', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        player: { lives: 3 },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)
    stepLife(world, 0.5)
    expect(world.player.lives).toBe(2)
    expect(world.player.alive).toBe(true)

    stepLife(world, 0.1)
    expect(world.player.hurtAnimationTimer).toBe(0)
    expect(world.player.invulnerableTimer).toBeCloseTo(1.4)
  })

  it('el golpe en la última vida produce muerte y después game over', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 }, player: { lives: 1 } },
    )

    world.explosions.push(new Explosion(2, 1, TILE_SIZE))
    stepLife(world, 0.016)

    expect(world.player.lives).toBe(0)
    expect(world.player.alive).toBe(false)
    expect(world.gameOver).toBe(false)
    expect(world.playerDeathTimer).toBe(PLAYER_ESCAPE_DURATION)
    expect(world.events).toContain('playerDeath')

    stepLife(world, PLAYER_ESCAPE_DURATION + 0.1)
    expect(world.gameOver).toBe(true)
  })

  it('completa el nivel solo al pisar el centro de la puerta', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        exitDoor: {
          tiles: [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
          triggerTiles: [{ x: 2, y: 1 }],
        },
        enemies: [{ x: 2, y: 1 }],
      },
    )

    world.player.tileX = 3
    world.player.tileY = 1
    stepLife(world, 0.016)
    expect(world.gameWon).toBe(false)

    world.player.tileX = 2
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
