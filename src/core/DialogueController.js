import {
  DEFAULT_BRUN_EXPRESSION,
  DEFAULT_EXCAVATOR_EXPRESSION,
  DEFAULT_PLAYER_EXPRESSION,
  BRUN_EXPRESSIONS,
  EXCAVATOR_EXPRESSIONS,
  PLAYER_EXPRESSIONS,
} from '../config/portraitExpressions.js'

const DEFAULT_CHARS_PER_SECOND = 40

function normalizeExpression(portrait, expression) {
  if (portrait === 'player') {
    return PLAYER_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_PLAYER_EXPRESSION
  }
  if (portrait === 'excavator') {
    return EXCAVATOR_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_EXCAVATOR_EXPRESSION
  }
  if (portrait === 'smith') {
    return BRUN_EXPRESSIONS.includes(expression)
      ? expression
      : DEFAULT_BRUN_EXPRESSION
  }
  return null
}

function normalizeEntry(entry) {
  if (typeof entry === 'string') {
    return {
      speaker: '',
      text: entry,
      portrait: null,
      expression: null,
      animation: null,
    }
  }
  const portrait = entry?.portrait ?? null
  return {
    speaker: entry?.speaker ?? '',
    text: entry?.text ?? '',
    portrait,
    expression: normalizeExpression(portrait, entry?.expression ?? null),
    animation: entry?.animation ?? null,
  }
}

/**
 * Estado puro del diálogo. La escena sigue viva mientras el GameLoop queda
 * detenido, permitiendo añadir animaciones guionadas sin devolver control.
 */
export class DialogueController {
  constructor(charsPerSecond = DEFAULT_CHARS_PER_SECOND) {
    this.charsPerSecond = charsPerSecond
    this.entries = []
    this.entryIndex = 0
    this.visibleCharacters = 0
    this.characterAccumulator = 0
    this.active = false
  }

  start(entries) {
    this.entries = (entries ?? []).map(normalizeEntry)
    this.entryIndex = 0
    this.visibleCharacters = 0
    this.characterAccumulator = 0
    this.active = this.entries.length > 0
    return this.currentEntry
  }

  update(dt) {
    if (!this.active || this.isCurrentComplete) return false
    this.characterAccumulator += Math.max(0, dt) * this.charsPerSecond
    const amount = Math.floor(this.characterAccumulator)
    if (amount <= 0) return false

    this.characterAccumulator -= amount
    this.visibleCharacters = Math.min(
      this.currentCharacters.length,
      this.visibleCharacters + amount,
    )
    return true
  }

  advance() {
    if (!this.active) return { type: 'inactive' }

    if (!this.isCurrentComplete) {
      this.revealCurrent()
      return { type: 'revealed', entry: this.currentEntry }
    }

    if (this.entryIndex < this.entries.length - 1) {
      this.entryIndex += 1
      this.visibleCharacters = 0
      this.characterAccumulator = 0
      return { type: 'next', entry: this.currentEntry }
    }

    this.active = false
    return { type: 'finished' }
  }

  revealCurrent() {
    this.visibleCharacters = this.currentCharacters.length
    this.characterAccumulator = 0
  }

  get currentEntry() {
    return this.entries[this.entryIndex] ?? null
  }

  get currentCharacters() {
    return Array.from(this.currentEntry?.text ?? '')
  }

  get visibleText() {
    return this.currentCharacters.slice(0, this.visibleCharacters).join('')
  }

  get isCurrentComplete() {
    return this.visibleCharacters >= this.currentCharacters.length
  }

  get hasNext() {
    return this.active
      && this.isCurrentComplete
      && this.entryIndex < this.entries.length - 1
  }
}
