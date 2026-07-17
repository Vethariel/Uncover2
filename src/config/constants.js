export const TILE_SIZE = 32
export const VIEW_TILES_X = 20
export const VIEW_TILES_Y = 11
export const HUD_HEIGHT = 28
// Buffer interno 16:9 (640×360): se escala con Scale.FIT a cualquier ventana.
export const INTERNAL_WIDTH = 640
export const INTERNAL_HEIGHT = 360

// ── Modelo de espacio (ver docs/DESIGN.md) ────────────────────────────────
// TILE_SIZE: rejilla lógica del juego (32×32).
// PLAYER_SIZE / ENEMY_SIZE: hitbox de movimiento y contacto (24×24 dentro del tile).
// Cámara: centra al jugador; mapas procedurales mayores al viewport.
// Render provisional: figuras primitivas independientes de las hitboxes.
// Reglas de juego (bombas, explosiones, trampas, IA): por tile (tileX, tileY).

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

export const PLAYER_SPEED = 100
export const PLAYER_SIZE = 24
export const PLAYER_LIVES = 3
export const PLAYER_BOMB_RANGE = 1
export const PLAYER_MAX_BOMBS = 1
export const PLAYER_VISION_RADIUS = 7

export const DIR_NONE = 0
export const DIR_UP = 1
export const DIR_DOWN = 2
export const DIR_LEFT = 3
export const DIR_RIGHT = 4

export const ENEMY_SIZE = 24
export const ENEMY_SPEED = 60
