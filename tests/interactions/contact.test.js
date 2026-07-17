import { describe, it, expect } from 'vitest'
import { positionFromTile } from '../../src/game/entityTiles.js'
import { TILE_SIZE, PLAYER_SIZE } from '../../src/config/constants.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'
import { createTestWorld } from '../helpers/worldFactory.js'

const life = new LifeSystem()

describe('contacto continuo (excepciones documentadas)', () => {
  it('jugador y enemigo se dañan por overlap AABB, no solo por tile', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 3, y: 1 }],
      },
    )

    const player = world.player
    const enemy = world.enemies[0]

    // Mismo tile pero sin overlap AABB (jugador arriba-izq, enemigo abajo-dcha del tile)
    const p = positionFromTile(2, 1, TILE_SIZE, PLAYER_SIZE)
    player.posX = p.posX
    player.posY = p.posY
    player.tileX = 2
    player.tileY = 1

    const e = positionFromTile(3, 1, TILE_SIZE, enemy.size)
    enemy.posX = e.posX
    enemy.posY = e.posY
    enemy.tileX = 3
    enemy.tileY = 1

    life.update(world, 0.016, { addScore: () => {} })
    expect(player.alive).toBe(true)

    // Overlap parcial entre tiles adyacentes
    player.posX = e.posX - player.size + 2
    player.posY = e.posY
    life.update(world, 0.016, { addScore: () => {} })
    expect(player.alive).toBe(false)
  })

  it('victoria en portal requiere AABB estrictamente dentro', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        portal: { x: 3, y: 1, visible: true },
      },
    )

    const portal = world.portal
    // AABB del jugador (12×12) estrictamente dentro del portal (16×16)
    world.player.posX = portal.posX + 2
    world.player.posY = portal.posY + 2

    life.update(world, 0.016, { addScore: () => {} })
    expect(world.gameWon).toBe(true)
  })

  it('respawn restaura tile y posición coherentes', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      { playerSpawn: { x: 2, y: 1 } },
    )

    world.player.alive = false
    world.player.posX = 999
    world.player.tileX = 99
    life.respawn(world)

    const expected = positionFromTile(2, 1, TILE_SIZE, PLAYER_SIZE)
    expect(world.player.posX).toBe(expected.posX)
    expect(world.player.posY).toBe(expected.posY)
    expect(world.player.tileX).toBe(2)
    expect(world.player.tileY).toBe(1)
    expect(world.player.alive).toBe(true)
  })

  it('brute (14×14) contacta antes que el overlap tile-only sugeriría', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 3, y: 1, kind: 'brute' }],
      },
    )

    const player = world.player
    const enemy = world.enemies[0]
    expect(enemy.size).toBe(14)

    const e = positionFromTile(3, 1, TILE_SIZE, enemy.size)
    enemy.posX = e.posX
    enemy.posY = e.posY

    const p = positionFromTile(2, 1, TILE_SIZE, PLAYER_SIZE)
    player.posX = p.posX
    player.posY = p.posY

    life.update(world, 0.016, { addScore: () => {} })
    expect(player.alive).toBe(true)

    // Acercar hasta overlap por hitbox grande del brute
    player.posX = e.posX - player.size + 1
    player.posY = e.posY + 1
    life.update(world, 0.016, { addScore: () => {} })
    expect(player.alive).toBe(false)
  })
})
