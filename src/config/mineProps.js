/** Props de mina: 9 frames de 32×32 en fila. */

export const MINE_PROPS_TEXTURE = 'mineProps'
export const MINE_PROP_FRAME_W = 32
export const MINE_PROP_FRAME_H = 32

/** Índices en el sheet (izq → der). */
export const MINE_PROP_FRAME = Object.freeze({
  bronze: 0,
  iron: 1,
  crystal: 2,
  destructible1: 3,
  destructible2: 4,
  destructible3: 5,
  plateIdle: 6,
  plateActive: 7,
  /** Casilla de lanzamiento; solo visible con la trampa activa. */
  launcher: 8,
})

export function preloadMineProps(loader) {
  loader.spritesheet(MINE_PROPS_TEXTURE, 'assets/sprites/mine_props.png', {
    frameWidth: MINE_PROP_FRAME_W,
    frameHeight: MINE_PROP_FRAME_H,
  })
}

/** Variante de bloque destructible genérico según posición. */
export function genericDestructibleFrame(x, y) {
  const variants = [
    MINE_PROP_FRAME.destructible1,
    MINE_PROP_FRAME.destructible2,
    MINE_PROP_FRAME.destructible3,
  ]
  return variants[(x + y) % 3]
}

/** Frame de mena según material. */
export function resourceBlockFrame(material) {
  if (material === 'bronze') return MINE_PROP_FRAME.bronze
  if (material === 'iron') return MINE_PROP_FRAME.iron
  if (material === 'crystal') return MINE_PROP_FRAME.crystal
  return MINE_PROP_FRAME.destructible1
}
