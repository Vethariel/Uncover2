export const TILE_SIZE = 16
export const TILES_X = 17
export const TILES_Y = 13
export const HUD_HEIGHT = 24
export const LEVEL_TIMER = 180
export const INTERNAL_WIDTH = TILE_SIZE * TILES_X
export const INTERNAL_HEIGHT = TILE_SIZE * TILES_Y + HUD_HEIGHT
export const GAME_OFFSET_Y = HUD_HEIGHT

// ── Modelo de espacio (ver docs/DESIGN.md) ────────────────────────────────
// TILE_SIZE: rejilla lógica del juego (16×16).
// PLAYER_SIZE / ENEMY_SIZE: hitbox de movimiento y contacto (12×12 dentro del tile).
// Sprites: 32×32 en render — solo presentación, no definen reglas de gameplay.
// Reglas de juego (bombas, explosiones, power-ups, trampas, IA): por tile (tileX, tileY).

export const TILE_EMPTY = 0
export const TILE_WALL = 1
export const TILE_DESTRUCTIBLE = 2
export const TILE_PASS = 3
export const TILE_EXPLOSION = 4

export const TMJ_EMPTY = 0
export const TMJ_WALL = 1
export const TMJ_DESTRUCTIBLE = 2
export const TMJ_PASS = 3

export const BG_LAYER_NAMES = ['Background', 'Background2', 'Ground', 'Obstacles', 'Bridge']

export const PLAYER_SPEED = 50
export const PLAYER_SIZE = 12
export const PLAYER_LIVES = 3
export const PLAYER_BOMB_RANGE = 1
export const PLAYER_MAX_BOMBS = 1

export const DIR_NONE = 0
export const DIR_UP = 1
export const DIR_DOWN = 2
export const DIR_LEFT = 3
export const DIR_RIGHT = 4

export const ENEMY_SIZE = 12
export const ENEMY_SPEED = 30

export const POWERUP_POOL_RATIO = 0.3
export const POWERUP_LIFE_CHANCE = 0.05

export const POWERUP_WEIGHTS = {
  bomb: 3,
  range: 3,
  speed: 2,
}

export const POWERUP_BOMB_AMOUNT = 1
export const POWERUP_RANGE_AMOUNT = 1
export const POWERUP_SPEED_AMOUNT = 20
