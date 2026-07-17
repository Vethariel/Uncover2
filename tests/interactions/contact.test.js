import { describe, it, expect } from 'vitest'
import { positionFromTile } from '../../src/game/entityTiles.js'
import { TILE_SIZE, PLAYER_SIZE } from '../../src/config/constants.js'
import { LifeSystem } from '../../src/game/systems/LifeSystem.js'
import { createTestWorld } from '../helpers/worldFactory.js'

const life = new LifeSystem()

describe('contacto continuo (excepciones documentadas)', () => {
  it('golem básico pasivo no daña por contacto', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 3, y: 1 }],
      },
    )

    const player = world.player
    const enemy = world.enemies[0]
    expect(enemy.aggressive).toBe(false)

    const e = positionFromTile(3, 1, TILE_SIZE, enemy.size)
    enemy.posX = e.posX
    enemy.posY = e.posY
    player.posX = e.posX - player.size + 2
    player.posY = e.posY

    life.update(world, 0.016)
    expect(player.lives).toBe(3)
    expect(player.invulnerableTimer).toBe(0)
  })

  it('golem básico agresivo y espíritu dañan por overlap AABB', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 3, y: 1 }],
      },
    )

    const player = world.player
    const enemy = world.enemies[0]
    enemy.setAggressive(true)

    const e = positionFromTile(3, 1, TILE_SIZE, enemy.size)
    enemy.posX = e.posX
    enemy.posY = e.posY
    enemy.tileX = 3
    enemy.tileY = 1

    const p = positionFromTile(2, 1, TILE_SIZE, PLAYER_SIZE)
    player.posX = p.posX
    player.posY = p.posY
    player.tileX = 2
    player.tileY = 1

    life.update(world, 0.016)
    expect(player.lives).toBe(3)

    player.posX = e.posX - player.size + 2
    player.posY = e.posY
    life.update(world, 0.016)
    expect(player.alive).toBe(true)
    expect(player.lives).toBe(2)
    expect(player.invulnerableTimer).toBeGreaterThan(0)
  })

  it('victoria en puerta usa el tile lógico del jugador', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 1, y: 1 },
        exitDoor: { tiles: [{ x: 3, y: 1 }] },
      },
    )

    world.player.tileX = 3
    world.player.tileY = 1

    life.update(world, 0.016)
    expect(world.gameWon).toBe(true)
  })

  it('golem_advanced (28×28) contacta antes que el overlap tile-only sugeriría', () => {
    const world = createTestWorld(
      ['#####', '#...#', '#####'],
      {
        playerSpawn: { x: 2, y: 1 },
        enemies: [{ x: 3, y: 1, kind: 'golem_advanced' }],
      },
    )

    const player = world.player
    const enemy = world.enemies[0]
    expect(enemy.size).toBe(28)

    const e = positionFromTile(3, 1, TILE_SIZE, enemy.size)
    enemy.posX = e.posX
    enemy.posY = e.posY

    const p = positionFromTile(2, 1, TILE_SIZE, PLAYER_SIZE)
    player.posX = p.posX
    player.posY = p.posY

    life.update(world, 0.016)
    expect(player.alive).toBe(true)

    // Acercar hasta overlap por hitbox grande del golem avanzado
    player.posX = e.posX - player.size + 1
    player.posY = e.posY + 1
    life.update(world, 0.016)
    expect(player.alive).toBe(true)
    expect(player.lives).toBe(2)
  })
})
