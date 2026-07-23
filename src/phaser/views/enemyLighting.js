import { MAX_LIGHT } from '../../game/systems/VisionSystem.js'

/** Sombra fría desaturada → blanco a plena luz (sprites encima de la niebla). */
const SHADOW_RGB = { r: 0x3a, g: 0x3e, b: 0x4a }

function clamp01(t) {
  return Math.max(0, Math.min(1, t))
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

/**
 * Respuesta a la luz: curva un poco más oscura en medios tonos
 * para que no “brillen” en penumbra.
 */
export function lightExposure(light, maxLight = MAX_LIGHT) {
  const t = clamp01((light ?? 0) / maxLight)
  return t * t * (3 - 2 * t) // smoothstep
}

/** Tint multiplicativo 0xRRGGBB según nivel de luz 0..MAX_LIGHT. */
export function enemyLightTint(light) {
  const e = lightExposure(light)
  // e=0 → sombra fría (menos sat/iluminación); e=1 → blanco (sprite original).
  const r = Math.round(lerp(SHADOW_RGB.r, 255, e))
  const g = Math.round(lerp(SHADOW_RGB.g, 255, e))
  const b = Math.round(lerp(SHADOW_RGB.b, 255, e))
  return (r << 16) | (g << 8) | b
}

export function multiplyTint(a, b) {
  const ar = (a >> 16) & 0xff
  const ag = (a >> 8) & 0xff
  const ab = a & 0xff
  const br = (b >> 16) & 0xff
  const bg = (b >> 8) & 0xff
  const bb = b & 0xff
  return (
    (Math.round((ar * br) / 255) << 16)
    | (Math.round((ag * bg) / 255) << 8)
    | Math.round((ab * bb) / 255)
  )
}

/**
 * Luz efectiva en el tile del enemigo (prefiere el nivel suavizado de la niebla).
 * @param {{ lightLevels?: Map<string, number>, displayedLightLevels?: Map<string, number> }} world
 * @param {{ tileX: number, tileY: number }} enemy
 */
export function enemyTileLight(world, enemy) {
  const key = `${enemy.tileX},${enemy.tileY}`
  const levels = world.displayedLightLevels ?? world.lightLevels
  return levels?.get(key) ?? 0
}
