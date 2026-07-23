/** Retratos de diálogo 128×128. */

export const PLAYER_EXPRESSIONS = Object.freeze([
  'calm',
  'angry',
  'tired',
  'embarrassed',
  'smirk',
  'surprised',
  'thoughtful',
  'happy',
])

export const EXCAVATOR_EXPRESSIONS = Object.freeze([
  'stern',
  'thoughtful',
  'correcting',
  'approving',
  'dismissive',
])

export const BRUN_EXPRESSIONS = Object.freeze([
  'warm',
  'happy',
  'concerned',
  'smirk',
  'wistful',
])

export const DEFAULT_PLAYER_EXPRESSION = 'calm'
export const DEFAULT_EXCAVATOR_EXPRESSION = 'stern'
export const DEFAULT_BRUN_EXPRESSION = 'warm'

/** Textura única: inscripción / fragmento en la peña. */
export const FRAGMENT_PORTRAIT_KEY = 'portrait_fragment'

/**
 * @param {'player'|'excavator'|'smith'|'fragment'|string|null} portrait
 * @param {string|null|undefined} expression
 */
export function portraitTextureKey(portrait, expression) {
  if (portrait === 'fragment' || portrait === 'narrator') {
    return FRAGMENT_PORTRAIT_KEY
  }
  if (portrait === 'player') {
    const name = PLAYER_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_PLAYER_EXPRESSION
    return `portrait_player_${name}`
  }
  if (portrait === 'excavator') {
    const name = EXCAVATOR_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_EXCAVATOR_EXPRESSION
    return `portrait_excavator_${name}`
  }
  if (portrait === 'smith') {
    const name = BRUN_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_BRUN_EXPRESSION
    return `portrait_brun_${name}`
  }
  return null
}

/** @deprecated use portraitTextureKey('player', expression) */
export function playerPortraitKey(expression) {
  return portraitTextureKey('player', expression)
}
