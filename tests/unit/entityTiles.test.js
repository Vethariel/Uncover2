import { describe, it, expect } from 'vitest'
import { syncTileFromPosition, positionFromTile } from '../../src/game/entityTiles.js'
import { TILE_SIZE, PLAYER_SIZE } from '../../src/config/constants.js'
import { Player } from '../../src/game/entities/Player.js'

describe('entityTiles', () => {
  it('positionFromTile centra la hitbox en el tile', () => {
    const { posX, posY, tileX, tileY } = positionFromTile(3, 5, TILE_SIZE, PLAYER_SIZE)

    expect(tileX).toBe(3)
    expect(tileY).toBe(5)
    expect(posX).toBe(3 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2)
    expect(posY).toBe(5 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2)
  })

  it('syncTileFromPosition usa el centro de la hitbox', () => {
    const player = new Player(0, 0, 0, 0, 50, PLAYER_SIZE, 0)

    // Centro en tile (2, 1)
    player.posX = 2 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2
    player.posY = 1 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2
    syncTileFromPosition(player, TILE_SIZE)

    expect(player.tileX).toBe(2)
    expect(player.tileY).toBe(1)
  })

  it('syncTileFromPosition cambia de tile al cruzar la mitad', () => {
    const player = new Player(0, 0, 0, 0, 50, PLAYER_SIZE, 0)
    const baseX = 2 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2
    const baseY = 2 * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2

    player.posX = baseX
    player.posY = baseY
    syncTileFromPosition(player, TILE_SIZE)
    expect(player.tileX).toBe(2)

    // Avanza hasta que el centro entra en tile 3
    player.posX = baseX + TILE_SIZE
    syncTileFromPosition(player, TILE_SIZE)
    expect(player.tileX).toBe(3)
  })

  it('positionFromTile y syncTileFromPosition son inversos en spawn', () => {
    const spawned = positionFromTile(4, 7, TILE_SIZE, PLAYER_SIZE)
    const player = new Player(
      spawned.posX,
      spawned.posY,
      99,
      99,
      50,
      PLAYER_SIZE,
      0,
    )

    syncTileFromPosition(player, TILE_SIZE)
    expect(player.tileX).toBe(4)
    expect(player.tileY).toBe(7)
  })
})
