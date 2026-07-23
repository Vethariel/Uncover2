import { PLAYER_VISION_RADIUS } from './constants.js'

/** Distancia (tiles) donde empieza el fundido a niebla. */
export const VISION_SOFT_START = 5

/** Banda (tiles) para pesos suaves de cara de muro según dx/dy del viewer. */
export const WALL_FACE_SOFT_BAND = 0.35

function clamp01(t) {
  return Math.max(0, Math.min(1, t))
}

/** Smoothstep clásico en [edge0, edge1]. */
export function smoothstep(edge0, edge1, x) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}

/**
 * 0 = sin oscurecer, 1 = niebla plena (borde del radio de visión).
 */
export function visionEdgeDarken(
  dist,
  softStart = VISION_SOFT_START,
  softEnd = PLAYER_VISION_RADIUS,
) {
  if (dist >= softEnd) return 1
  if (dist <= softStart) return 0
  const t = (dist - softStart) / (softEnd - softStart)
  return t * t * (3 - 2 * t)
}

/**
 * Luz tal como se percibe en pantalla: decae con el fundido de niebla del borde.
 * light=10 en el borde suave → valor menor; en niebla plena → 0.
 */
export function displayedLightWithVisionEdge(light, dist) {
  const edge = visionEdgeDarken(dist)
  return (light ?? 0) * (1 - edge)
}

/**
 * Peso 0..1: 1 cuando `along` es positivo (viewer en ese lado),
 * fundido en ±band alrededor de 0.
 */
export function wallFaceWeight(along, band = WALL_FACE_SOFT_BAND) {
  return smoothstep(-band, band, along)
}

/**
 * Interpolación bilineal de luces de cuartos.
 * u,v en 0..1 dentro del tile (0 = oeste/norte).
 */
export function bilinearQuarterLight(lights, u, v, Q_NW, Q_NE, Q_SW, Q_SE) {
  const nw = lights[Q_NW] ?? 0
  const ne = lights[Q_NE] ?? 0
  const sw = lights[Q_SW] ?? 0
  const se = lights[Q_SE] ?? 0
  const top = nw + (ne - nw) * u
  const bot = sw + (se - sw) * u
  return top + (bot - top) * v
}
